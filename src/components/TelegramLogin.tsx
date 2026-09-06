"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "waiting" | "done" | "error";

/** Вход через бота: ссылка в Telegram с одноразовым токеном, затем опрос подтверждения. */
export function TelegramLogin({ bot }: { bot: string }) {
  const [state, setState] = useState<State>("idle");
  const [url, setUrl] = useState<string>("");
  const token = useRef<string>("");

  async function start() {
    setState("waiting");
    try {
      const r = await fetch("/api/auth/tg/start", { method: "POST" });
      const d = (await r.json()) as { token: string; url: string };
      token.current = d.token;
      setUrl(d.url);
      window.open(d.url, "_blank", "noopener");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    if (state !== "waiting" || !token.current) return;
    const started = Date.now();
    const t = setInterval(async () => {
      if (Date.now() - started > 10 * 60 * 1000) {
        clearInterval(t);
        setState("error");
        return;
      }
      try {
        const r = await fetch(`/api/auth/tg/status?t=${token.current}`, { cache: "no-store" });
        const d = (await r.json()) as { confirmed: boolean };
        if (d.confirmed) {
          clearInterval(t);
          setState("done");
          window.location.href = `/api/auth/tg/finish?t=${token.current}`;
        }
      } catch {
        /* следующая попытка */
      }
    }, 2000);
    return () => clearInterval(t);
  }, [state]);

  return (
    <div className="tg-login">
      {state === "idle" && (
        <button className="btn primary" onClick={start} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9.04 15.47l-.37 5.2c.53 0 .76-.23 1.04-.5l2.5-2.4 5.18 3.8c.95.52 1.63.25 1.88-.88l3.4-15.95c.31-1.4-.5-1.95-1.43-1.6L1.9 10.8c-1.37.53-1.35 1.3-.23 1.64l5.1 1.6L18.6 6.6c.56-.37 1.07-.17.65.2L9.04 15.47z"/></svg>
          Увійти через Telegram
        </button>
      )}
      {state === "waiting" && (
        <div className="notice">
          У Telegram відкрився бот <b>@{bot}</b>. Натисніть там <b>Start</b>, і ця сторінка сама впустить вас.
          {url && (
            <div style={{ marginTop: 8 }}>
              Не відкрилося? <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Відкрити бота</a>
            </div>
          )}
        </div>
      )}
      {state === "done" && <div className="notice">Входимо…</div>}
      {state === "error" && (
        <div className="notice error">
          Не вдалося дочекатися підтвердження. <button className="btn" type="button" onClick={start} style={{ marginLeft: 8 }}>Спробувати ще раз</button>
        </div>
      )}
    </div>
  );
}
