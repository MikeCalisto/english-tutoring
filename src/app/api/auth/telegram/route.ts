import { NextResponse, type NextRequest } from "next/server";
import { eq, count } from "drizzle-orm";
import { db, schema } from "@/db";
import { logLogin, newId, startSession, verifyTelegram } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Callback виджета Telegram Login. Первый вошедший становится админом. */
export async function GET(req: NextRequest) {
  const q: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => (q[k] = v));
  const auth = verifyTelegram(q);
  const back = (p: string) => NextResponse.redirect(new URL(p, req.nextUrl.origin));
  if (!auth) {
    await logLogin(null, "telegram", false, "bad signature");
    return back("/login?error=telegram");
  }

  let [user] = await db.select().from(schema.users).where(eq(schema.users.telegramId, auth.id)).limit(1);
  if (!user) {
    const [{ n }] = await db.select({ n: count() }).from(schema.users);
    const first = Number(n) === 0;
    [user] = await db
      .insert(schema.users)
      .values({
        id: newId(),
        role: first ? "admin" : "teacher",
        active: first,
        telegramId: auth.id,
        telegramUsername: auth.username ?? null,
        firstName: auth.first_name ?? null,
        lastName: auth.last_name ?? null,
      })
      .returning();
  } else {
    await db
      .update(schema.users)
      .set({ telegramUsername: auth.username ?? user.telegramUsername, firstName: auth.first_name ?? user.firstName, lastName: auth.last_name ?? user.lastName })
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
