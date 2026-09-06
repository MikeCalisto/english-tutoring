import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { tg } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Регистрирует webhook бота на этот домен. Доступно админу или по ключу ADMIN_SETUP_KEY
 * (ключ нужен для первого запуска, пока админа ещё нет).
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const me = await getCurrentUser().catch(() => null);
  const allowed = me?.role === "admin" || (key && process.env.ADMIN_SETUP_KEY && key === process.env.ADMIN_SETUP_KEY);
  if (!allowed) return NextResponse.json({ ok: false }, { status: 403 });

  const url = `${req.nextUrl.origin}/api/telegram/webhook`;
  const r = await tg("setWebhook", {
    url,
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });
  const info = await tg("getWebhookInfo", {});
  return NextResponse.json({ set: r, info: info.result });
}
