type RedisResponse<T> = {
  result?: T;
  error?: string;
};

const redisUrl =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export function hasRedisStorage() {
  return Boolean(redisUrl && redisToken);
}

export async function redisCommand<T>(command: unknown[]) {
  if (!redisUrl || !redisToken) {
    throw new Error("STORAGE_NOT_CONFIGURED");
  }

  const response = await fetch(redisUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  const data = (await response.json()) as RedisResponse<T>;

  if (!response.ok || data.error) {
    throw new Error(data.error ?? "REDIS_REQUEST_FAILED");
  }

  return data.result;
}

export async function redisGetJson<T>(key: string) {
  const value = await redisCommand<string | null>(["GET", key]);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
}

export async function redisSetJson(
  key: string,
  value: unknown,
  expiresInSeconds?: number,
) {
  const command: unknown[] = ["SET", key, JSON.stringify(value)];

  if (expiresInSeconds) {
    command.push("EX", expiresInSeconds);
  }

  await redisCommand(command);
}
