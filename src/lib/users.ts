import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { hasRedisStorage, redisGetJson, redisSetJson } from "./kv";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function userKey(email: string) {
  return `user:${email}`;
}

async function ensureUsersFile() {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });

  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]", "utf8");
  }
}

export async function readUsers() {
  await ensureUsersFile();
  const content = await fs.readFile(USERS_FILE, "utf8");

  try {
    return JSON.parse(content) as StoredUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (hasRedisStorage()) {
    return await redisGetJson<StoredUser>(userKey(normalizedEmail));
  }

  const users = await readUsers();

  return users.find((user) => user.email === normalizedEmail) ?? null;
}

export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (normalizedName.length < 2) {
    throw new Error("NAME_TOO_SHORT");
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    throw new Error("INVALID_EMAIL");
  }

  if (password.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
  };

  if (hasRedisStorage()) {
    await redisSetJson(userKey(normalizedEmail), user);
  } else {
    if (process.env.VERCEL) {
      throw new Error("STORAGE_NOT_CONFIGURED");
    }

    const users = await readUsers();
    await writeUsers([...users, user]);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function verifyUserPassword(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
