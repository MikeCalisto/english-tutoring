import "server-only";

/** Вызов Bot API. Токен берётся только из окружения. */
export async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<{ ok: boolean; result?: T; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, description: "TELEGRAM_BOT_TOKEN is not set" };
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return (await r.json()) as { ok: boolean; result?: T; description?: string };
}

export function botUsername() {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "";
}

export function deepLink(token: string) {
  return `https://t.me/${botUsername()}?start=${token}`;
}
