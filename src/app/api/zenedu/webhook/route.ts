import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { newId } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Вебхук Zenedu: оплата в боті продажів відкриває доступ до платформи.
 *
 * Покупець платить у боті Zenedu, а на платформу входить через інший бот
 * (вхід через Telegram). Обидва боти бачать той самий Telegram ID, тому після
 * оплати ми заздалегідь створюємо або вмикаємо учителя з цим ID. Коли людина
 * натисне «Увійти через Telegram», доступ уже буде відкритий.
 *
 * Події (Zenedu → Налаштування → API і вебхуки):
 * - product.subscriber.added: підписник отримав продукт (після оплати або видачі вручну) → вмикаємо;
 * - order.paid: замовлення оплачене, якщо в ньому вже є підписник → вмикаємо;
 * - order.refunded: повернення → вимикаємо учителя й завершуємо його сесії.
 *
 * Підпис: заголовок Signature = HMAC-SHA256(сире тіло, API-токен Zenedu) у hex.
 * Env: ZENEDU_API_TOKEN (обов'язково), ZENEDU_BOT_ID, ZENEDU_PRODUCT_IDS і ZENEDU_OFFER_IDS (через кому).
 * Наружу віддаємо тільки {ok}.
 */

const MAX_BODY = 64 * 1024;

function list(v: string | undefined) {
  return (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

function validSignature(raw: string, header: string | null, token: string) {
  if (!header || !/^[0-9a-f]{64}$/i.test(header)) return false;
  const expected = createHmac("sha256", token).update(raw, "utf8").digest();
  return timingSafeEqual(expected, Buffer.from(header, "hex"));
}

interface Sub {
  user_id?: number | string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}

async function grant(sub: Sub, why: string) {
  const telegramId = sub.user_id ? String(sub.user_id) : "";
  if (!/^\d{3,20}$/.test(telegramId)) return;
  const [user] = await db.select().from(schema.users).where(eq(schema.users.telegramId, telegramId)).limit(1);
  if (!user) {
    await db.insert(schema.users).values({
      id: newId(),
      role: "teacher",
      active: true,
      telegramId,
      telegramUsername: sub.username?.slice(0, 64) ?? null,
      firstName: sub.first_name?.slice(0, 80) ?? null,
      lastName: sub.last_name?.slice(0, 80) ?? null,
    });
    console.log(`[zenedu] ${why}: new teacher`);
    return;
  }
  // Адміна не чіпаємо; учень, що купив пак сам, стає учителем.
  if (user.role === "admin") return;
  await db.update(schema.users).set({ role: "teacher", active: true }).where(eq(schema.users.id, user.id));
  console.log(`[zenedu] ${why}: teacher activated`);
}

async function revoke(sub: Sub) {
  const telegramId = sub.user_id ? String(sub.user_id) : "";
  if (!telegramId) return;
  const [user] = await db.select().from(schema.users).where(eq(schema.users.telegramId, telegramId)).limit(1);
  if (!user || user.role !== "teacher") return;
  await db.update(schema.users).set({ active: false }).where(eq(schema.users.id, user.id));
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, user.id));
  console.log("[zenedu] refund: teacher deactivated");
}

export async function POST(req: NextRequest) {
  const token = process.env.ZENEDU_API_TOKEN;
  if (!token) return NextResponse.json({ ok: false }, { status: 503 });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ ok: false }, { status: 413 });
  if (!validSignature(raw, req.headers.get("signature"), token)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: { event?: string; data?: Record<string, unknown> };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const event = body.event ?? "";
  const data = body.data ?? {};

  const botId = process.env.ZENEDU_BOT_ID;
  if (botId && data.botId !== undefined && String(data.botId) !== botId) return NextResponse.json({ ok: true });

  const products = list(process.env.ZENEDU_PRODUCT_IDS);
  const offers = list(process.env.ZENEDU_OFFER_IDS);

  if (event === "product.subscriber.added") {
    if (products.length && !products.includes(String(data.product_id))) return NextResponse.json({ ok: true });
    await grant(data as Sub, event);
  } else if (event === "order.paid" || event === "order.refunded") {
    if (offers.length && !offers.includes(String(data.offer_id))) return NextResponse.json({ ok: true });
    const sub = (data.subscriber ?? null) as Sub | null;
    if (sub) {
      if (event === "order.paid") await grant(sub, event);
      else await revoke(sub);
    }
  }
  // webhook.test та інші події просто підтверджуємо.
  return NextResponse.json({ ok: true });
}
