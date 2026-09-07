import fs from "node:fs";
import path from "node:path";
import type { Group, Timeline, Topic } from "./types";

const ROOT = path.join(process.cwd(), "content");

interface OrderFile {
  groups: { id: Group; label: string; topics: string[] }[];
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

export function getOrder(): OrderFile {
  return readJson<OrderFile>(path.join(ROOT, "_order.json"));
}

/** Темы, для которых есть файл с карточками, в порядке _order.json. */
export function getTopics(): Topic[] {
  const order = getOrder();
  const out: Topic[] = [];
  for (const g of order.groups) {
    for (const id of g.topics) {
      const f = path.join(ROOT, "cards", `${id}.json`);
      if (!fs.existsSync(f)) continue;
      const t = readJson<Omit<Topic, "id">>(f);
      out.push({ id, ...t, group: (t.group ?? g.id) as Group });
    }
  }
  return out;
}

export function getTopic(id: string): Topic | null {
  return getTopics().find((t) => t.id === id) ?? null;
}

/** Навигация: группы с темами; отсутствующие темы помечены как недоступные. */
export function getNav() {
  const order = getOrder();
  const counts = new Map(getTopics().map((t) => [t.id, t.cards.length]));
  return order.groups.map((g) => ({
    id: g.id,
    label: g.label,
    topics: g.topics.map((id) => ({
      id,
      label: TOPIC_LABELS[id] ?? id,
      available: counts.has(id),
      count: counts.get(id) ?? 0,
    })),
  }));
}

export interface SearchItem {
  kind: "topic" | "card" | "timeline" | "task";
  title: string;
  sub: string;
  href: string;
}

/** Индекс для палитры поиска: темы, отдельные карточки, таймлайны, задания. */
export function getSearchIndex(): SearchItem[] {
  const out: SearchItem[] = [];
  for (const t of getTopics()) {
    out.push({ kind: "topic", title: t.topic, sub: `${t.cards.length} карток`, href: `/cards/${t.id}` });
    t.cards.forEach((c, i) => out.push({ kind: "card", title: c.title, sub: t.topic, href: `/cards/${t.id}?card=${i + 1}` }));
  }
  for (const tl of getTimelines()) out.push({ kind: "timeline", title: tl.title, sub: "таймлайн", href: `/timelines/${tl.id}` });
  for (const task of getTasks()) out.push({ kind: "task", title: task.title, sub: `Wordwall · ${task.tenseLabel}`, href: "/tasks" });
  return out;
}

export function getTimelines(): Timeline[] {
  return readJson<Timeline[]>(path.join(ROOT, "timelines.json"));
}

export function getTimeline(id: string): Timeline | null {
  return getTimelines().find((t) => t.id === id) ?? null;
}

export interface Task {
  id?: string;
  tense: string;
  tenseLabel: string;
  title: string;
  type: string;
  url: string;
  image?: string;
}

export function getTasks(): Task[] {
  return readJson<Task[]>(path.join(ROOT, "tasks.json"));
}

export const TOPIC_LABELS: Record<string, string> = {
  "present-simple": "Present Simple",
  "present-continuous": "Present Continuous",
  "present-perfect": "Present Perfect",
  "present-perfect-continuous": "Present Perfect Continuous",
  "past-simple": "Past Simple",
  "past-continuous": "Past Continuous",
  "past-perfect": "Past Perfect",
  "past-perfect-continuous": "Past Perfect Continuous",
  "future-simple": "Future Simple",
  "future-continuous": "Future Continuous",
  "future-perfect": "Future Perfect",
  "future-perfect-continuous": "Future Perfect Continuous",
  "to-be-going-to": "To be going to",
  "stative-verbs": "Stative verbs",
  "used-to": "Used to",
  "irregular-verbs": "Irregular verbs",
  "combinations-pairs": "Сполучення: пари",
  "combinations-scenarios": "Сполучення: сценарії",
  "combinations-overviews": "Сполучення: огляди",
};
