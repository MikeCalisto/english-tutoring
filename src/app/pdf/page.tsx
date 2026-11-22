import { Fragment } from "react";
import { redirect } from "next/navigation";
import { getOrder, getTimelines, getTopics, TOPIC_LABELS } from "@/content";
import type { Card, Group, Timeline, Topic } from "@/content/types";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/config/brand";
import { CardView } from "@/components/cards/Card";
import { pillLabel } from "@/components/cards/labels";
import { TimelineCard } from "@/components/timeline/Timeline";
import { TenseSig, Tile, topicIcon } from "@/components/Icon";
import { Fit } from "./Fit";
import "./pdf.css";

export const dynamic = "force-dynamic";

/** Одна сторінка збірника. Кожна сторінка — рівно один аркуш A4 в альбомній орієнтації. */
type Leaf =
  | { kind: "card"; topic: Topic; card: Card; n: number; of: number; label: string; part: number; sub?: string }
  | { kind: "timeline"; t: Timeline; part: number };

interface Unit {
  id: string;
  label: string;
  group: Group;
  icon: string;
  /** Підписи сторінок у змісті: назви карток і слово «Таймлайн». */
  parts: string[];
  leaves: Leaf[];
}

interface Section {
  id: string;
  group: Group;
  label: string;
  note: string;
  units: Unit[];
}

const TL_FOR_TOPIC: Record<string, string> = { "to-be-going-to": "be-going-to" };

/**
 * Довгі картки діляться на кілька аркушів, щоб текст не ставав дрібним:
 * таблиця дієслів навпіл, а в огляді з чотирьох колонок примітки й таблиця йдуть окремою сторінкою.
 */
function splitCard(card: Card): Card[] {
  if (card.type === "compare" && card.columns.length >= 4 && (card.blocks?.length ?? 0) >= 1) {
    const blocks = card.blocks ?? [];
    const sub = blocks.map((b) => b.heading?.toLowerCase()).filter(Boolean).join(" · ");
    return [{ ...card, blocks: undefined }, { title: card.title, subtitle: sub, group: card.group, blocks }];
  }
  if (!card.type && card.blocks.length === 1 && card.blocks[0].kind === "verbs") {
    const items = card.blocks[0].items as { inf: string }[];
    const per = Math.ceil(items.length / 2);
    return [items.slice(0, per), items.slice(per)].map((chunk) => ({
      ...card,
      subtitle: `${chunk[0].inf} – ${chunk[chunk.length - 1].inf}`,
      blocks: [{ ...card.blocks[0], items: chunk }],
    }));
  }
  return [card];
}

/** Увесь збірник у порядку читання: часи за групами, потім інші теми, потім порівняння часів. */
function buildBook(): Section[] {
  const topics = new Map(getTopics().map((t) => [t.id, t]));
  const timelines = getTimelines();
  const single = new Map(timelines.filter((t) => t.tenses.length === 1).map((t) => [t.id, t]));
  const conflicts = timelines.filter((t) => t.tenses.length > 1);

  const unit = (id: string): Unit | null => {
    const topic = topics.get(id);
    if (!topic) return null;
    const parts = topic.cards.map((card) => pillLabel(card, topic.topic));
    const leaves: Leaf[] = topic.cards.flatMap((card, i) => {
      const pieces = splitCard(card);
      return pieces.map((c, k): Leaf => ({ kind: "card", topic, card: c, n: i + 1, of: topic.cards.length, label: parts[i], part: i, sub: pieces.length > 1 ? `стор. ${k + 1} з ${pieces.length}` : undefined }));
    });
    const tl = single.get(TL_FOR_TOPIC[id] ?? id);
    if (tl) {
      leaves.push({ kind: "timeline", t: tl, part: parts.length });
      parts.push("Таймлайн");
    }
    return { id, label: TOPIC_LABELS[id] ?? topic.topic, group: topic.group, icon: topicIcon(id), parts, leaves };
  };

  const NOTE: Record<string, string> = {
    present: "Теперішні часи",
    past: "Минулі часи",
    future: "Майбутні часи",
    other: "Конструкції та дієслова",
  };
  const sections: Section[] = [];
  for (const g of getOrder().groups) {
    const ids = g.topics.filter((id) => !id.startsWith("combinations"));
    const units = ids.map(unit).filter((u): u is Unit => u !== null);
    if (units.length) sections.push({ id: g.id, group: g.id, label: g.label, note: NOTE[g.id] ?? "", units });
  }
  const cmp: Unit[] = ["combinations-pairs", "combinations-scenarios", "combinations-overviews"].map(unit).filter((u): u is Unit => u !== null);
  cmp.push({
    id: "conflicts",
    label: "Конфлікти часів на шкалі",
    group: "other",
    icon: "versus",
    parts: conflicts.map((t) => t.title),
    leaves: conflicts.map((t, i) => ({ kind: "timeline", t, part: i })),
  });
  sections.push({ id: "compare", group: "other", label: "Порівняння часів", note: "Два часи поруч: пари, сценарії, огляди й шкали", units: cmp });
  return sections;
}

