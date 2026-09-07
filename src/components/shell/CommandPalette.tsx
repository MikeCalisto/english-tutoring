"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchItem } from "@/content";

const KIND: Record<SearchItem["kind"], string> = { topic: "Тема", card: "Картка", timeline: "Таймлайн", task: "Завдання" };

/** Поиск по всему содержимому: ⌘K / Ctrl+K или клик по полю в шапке. */
export function CommandPalette({ items, open, onClose }: { items: SearchItem[]; open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items.filter((i) => i.kind === "topic" || i.kind === "timeline").slice(0, 12);
    const words = s.split(/\s+/);
    return items
      .map((i) => {
        const hay = `${i.title} ${i.sub}`.toLowerCase();
        const ok = words.every((w) => hay.includes(w));
        const score = ok ? (i.title.toLowerCase().startsWith(s) ? 0 : i.title.toLowerCase().includes(s) ? 1 : 2) : 9;
        return { i, score };
      })
      .filter((x) => x.score < 9)
      .sort((a, b) => a.score - b.score)
      .slice(0, 14)
      .map((x) => x.i);
  }, [q, items]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setSel(0);
  }, [q]);

  if (!open) return null;

  const go = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  return (
    <div className="pal-back" onMouseDown={onClose}>
      <div className="pal" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="pal-in"
          placeholder="Час, картка, таймлайн…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setSel((x) => Math.min(results.length - 1, x + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setSel((x) => Math.max(0, x - 1)); }
            if (e.key === "Enter" && results[sel]) go(results[sel]);
            if (e.key === "Escape") onClose();
          }}
        />
        <div className="pal-list">
          {results.length === 0 && <div className="pal-empty">Нічого не знайдено</div>}
          {results.map((r, n) => (
            <button key={`${r.href}-${n}`} className={`pal-it${n === sel ? " on" : ""}`} onMouseEnter={() => setSel(n)} onClick={() => go(r)}>
              <span className={`pal-k k-${r.kind}`}>{KIND[r.kind]}</span>
              <span className="pal-t">{r.title}</span>
              <span className="pal-s">{r.sub}</span>
            </button>
          ))}
        </div>
        <div className="pal-hint"><kbd>↑↓</kbd> вибрати <kbd>Enter</kbd> відкрити <kbd>Esc</kbd> закрити</div>
      </div>
    </div>
  );
}
