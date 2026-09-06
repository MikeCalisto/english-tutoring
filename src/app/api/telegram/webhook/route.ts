import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { tg } from "@/lib/telegram";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

interface Update {
  message?: {
    text?: string;
    chat: { id: number };
    from?: { id: number; first_name?: string; last_name?: string; username?: string };
  };
}

/** Webhook бота. Единственная задача: подтвердить токен из /start <token>. */
export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const upd = (await req.json()) as Update;
  const m = upd.message;
  if (!m?.text || !m.from) return NextResponse.json({ ok: true });

  const site = req.nextUrl.origin;
  const match = /^\/start(?:\s+(\S+))?/.exec(m.text);
  if (!match) return NextResponse.json({ ok: true });
  const token = match[1];

  if (!token) {
    await tg("sendMessage", { chat_id: m.chat.id, text: `Це бот платформи ${BRAND.name}. Щоб увійти, натисніть «Увійти через Telegram» на сайті: ${site}/login` });
    return NextResponse.json({ ok: true });
  }

  const [tok] = await db.select().from(schema.loginTokens).where(eq(schema.loginTokens.id, token)).limit(1);
  if (!tok || tok.confirmedAt || Date.now() - tok.createdAt.getTime() > 10 * 60 * 1000) {
    await tg("sendMessage", { chat_id: m.chat.id, text: `Посилання для входу застаріло. Відкрийте ${site}/login і натисніть кнопку ще раз.` });
    return NextResponse.json({ ok: true });
  }
  await db
    .update(schema.loginTokens)
    .set({
      telegramId: String(m.from.id),
      firstName: m.from.first_name ?? null,
      lastName: m.from.last_name ?? null,
      username: m.from.username ?? null,
      confirmedAt: new Date(),
    })
    .where(eq(schema.loginTokens.id, token));
  await tg("sendMessage", { chat_id: m.chat.id, text: "Готово. Поверніться на сайт, вхід відбудеться автоматично." });
  return NextResponse.json({ ok: true });
}
