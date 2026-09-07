"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Task } from "@/content";

function groupOf(tense: string) {
  if (tense.startsWith("present")) return "present";
  if (tense.startsWith("past")) return "past";
  if (tense.startsWith("future") || tense === "be-going-to") return "future";
  return "other";
}

/** Сетка заданий на весь экран с фильтром по временам. */
export function TasksGrid({ tasks }: { tasks: Task[] }) {
  const [f, setF] = useState<string>("all");
  const tenses = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of tasks) if (!seen.has(t.tense)) seen.set(t.tense, t.tenseLabel);
    return Array.from(seen.entries());
  }, [tasks]);
  const shown = f === "all" ? tasks : tasks.filter((t) => t.tense === f);
  return (
    <>
      <div className="subnav">
        <button className={`crumb2${f === "all" ? " on" : ""}`} onClick={() => setF("all")}>Усі · {tasks.length}</button>
        {tenses.map(([id, label]) => (
          <button key={id} className={`crumb2 g-${groupOf(id)}${f === id ? " on" : ""}`} onClick={() => setF(id)}>{label}</button>
        ))}
      </div>
      <div className="task-grid">
        {shown.map((t) => (
          <a key={t.url} className={`tcard g-${groupOf(t.tense)}`} href={t.url} target="_blank" rel="noopener noreferrer">
            <div className="tcard-img">
              {t.image ? (
                <Image src={t.image} alt="" width={800} height={450} sizes="(max-width: 700px) 100vw, (max-width: 1400px) 33vw, 25vw" />
              ) : (
                <div className="tcard-noimg">Wordwall</div>
              )}
              <span className="tcard-type">{t.type}</span>
            </div>
            <div className="tcard-body">
              <span className="grp">{t.tenseLabel}</span>
              <div className="tcard-title">{t.title}</div>
              <div className="tcard-meta">
                <span>Wordwall</span>
                <span className="btn">Відкрити</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
