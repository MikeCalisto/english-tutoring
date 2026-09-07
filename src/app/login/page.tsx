import { lt } from "drizzle-orm";
import { TelegramLogin } from "@/components/TelegramLogin";
import { BRAND } from "@/config/brand";
import { db, schema } from "@/db";
import { newId } from "@/lib/auth";
import { deepLink } from "@/lib/telegram";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { cookies } from "next/headers";

/** Токен входа создаётся при открытии страницы; старые токены чистим попутно. */
async function createLoginToken() {
  const id = newId(24);
  await db.insert(schema.loginTokens).values({ id });
  await db.delete(schema.loginTokens).where(lt(schema.loginTokens.createdAt, new Date(Date.now() - 60 * 60 * 1000)));
  return { token: id, url: deepLink(id) };
}

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  telegram: "Не вдалося перевірити вхід через Telegram. Спробуйте ще раз.",
  code: "Код не знайдено або він уже використаний.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; pending?: string }> }) {
  const sp = await searchParams;
  const theme = (await cookies()).get("theme")?.value === "dark" ? "dark" : "light";
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const login = bot ? await createLoginToken() : null;
  return (
    <div className="login">
      <div className="login-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div className="brand"><img src="/brand/logo.svg" alt="" />{BRAND.name}</div><ThemeToggle initial={theme} /></div>
        <h1>Вхід</h1>
        <p className="muted">{BRAND.tagline}</p>

        {sp.pending && (
          <div className="notice">
            Ви увійшли через Telegram, але доступ ще не активовано. Доступ видається після оплати; якщо ви вже оплатили, напишіть нам.
          </div>
        )}
        {sp.error && <div className="notice error">{MESSAGES[sp.error] ?? "Помилка входу."}</div>}

        <section>
          <h2>Для вчителя</h2>
          {bot && login ? (
            <TelegramLogin bot={bot} token={login.token} url={login.url} />
          ) : (
            <div className="notice">Вхід через Telegram ще не налаштовано: не задано ім&apos;я бота.</div>
          )}
        </section>

        <section>
          <h2>Для учня</h2>
          <form method="post" action="/api/auth/code" className="code-form">
            <input name="name" placeholder="Ваше ім'я" maxLength={80} autoComplete="name" />
            <input name="code" placeholder="Код від вчителя" required maxLength={12} autoComplete="off" style={{ fontFamily: "var(--mono)", letterSpacing: ".12em", textTransform: "uppercase" }} />
            <button className="btn primary" type="submit">Увійти</button>
          </form>
        </section>
      </div>
    </div>
  );
}
