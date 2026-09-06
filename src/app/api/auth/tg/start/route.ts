import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { newId } from "@/lib/auth";
import { deepLink } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/** Создаёт одноразовый токен входа и ссылку в бота. */
export async function POST() {
  const id = newId(24);
  await db.insert(schema.loginTokens).values({ id });
  return NextResponse.json({ token: id, url: deepLink(id) });
}
