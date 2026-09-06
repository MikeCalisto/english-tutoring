"use client";

import { useEffect, useRef } from "react";

/** Виджет Telegram Login вставляет iframe на место своего <script>, поэтому скрипт создаём внутри контейнера. */
export function TelegramLogin({ bot, authUrl }: { bot: string; authUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.childElementCount > 0) return;
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.setAttribute("data-telegram-login", bot);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-auth-url", authUrl);
    s.setAttribute("data-request-access", "write");
    el.appendChild(s);
  }, [bot, authUrl]);
  return <div ref={ref} className="tg-widget" />;
}
