import Script from "next/script";
import { BRAND } from "@/config/brand";

export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  telegram: "Не вдалося перевірити вхід через Telegram. Спробуйте ще раз.",
  code: "Код не знайдено або він уже використаний.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; pending?: string }> }) {
  const sp = await searchParams;
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  return (
    <div className="login">
      <div className="login-box">
        <div className="brand" style={{ alignSelf: "flex-start" }}>{BRAND.name}</div>
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
          {bot ? (
            <>
              <div id="tg-widget" />
              <Script
                src="https://telegram.org/js/telegram-widget.js?22"
                data-telegram-login={bot}
                data-size="large"
                data-auth-url="/api/auth/telegram"
                data-request-access="write"
                strategy="afterInteractive"
              />
            </>
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
