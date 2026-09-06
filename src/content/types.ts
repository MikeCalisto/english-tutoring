/** Схема контента. Источник — content/cards/*.json и content/timelines.json. */

export type Group = "present" | "past" | "future" | "other";

export type Role = "positive" | "negative" | "question" | "short_answer" | "careful";

export interface FormRow {
  prefix?: string[];
  pronouns?: string[];
  forms?: string[];
  examples?: string[];
}

export interface ShortAnswerUnit {
  word: string;
  lines: { pronouns: string[]; form: string }[];
}

export interface CarefulColumn {
  heading: string;
  wrong: string;
  right: string;
}

export interface Panel {
  role: Role;
  rows?: FormRow[];
  units?: ShortAnswerUnit[];
  examples?: string[];
  columns?: CarefulColumn[];
  note?: string;
}

export type BlockKind =
  | "spelling"
  | "pairs"
  | "chips"
  | "uses"
  | "text"
  | "lines"
  | "careful"
  | "scenario"
  | "table";

export interface UseItem {
  emoji?: string;
  case: string;
  examples: string[];
  hint?: string;
  wide?: boolean;
}

export interface Block {
  kind?: BlockKind;
  heading?: string;
  note?: string;
  warn?: boolean;
  items: unknown[];
}

export interface CompareColumn {
  tense: string;
  items: { case: string; examples: string[]; hint?: string }[];
  time?: string[];
}

export interface CardBase {
  title: string;
  subtitle?: string;
  group?: Group;
}

export interface FormCard extends CardBase {
  type: "form";
  layout?: string;
  panels: Panel[];
}

export interface CompareCard extends CardBase {
  type: "compare";
  columns: CompareColumn[];
  blocks?: Block[];
}

export interface ContentCard extends CardBase {
  type?: undefined;
  layout?: "two";
  blocks: Block[];
}

export type Card = FormCard | CompareCard | ContentCard;

export interface Topic {
  id: string;
  topic: string;
  group: Group;
  cards: Card[];
}

/* ---------- timelines ---------- */

export interface TLToken {
  text: string;
  mark?: "v1" | "v2" | "time";
}

export interface TLSentence {
  tokens: TLToken[];
  note?: string;
}

export interface TLSpan {
  from: number;
  to: number;
  t?: 1 | 2;
  openStart?: boolean;
  label?: string;
}

export interface TLPoint {
  at: number;
  t?: 1 | 2;
  small?: boolean;
}

export interface TLLane {
  nowAt: number;
  spans?: TLSpan[];
  points?: TLPoint[];
  ticks?: { at: number; text: string }[];
  timeMark?: { from: number; to: number; text: string };
  sentences: TLSentence[];
}

export interface Timeline {
  id: string;
  title: string;
  subtitle?: string;
  group: Group;
  tenses: string[];
  lanes: TLLane[];
}
