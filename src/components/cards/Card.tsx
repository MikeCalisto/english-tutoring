import type { Block, Card, CompareCard, ContentCard, FormCard, Group, Panel, UseItem } from "@/content/types";
import { BRAND } from "@/config/brand";
import { Html } from "@/components/Html";
import { BLOCK_ICON, Icon, ROLE_ICON, TenseSig, Tile, cardIcon, emojiIcon } from "@/components/Icon";

const ROLE_LABEL: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  question: "Question",
  short_answer: "Short answer",
  careful: "Careful",
};

const X = (
  <svg className="ic" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M3 3l8 8M11 3l-8 8" />
  </svg>
);
const V = (
  <svg className="ic" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7.5l3.5 3.5L12 4" />
  </svg>
);

function Pills({ items, cls = "pr" }: { items: string[]; cls?: string }) {
  return (
    <>
      {items.map((i, n) => (
        <Html key={n} className={cls} html={i} />
      ))}
    </>
  );
}

function Shell({ group, title, subtitle, footer, icon, topicId, children }: { group: Group; title: string; subtitle?: string; footer?: string; icon: string; topicId?: string; children: React.ReactNode }) {
  return (
    <div className={`card g-${group}`} data-tour="card">
      <div className="card-hd">
        <div className="hd-l">
          <Tile name={icon} />
          <div className="card-t">
            <span className="card-h">{title}</span>
            {subtitle && <span className="card-sub">{subtitle}</span>}
          </div>
        </div>
        <div className="hd-r">
          <TenseSig topicId={topicId} />
          <span className="grp">{group.toUpperCase()}</span>
        </div>
      </div>
      <div className="card-bd">{children}</div>
      <div className="card-ft">
        <span>{BRAND.name}</span>
        <span>{footer}</span>
      </div>
    </div>
  );
}

/* ---------- form card ---------- */

