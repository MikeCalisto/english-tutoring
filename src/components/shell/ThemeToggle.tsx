"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function apply(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.cookie = `theme=${t}; path=/; max-age=31536000; samesite=lax`;
  try {
    localStorage.setItem("theme", t);
  } catch {
    /* приватный режим */
  }
}

/** Переключатель светлой и тёмной темы. Выбор хранится в cookie (для сервера) и localStorage. */
export function ThemeToggle({ initial }: { initial: Theme }) {
  const [t, setT] = useState<Theme>(initial);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Theme | null;
      if (saved && saved !== t) {
        setT(saved);
        apply(saved);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next: Theme = t === "dark" ? "light" : "dark";
    setT(next);
    apply(next);
  };

  return (
    <button className="theme-btn" onClick={toggle} type="button" title={t === "dark" ? "Світла тема" : "Темна тема"} aria-label="Перемкнути тему">
      {t === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="8" cy="8" r="3.2" />
          <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7z" />
        </svg>
      )}
    </button>
  );
}
