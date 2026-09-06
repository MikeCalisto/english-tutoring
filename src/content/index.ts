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
  const have = new Set(getTopics().map((t) => t.id));
  return order.groups.map((g) => ({
    id: g.id,
    label: g.label,
    topics: g.topics.map((id) => ({
      id,
      label: TOPIC_LABELS[id] ?? id,
      available: have.has(id),
    })),
  }));
}

export function getTimelines(): Timeline[] {
  return readJson<Timeline[]>(path.join(ROOT, "timelines.json"));
}

export function getTimeline(id: string): Timeline | null {
  return getTimelines().find((t) => t.id === id) ?? null;
}

export interface Task {
  tense: string;
  tenseLabel: string;
  title: string;
  type: string;
  url: string;
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
