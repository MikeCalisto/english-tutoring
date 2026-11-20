"use client";

import { useEffect, useState } from "react";
import type { Topic } from "@/content/types";
import { CardView } from "./Card";
import { Icon, cardIcon } from "@/components/Icon";

/** Короткое имя карточки для переключателя: убираем название темы из заголовка. */
function shortName(title: string, topic: string) {
  const s = title.replace(topic, "").replace(/^[\s—–-]+/, "").trim();
  return s || title;
}

/** Колода: одна карточка на экране, переключение пилюлями и стрелками клавиатуры. */
export function Deck({ topic, initial = 0 }: { topic: Topic; initial?: number }) {
  const [i, setI] = useState(Math.min(initial, topic.cards.length - 1));
  const cards = topic.cards;
  const n = cards.length;

  useEffect(() => {
    setI(Math.min(initial, topic.cards.length - 1));
  }, [topic.id, initial, topic.cards.length]);

  // Адрес всегда указывает на открытую карточку: ссылку можно скопировать.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (i === 0) url.searchParams.delete("card");
    else url.searchParams.set("card", String(i + 1));
    window.history.replaceState(null, "", url.toString());
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((x) => Math.min(n - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n]);

  const card = cards[i];
  return (
    <>
      <div className="subnav subnav-row" data-tour="subnav">
        <span className={`grp g-${topic.group}`} style={{ background: "var(--frame)" }}>{topic.group.toUpperCase()}</span>
        {cards.map((c, k) => (
          <button key={k} className={`crumb2 g-${topic.group}${k === i ? " on" : ""}`} onClick={() => setI(k)}>
            <Icon name={cardIcon(c)} size={14} />
            {shortName(c.title, topic.topic)}
          </button>
        ))}
        <div className="grow" />
        <div className="pager">
          <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Попередня">
            <Icon name="left" />
          </button>
          <span>{i + 1} / {n}</span>
          <button onClick={() => setI(Math.min(n - 1, i + 1))} disabled={i === n - 1} aria-label="Наступна">
            <Icon name="right" />
          </button>
        </div>
      </div>
      {card && <CardView card={{ ...card, group: card.group ?? topic.group }} footer={`${topic.topic} · ${i + 1} / ${n}`} topicId={topic.id} />}
    </>
  );
}
