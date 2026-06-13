import { hasRedisStorage, redisCommand, redisGetJson, redisSetJson } from "./kv";

const MAX_ATTEMPTS = 3;
const LOCK_TIME_MS = 2 * 60 * 1000;
const LOCK_TIME_SECONDS = LOCK_TIME_MS / 1000;

type AttemptState = {
  count: number;
  lockedUntil?: number;
};

const globalForAttempts = globalThis as typeof globalThis & {
  loginAttempts?: Map<string, AttemptState>;
};

const attempts = globalForAttempts.loginAttempts ?? new Map<string, AttemptState>();
globalForAttempts.loginAttempts = attempts;

function attemptKey(key: string) {
  return `login-attempt:${key}`;
}

export async function getLockStatus(key: string) {
  if (hasRedisStorage()) {
    const attempt = await redisGetJson<AttemptState>(attemptKey(key));

    if (!attempt?.lockedUntil) {
      return { locked: false, secondsLeft: 0 };
    }

    const secondsLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);

    if (secondsLeft <= 0) {
      await redisCommand(["DEL", attemptKey(key)]);
      return { locked: false, secondsLeft: 0 };
    }

    return { locked: true, secondsLeft };
  }

  const attempt = attempts.get(key);

  if (!attempt?.lockedUntil) {
    return { locked: false, secondsLeft: 0 };
  }

  const secondsLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);

  if (secondsLeft <= 0) {
    attempts.delete(key);
    return { locked: false, secondsLeft: 0 };
  }

  return { locked: true, secondsLeft };
}

export async function recordFailedLogin(key: string) {
  if (hasRedisStorage()) {
    const current =
      (await redisGetJson<AttemptState>(attemptKey(key))) ?? { count: 0 };
    const nextCount = current.count + 1;

    if (nextCount >= MAX_ATTEMPTS) {
      await redisSetJson(
        attemptKey(key),
        {
          count: nextCount,
          lockedUntil: Date.now() + LOCK_TIME_MS,
        },
        LOCK_TIME_SECONDS,
      );

      return {
        locked: true,
        attemptsLeft: 0,
        secondsLeft: LOCK_TIME_SECONDS,
      };
    }

    await redisSetJson(
      attemptKey(key),
      { count: nextCount },
      LOCK_TIME_SECONDS,
    );

    return {
      locked: false,
      attemptsLeft: MAX_ATTEMPTS - nextCount,
      secondsLeft: 0,
    };
  }

  const current = attempts.get(key) ?? { count: 0 };
  const nextCount = current.count + 1;

  if (nextCount >= MAX_ATTEMPTS) {
    attempts.set(key, {
      count: nextCount,
      lockedUntil: Date.now() + LOCK_TIME_MS,
    });

    return {
      locked: true,
      attemptsLeft: 0,
      secondsLeft: LOCK_TIME_SECONDS,
    };
  }

  attempts.set(key, { count: nextCount });

  return {
    locked: false,
    attemptsLeft: MAX_ATTEMPTS - nextCount,
    secondsLeft: 0,
  };
}

export async function clearLoginAttempts(key: string) {
  if (hasRedisStorage()) {
    await redisCommand(["DEL", attemptKey(key)]);
    return;
  }

  attempts.delete(key);
}
