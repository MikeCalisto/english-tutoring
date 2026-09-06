import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

export const dynamic = "force-dynamic";

/** Опрос со страницы входа: подтвердил ли бот токен. */
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  if (!t) return NextResponse.json({ confirmed: false });
  const [row] = await db.select({ c: schema.loginTokens.confirmedAt }).from(schema.loginTokens).where(eq(schema.loginTokens.id, t)).limit(1);
  return NextResponse.json({ confirmed: Boolean(row?.c) });
}
