import { NextResponse, type NextRequest } from "next/server";
import { eq, count } from "drizzle-orm";
import { db, schema } from "@/db";
import { logLogin, newId, startSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TTL_MS = 10 * 60 * 1000;

/** Завершение входа: токен подтверждён ботом, создаём или находим пользователя и сессию. */
export async function GET(req: NextRequest) {
  const back = (p: string) => NextResponse.redirect(new URL(p, req.nextUrl.origin));
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const [tok] = t ? await db.select().from(schema.loginTokens).where(eq(schema.loginTokens.id, t)).limit(1) : [];
  if (!tok || !tok.confirmedAt || tok.consumedAt || !tok.telegramId || Date.now() - tok.createdAt.getTime() > TTL_MS) {
    await logLogin(null, "telegram", false, "bad or expired token");
    return back("/login?error=telegram");
  }
  await db.update(schema.loginTokens).set({ consumedAt: new Date() }).where(eq(schema.loginTokens.id, t));

  let [user] = await db.select().from(schema.users).where(eq(schema.users.telegramId, tok.telegramId)).limit(1);
  if (!user) {
    const [{ n }] = await db.select({ n: count() }).from(schema.users);
    const first = Number(n) === 0;
    [user] = await db
      .insert(schema.users)
      .values({
        id: newId(),
        role: first ? "admin" : "teacher",
        active: first,
        telegramId: tok.telegramId,
        telegramUsername: tok.username,
        firstName: tok.firstName,
        lastName: tok.lastName,
      })
      .returning();
  } else {
    await db
      .update(schema.users)
      .set({ telegramUsername: tok.username ?? user.telegramUsername, firstName: tok.firstName ?? user.firstName, lastName: tok.lastName ?? user.lastName })
      .where(eq(schema.users.id, user.id));
  }

  if (!user.active) {
    await logLogin(user.id, "telegram", false, "not active");
    return back("/login?pending=1");
  }
  await startSession(user);
  await logLogin(user.id, "telegram", true);
  return back("/cards");
}