function RowsPanel({ p }: { p: Panel }) {
  return (
    <div className={`pn p-${p.role}`}>
      <div className="pn-lb"><Icon name={ROLE_ICON[p.role]} size={14} />{ROLE_LABEL[p.role]}</div>
      {p.rows?.map((r, n) => (
        <div className="r" key={n}>
          {r.prefix && (
            <div className="pre">
              <Pills items={r.prefix} cls="fm" />
            </div>
          )}
          {r.pronouns && (
            <>
              <div className="prons">
                <Pills items={r.pronouns} />
              </div>
              <div className="brace" />
            </>
          )}
          {r.forms && (
            <div className="forms">
              <Pills items={r.forms} cls="fm" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShortAnswerPanel({ p }: { p: Panel }) {
  return (
    <div className={`pn p-${p.role}`}>
      <div className="pn-lb"><Icon name={ROLE_ICON[p.role]} size={14} />{ROLE_LABEL[p.role]}</div>
      <div className="sa-wrap">
        {p.units?.map((u, n) => (
          <div className="sa-unit" key={n}>
            <span className="sa-word">{u.word}</span>
            <div className="sagrp">
              {u.lines.map((l, i) => (
                <div className="sa-line" key={i}>
                  <div className="prons">
                    <Pills items={l.pronouns} />
                  </div>
                  <div className="brace" />
                  <div className="forms">
                    <Html className="fm" html={l.form} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarefulPanel({ p }: { p: Panel }) {
  return (
    <div className={`pn p-${p.role}`}>
      <div className="pn-lb"><Icon name={ROLE_ICON[p.role]} size={14} />{ROLE_LABEL[p.role]}</div>
      <div className="warn-cols">
        {p.columns?.map((c, n) => (
          <div key={n}>
            <div className="warn-h">{c.heading}</div>
            <div className="warnrow x">{X}<Html html={c.wrong} /></div>
            <div className="warnrow v">{V}<Html html={c.right} /></div>
          </div>
        ))}
        {p.note && <Html as="div" className="warn-note" html={p.note} />}
      </div>
    </div>
  );
}

function FormCardView({ c, footer, topicId }: { c: FormCard; footer?: string; topicId?: string }) {
  const top = c.panels.filter((p) => p.role !== "careful");
  const careful = c.panels.find((p) => p.role === "careful");
  const sa = c.panels.find((p) => p.role === "short_answer");
  // Примеры из строк панелей и из short answer собираются в один блок внизу (правило 17).
  const examples = [
    ...c.panels.flatMap((p) => (p.rows ?? []).flatMap((r) => r.examples ?? [])),
    ...(sa?.examples ?? []),
  ];
  const hasSa = Boolean(sa);
  return (
    <Shell group={c.group ?? "present"} title={c.title} subtitle={c.subtitle} footer={footer} icon={cardIcon(c)} topicId={topicId}>
      <div className={`panels${hasSa ? "" : " no-sa"}`}>
        {top.map((p, n) =>
          p.role === "short_answer" ? <ShortAnswerPanel key={n} p={p} /> : <RowsPanel key={n} p={p} />,
        )}
      </div>
      {(careful || examples.length > 0) && (
        <div className={`bottom${careful ? "" : " only-ex"}`}>
          {careful && <CarefulPanel p={careful} />}
          {examples.length > 0 && (
            <div className="exs">
              <div className="exs-h"><Icon name="quote" size={14} />Examples</div>
              <div className={`ex-grid${examples.length > 4 ? " many" : ""}`}>
                {examples.map((e, i) => (
                  <Html key={i} className="ex" html={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

/* ---------- content blocks ---------- */

const WIDE_KINDS = new Set(["uses", "scenario", "table", "verbs"]);

function BlockView({ b, forceWide }: { b: Block; forceWide?: boolean }) {
  const items = b.items as never[];
  let inner: React.ReactNode = null;
  switch (b.kind) {
    case "spelling":
      inner = (
        <div className="sp">
          {(items as { from: string; to: string; rule: string }[]).map((i, n) => (
            <div key={n}>
              <code>
                <Html html={i.from} /> <i>→</i> <Html as="em" html={i.to} />
              </code>
              <Html html={i.rule} />
            </div>
          ))}
        </div>
      );
      break;
    case "pairs":
      inner = (
        <div className="sp">
          {(items as { left: string; right: string }[]).map((i, n) => (
            <div key={n}>
              <Html as="code" html={i.left} />
              <Html html={i.right} />
            </div>
          ))}
        </div>
      );
      break;
    case "chips":
      inner = (
        <div className="chips">
          {(items as string[]).map((c, n) => (
            <Html key={n} className="chip" html={c} />
          ))}
        </div>
      );
      break;
    case "uses":
      inner = (
        <div className="uses">
          {(items as UseItem[]).map((u, n) => (
            <div className={`u${u.wide ? " wide" : ""}`} key={n}>
              <Tile name={emojiIcon(u.emoji)} small />
              <div>
                <div className="ttl">{u.case}</div>
                {u.examples.map((e, i) => (
                  <Html key={i} as="p" className="ex2" html={e} />
                ))}
                {u.hint && <Html as="div" className="hint" html={u.hint} />}
              </div>
            </div>
          ))}
        </div>
      );
      break;
    case "text":
      inner = (items as string[]).map((t, n) => <Html key={n} as="p" className="note" html={t} />);
      break;
    case "lines":
      inner = <Html as="p" className="adv" html={(items as string[]).join("<br>")} />;
      break;
    case "careful":
      inner = (items as { wrong: string; right: string }[]).map((i, n) => (
        <div key={n}>
          <div className="warnrow x">{X}<Html html={i.wrong} /></div>
          <div className="warnrow v">{V}<Html html={i.right} /></div>
        </div>
      ));
      break;
    case "scenario": {
      const sc = items as { tense: string; sentence: string; note?: string }[];
      inner = (
        <div className="scn" style={{ gridTemplateColumns: `repeat(${sc.length}, minmax(0, 1fr))` }}>
          {sc.map((i, n) => (
            <div className={`scn-i s-t${n + 1}`} key={n}>
              <div className="tn">{i.tense}</div>
              <Html as="p" className="st" html={i.sentence} />
              {i.note && <Html as="div" className="nt" html={i.note} />}
            </div>
          ))}
        </div>
      );
      break;
    }
    case "verbs": {
      const vs = items as { inf: string; past: string; pp: string }[];
      const cols = 3;
      const per = Math.ceil(vs.length / cols);
      inner = (
        <div className="verbs">
          {Array.from({ length: cols }, (_, ci) => (
            <table className="vt" key={ci}>
              <thead>
                <tr><th>Infinitive</th><th>Past</th><th>Past Participle</th></tr>
              </thead>
              <tbody>
                {vs.slice(ci * per, (ci + 1) * per).map((v, n) => (
                  <tr key={n}><td>{v.inf}</td><td className="p">{v.past}</td><td className="p">{v.pp}</td></tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      );
      break;
    }
    case "table":
      inner = (
        <table className="te">
          <tbody>
            {(items as { k: string; v: string }[]).map((r, n) => (
              <tr key={n}>
                <td className="k"><Html html={r.k} /></td>
                <td className="v"><Html html={r.v} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
      break;
  }
  const wide = forceWide || (b.kind ? WIDE_KINDS.has(b.kind) : false);
  return (
    <div className={`blk${wide ? " wide" : ""}${b.warn ? " warn" : ""}`}>
      {b.heading && <h4>{b.kind && <Icon name={BLOCK_ICON[b.kind] ?? "cards"} size={14} />}{b.heading}</h4>}
      {b.note && <Html as="p" className="note" html={b.note} />}
      {inner}
    </div>
  );
}

function ContentCardView({ c, footer, topicId }: { c: ContentCard; footer?: string; topicId?: string }) {
  const one = c.blocks.length === 1;
  // Если узкий блок остаётся один среди широких, он тоже растягивается на всю ширину.
  const narrow = c.blocks.filter((b) => !(b.kind && WIDE_KINDS.has(b.kind)));
  const forceWide = narrow.length === 1;
  return (
    <Shell group={c.group ?? "present"} title={c.title} subtitle={c.subtitle} footer={footer} icon={cardIcon(c)} topicId={topicId}>
      <div className={`blocks${one ? " one" : ""}`}>
        {c.blocks.map((b, n) => (
          <BlockView key={n} b={b} forceWide={forceWide} />
        ))}
      </div>
    </Shell>
  );
}

function CompareCardView({ c, footer, topicId }: { c: CompareCard; footer?: string; topicId?: string }) {
  return (
    <Shell group={c.group ?? "present"} title={c.title} subtitle={c.subtitle} footer={footer} icon={cardIcon(c)} topicId={topicId}>
      <div className="cmp" style={{ gridTemplateColumns: `repeat(${c.columns.length}, minmax(0, 1fr))` }}>
        {c.columns.map((col, n) => (
          <div className={`cmp-col c-t${n + 1}`} key={n}>
            <div className="cmp-hd">{col.tense}</div>
            <div className="cmp-bd">
              {col.items.map((i, k) => (
                <div className="cmp-i" key={k}>
                  <div className="ttl">{i.case}</div>
                  {i.examples.map((e, j) => (
                    <Html key={j} as="p" className="ex2" html={e} />
                  ))}
                  {i.hint && <Html as="div" className="hint" html={i.hint} />}
                </div>
              ))}
              {col.time && (
                <div className="cmp-te">
                  <div className="lb">TIME EXPRESSIONS</div>
                  <div className="chips">
                    {col.time.map((t, j) => (
                      <Html key={j} className="chip" html={t} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {c.blocks && c.blocks.length > 0 && (
        <div className="blocks one">
          {c.blocks.map((b, n) => (
            <BlockView key={n} b={b} />
          ))}
        </div>
      )}
    </Shell>
  );
}

export function CardView({ card, footer, topicId }: { card: Card; footer?: string; topicId?: string }) {
  if (card.type === "form") return <FormCardView c={card} footer={footer} topicId={topicId} />;
  if (card.type === "compare") return <CompareCardView c={card} footer={footer} topicId={topicId} />;
  return <ContentCardView c={card} footer={footer} topicId={topicId} />;
}
