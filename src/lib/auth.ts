import "server-only";
import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { eq, ne, and } from "drizzle-orm";
import { db, schema } from "@/db";
import { COOKIE, signSession, verifySession } from "./session-token";

export type User = typeof schema.users.$inferSelect;

export function newId(n = 16) {
  return randomBytes(n).toString("base64url");
}

/** Код приглашения: 8 символов без похожих букв. */
export function newCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = randomBytes(8);
  return Array.from(b, (x) => alphabet[x % alphabet.length]).join("");
}

/* ---------- sessions ---------- */

async function requestMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
  };
}

/** Создаёт сессию, удаляя остальные сессии пользователя: одна активная на аккаунт. */
export async function startSession(user: User) {
  const meta = await requestMeta();
  const sid = newId(24);
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, user.id));
  await db.insert(schema.sessions).values({ id: sid, userId: user.id, ...meta });
  const token = await signSession({ sid, uid: user.id, role: user.role });
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function logLogin(userId: string | null, method: "telegram" | "code", ok: boolean, note?: string) {
  const meta = await requestMeta();
  await db.insert(schema.loginLog).values({ id: newId(), userId, method, ok, note, ...meta });
}

export async function endSession() {
  const c = await cookies();
  const claims = await verifySession(c.get(COOKIE)?.value);
  if (claims) await db.delete(schema.sessions).where(eq(schema.sessions.id, claims.sid));
  c.delete(COOKIE);
}

/** Текущий пользователь: подпись cookie + живая сессия в базе. */
export async function getCurrentUser(): Promise<User | null> {
  const c = await cookies();
  const claims = await verifySession(c.get(COOKIE)?.value);
  if (!claims) return null;
  const rows = await db
    .select({ u: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(eq(schema.sessions.id, claims.sid))
    .limit(1);
  const u = rows[0]?.u ?? null;
  if (!u) return null;
  if (u.role !== "student" && !u.active) return null;
  return u;
}

export async function requireUser(roles?: User["role"][]) {
  const u = await getCurrentUser();
  if (!u) return null;
  if (roles && !roles.includes(u.role)) return null;
  return u;
}

/** Есть ли другие активные сессии у пользователя (для кабинета). */
export async function otherSessionsCount(userId: string, sid: string) {
  const rows = await db
    .select({ id: schema.sessions.id })
    .from(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, sid)));
  return rows.length;
}
