import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { UserSession } from "@/types";
import {
  JWT_SECRET,
  COOKIE_NAME,
  SESSION_DURATION_DAYS,
  SESSION_MAX_AGE,
  PASSWORD_SALT_ROUNDS,
} from "./constants";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string, email: string, name: string | null): string {
  return jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    { expiresIn: `${SESSION_DURATION_DAYS}d` }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function registerUser(email: string, password: string, name?: string) {
  const db = getDb();

  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing.length > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  await db.insert(users).values({
    id,
    email,
    passwordHash,
    name: name || null,
    createdAt: new Date(),
  });

  return { id, email, name };
}

export async function loginUser(email: string, password: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = createToken(user.id, user.email, user.name);
  await setSessionCookie(token);

  return { id: user.id, email: user.email, name: user.name };
}

export async function logoutUser() {
  await clearSessionCookie();
}

export async function updateUserWebhook(userId: string, webhookUrl: string) {
  const db = getDb();
  await db.update(users).set({ discordWebhookUrl: webhookUrl }).where(eq(users.id, userId));
}

export async function getUserWebhook(userId: string): Promise<string | null> {
  const db = getDb();
  const [user] = await db.select({ webhook: users.discordWebhookUrl }).from(users).where(eq(users.id, userId)).limit(1);
  return user?.webhook || null;
}
