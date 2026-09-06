import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { startSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Только для локальной разработки: вход тестовым учителем без Telegram. В продакшне отключено. */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ ok: false }, { status: 404 });
  const id = "dev-teacher";
  let [u] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!u) {
    [u] = await db.insert(schema.users).values({ id, role: "admin", active: true, firstName: "Dev", lastName: "Teacher" }).returning();
  }
  await startSession(u);
  return NextResponse.redirect(new URL("/cards", req.nextUrl.origin));
}
