"use client";

import { useEffect, useState } from "react";

type State = "idle" | "clicked" | "done" | "expired";

/**
 * Вход через бота. Токен уже создан на сервере при рендере страницы.
 * Кнопка — обычная ссылка в Telegram, страница с момента загрузки ждёт подтверждения.
 */
export function TelegramLogin({ bot, token, url }: { bot: string; token: string; url: string }) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const started = Date.now();
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      if (Date.now() - started > 9 * 60 * 1000) {
        setState("expired");
        return;
      }
      try {
        const r = await fetch(`/api/auth/tg/status?t=${token}`, { cache: "no-store" });
        const d = (await r.json()) as { confirmed: boolean };
        if (d.confirmed) {
          stopped = true;
          setState("done");
          window.location.href = `/api/auth/tg/finish?t=${token}`;
          return;
        }
      } catch {
        /* повторим */
      }
      setTimeout(tick, 1500);
    };
    const h = setTimeout(tick, 1500);
    return () => {
      stopped = true;
      clearTimeout(h);
    };
  }, [token]);

  if (state === "done") return <div className="notice">Входимо…</div>;
  if (state === "expired")
    return (
      <div className="notice error">
        Час на вхід вийшов. <a href="/login" style={{ textDecoration: "underline" }}>Оновити сторінку</a>
      </div>
    );
  return (
    <div className="tg-login">
      <a className="btn primary" href={url} target="_blank" rel="noopener noreferrer" onClick={() => setState("clicked")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 15.47l-.37 5.2c.53 0 .76-.23 1.04-.5l2.5-2.4 5.18 3.8c.95.52 1.63.25 1.88-.88l3.4-15.95c.31-1.4-.5-1.95-1.43-1.6L1.9 10.8c-1.37.53-1.35 1.3-.23 1.64l5.1 1.6L18.6 6.6c.56-.37 1.07-.17.65.2L9.04 15.47z"/></svg>
        Увійти через Telegram
      </a>
      {state === "clicked" && (
        <div className="notice" style={{ marginTop: 10 }}>
          У Telegram відкрився бот <b>@{bot}</b>. Натисніть там <b>Start</b> і поверніться сюди: сторінка впустить вас сама.
        </div>
      )}
    </div>
  );
}