/** Зразок: один час повністю і по одній сторінці з порівнянь, щоб було видно всі типи сторінок. */
function sampleFilter(u: Unit, l: Leaf): boolean {
  if (u.id === "present-simple") return true;
  if (u.id === "combinations-pairs") return l.kind === "card" && l.n === 1;
  if (u.id === "conflicts") return l.kind === "timeline" && l.t.id === "present-simple-present-continuous";
  return false;
}

function Foot({ section, crumb, page }: { section: string; crumb: string; page: number }) {
  return (
    <div className="pdf-foot">
      <span className="pdf-foot-b"><img src="/brand/logo.svg" alt="" />{BRAND.name}</span>
      <span className="pdf-foot-c">{section} · <h3>{crumb}</h3></span>
      <span className="pdf-foot-r"><a href="#toc">Зміст</a><b>{page}</b></span>
    </div>
  );
}

export default async function PdfPage({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") redirect("/cards");
  const sample = (await searchParams).sample === "1";

  const book = buildBook();
  // нумерація: обкладинка 1, зміст 2, далі розділи; сторінка розділу стоїть перед його першою темою
  let page = 2;
  const plan = book.map((s) => {
    const units = s.units.map((u) => {
      const leaves = u.leaves.map((l) => ({ l, i: l.part })).filter(({ l }) => !sample || sampleFilter(u, l));
      return { u, leaves: leaves.map((x) => ({ ...x, page: 0 })), first: 0 };
    });
    const any = units.some((x) => x.leaves.length > 0);
    const divider = any ? ++page : 0;
    for (const x of units) for (const lf of x.leaves) { lf.page = ++page; if (!x.first) x.first = lf.page; }
    return { s, units, divider };
  });
  const total = page;

  return (
    <div className={`pdf-book${sample ? " is-sample" : ""}`}>
      <Fit />

      {/* ---------- обкладинка ---------- */}
      <section className="pdf-page pdf-cover">
        <h1 className="pdf-cover-top"><img src="/brand/logo.svg" alt="" /><span>{BRAND.name}: часи англійської</span></h1>
        <div className="pdf-cover-mid">
          <div className="pdf-cover-k">Збірник для вчителя англійської</div>
          <div className="pdf-cover-h">{"Часи англійської в\u00a0картках і\u00a0таймлайнах"}</div>
          <p className="pdf-cover-p">Форма, правопис і використання кожного часу. Шкали часу з прикладами. Порівняння часів, які учні плутають.</p>
          <div className="pdf-cover-groups">
            <span className="g-present">Present</span><span className="g-past">Past</span><span className="g-future">Future</span><span className="g-other">Порівняння</span>
          </div>
        </div>
        <div className="pdf-cover-bot">
          <span>{sample ? "Зразок структури" : "Повна версія"} · {total} стор.</span>
          <span>{BRAND.domain}</span>
        </div>
      </section>

      {/* ---------- зміст ---------- */}
      <section className="pdf-page pdf-toc" id="toc">
        <h2 className="pdf-h">Зміст</h2>
        <div className="pdf-toc-grid">
          {plan.map(({ s, units, divider }) => (
            <div className={`pdf-toc-sec g-${s.group}`} key={s.id}>
              <div className="pdf-toc-sh">
                {divider ? <a href={`#p-${divider}`}>{s.label}</a> : <span>{s.label}</span>}
              </div>
              {units.map(({ u, leaves, first }) => (
                <div className={`pdf-toc-u${first ? "" : " off"}`} key={u.id}>
                  <div className="pdf-toc-l">
                    {first ? <a href={`#p-${first}`}>{u.label}</a> : <span>{u.label}</span>}
                    <i />
                    <b>{first || "·"}</b>
                  </div>
                  <div className="pdf-toc-p">
                    {(u.parts.length > 6 ? [`${u.parts.length} сторінок`] : u.parts).map((p, i) => {
                      const lf = leaves.find((x) => x.i === i);
                      return lf && u.parts.length <= 6 ? <a key={i} href={`#p-${lf.page}`}>{p}</a> : <span key={i}>{p}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="pdf-toc-note">
          {sample
            ? "Це зразок: у ньому один час повністю і по одній сторінці з порівнянь. Сірим показано розділи, які будуть у повній версії. Назви в змісті клікабельні."
            : "Назви в змісті клікабельні. З кожної сторінки можна повернутися сюди посиланням «Зміст» унизу."}
        </div>
        <div className="pdf-foot"><span className="pdf-foot-b"><img src="/brand/logo.svg" alt="" />{BRAND.name}</span><span className="pdf-foot-r"><b>2</b></span></div>
      </section>

      {/* ---------- розділи ---------- */}
      {plan.map(({ s, units, divider }) =>
        divider ? (
          <Fragment key={s.id}>
            <section className={`pdf-page pdf-div g-${s.group}`} id={`p-${divider}`}>
              <div className="pdf-div-k">Розділ</div>
              <h2 className="pdf-div-h">{s.label}</h2>
              <p className="pdf-div-p">{s.note}</p>
              <div className="pdf-div-list">
                {units.map(({ u, first }) => (
                  <div className={`pdf-div-u${first ? "" : " off"}`} key={u.id}>
                    <Tile name={u.icon} />
                    <div className="pdf-div-t">
                      {first ? <a href={`#p-${first}`}>{u.label}</a> : <span>{u.label}</span>}
                      <small>{u.parts.length > 6 ? `${u.parts.length} сторінок` : u.parts.join(" · ")}</small>
                    </div>
                    <TenseSig topicId={u.id} />
                    <b>{first || ""}</b>
                  </div>
                ))}
              </div>
              <div className="pdf-foot"><span className="pdf-foot-b"><img src="/brand/logo.svg" alt="" />{BRAND.name}</span><span className="pdf-foot-r"><a href="#toc">Зміст</a><b>{divider}</b></span></div>
            </section>

            {units.flatMap(({ u, leaves }) =>
              leaves.map(({ l, page: p }) => (
                <section className="pdf-page" id={`p-${p}`} key={`${u.id}-${p}`}>
                  <div className="pdf-stage">
                    <div className="pdf-fit">
                      {l.kind === "card" ? <CardView card={{ ...l.card, group: l.card.group ?? l.topic.group }} topicId={l.topic.id} /> : <TimelineCard t={l.t} all />}
                    </div>
                  </div>
                  <Foot
                    section={s.label}
                    crumb={l.kind === "card" ? `${u.label} · ${l.label} · ${l.n} / ${l.of}${l.sub ? ` · ${l.sub}` : ""}` : u.id === "conflicts" ? `${l.t.title} · Таймлайн` : `${u.label} · Таймлайн`}
                    page={p}
                  />
                </section>
              )),
            )}
          </Fragment>
        ) : null,
      )}
    </div>
  );
}
