import type { Group, TLLane, TLSentence, Timeline } from "@/content/types";
import { BRAND } from "@/config/brand";

const W = 800;
const H = 158;
const X0 = 30;
const X1 = 764;
const AX = 82;
const BAND: [number, number] = [58, 106];

const px = (f: number) => X0 + f * (X1 - X0);

function Cross({ x, t, small }: { x: number; t: 1 | 2; small?: boolean }) {
  const r = small ? 8 : 12;
  const sw = small ? 4.5 : 6;
  return (
    <path
      d={`M${(x - r).toFixed(1)} ${AX - r}l${2 * r} ${2 * r}M${(x + r).toFixed(1)} ${AX - r}l${-2 * r} ${2 * r}`}
      className={`tl-point t${t}`}
      style={{ strokeWidth: sw }}
    />
  );
}

function LaneSvg({ l, gid }: { l: TLLane; gid: string }) {
  const hasOpen = l.spans?.some((s) => s.openStart);
  const nx = px(l.nowAt);
  const tm = l.timeMark;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tlsvg" role="img">
      {hasOpen && (
        <defs>
          <linearGradient id={`fade-${gid}`} x1="0" x2="1">
            <stop offset="0" stopColor="var(--t1)" stopOpacity="0" />
            <stop offset=".35" stopColor="var(--t1)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--t1)" stopOpacity=".28" />
          </linearGradient>
          <linearGradient id={`fadeS-${gid}`} x1="0" x2="1">
            <stop offset="0" stopColor="var(--t1)" stopOpacity="0" />
            <stop offset=".4" stopColor="var(--t1)" stopOpacity="1" />
          </linearGradient>
        </defs>
      )}
      <text x={X0} y="24" className="tl-axis">past</text>
      <text x={X1 + 6} y="24" textAnchor="end" className="tl-axis">future</text>
      {l.spans?.map((s, n) => {
        const t = s.t ?? 1;
        const x1 = px(s.from);
        const x2 = px(s.to);
        return (
          <g key={n}>
            {s.openStart ? (
              <>
                <rect x={x1} y={BAND[0]} width={x2 - x1} height={BAND[1] - BAND[0]} rx="10" fill={`url(#fade-${gid})`} />
                <path d={`M${x1} ${BAND[0]}H${x2}V${BAND[1]}H${x1}`} fill="none" stroke={`url(#fadeS-${gid})`} strokeWidth="2" />
              </>
            ) : (
              <rect x={x1} y={BAND[0]} width={x2 - x1} height={BAND[1] - BAND[0]} rx="10" className={`tl-span t${t}`} />
            )}
            {s.label && (
              <text x={(x1 + x2) / 2} y={BAND[0] - 8} textAnchor="middle" className={`tl-lbl t${t}`}>{s.label}</text>
            )}
          </g>
        );
      })}
      <line x1={X0} y1={AX} x2={X1} y2={AX} className="tl-line" />
      <path d={`M${X1 - 4} ${AX - 11}l16 11-16 11`} className="tl-line" fill="none" />
      <line x1={nx} y1="36" x2={nx} y2="128" className="tl-now-line" />
      <rect x={nx - 30} y="6" width="60" height="24" rx="12" className="tl-now" />
      <text x={nx} y="22.5" textAnchor="middle" className="tl-now-t">NOW</text>
      {l.points?.map((p, n) => (
        <Cross key={n} x={px(p.at)} t={p.t ?? 1} small={p.small} />
      ))}
      {l.ticks?.map((tk, n) => (
        <text key={n} x={px(tk.at)} y="126" textAnchor="middle" className="tl-tick">{tk.text}</text>
      ))}
      {tm && (() => {
        const a = px(tm.from);
        const b = px(tm.to);
        const y = 136;
        return (
          <g>
            {Math.abs(b - a) < 2 ? (
              <line x1={a} y1={y - 6} x2={a} y2={y} className="tl-tm" />
            ) : (
              <path d={`M${a} ${y - 6}v6H${b}v-6`} fill="none" className="tl-tm" />
            )}
            <text x={(a + b) / 2} y={y + 12} textAnchor="middle" className="tl-time">{tm.text}</text>
          </g>
        );
      })()}
    </svg>
  );
}

function Sentence({ s }: { s: TLSentence }) {
  return (
    <div className="sent">
      <div className="sentence">
        {s.tokens.map((tk, n) =>
          tk.mark === "time" ? (
            <span key={n} className="w-time">{tk.text}</span>
          ) : tk.mark ? (
            <span key={n} className={`w-${tk.mark}`}>{tk.text}</span>
          ) : (
            <span key={n}>{tk.text}</span>
          ),
        )}
      </div>
      {s.note && <div className="tl-note">{s.note}</div>}
    </div>
  );
}

export function TimelineCard({ t, footer }: { t: Timeline; footer?: string }) {
  const group: Group = t.group;
  const two = t.tenses.length > 1;
  return (
    <div className={`card g-${group} tl`}>
      <div className="card-hd">
        <div className="card-t">
          <span className="card-h">{t.title}</span>
          {t.subtitle && <span className="card-sub">{t.subtitle}</span>}
        </div>
        <div className="tchips">
          {t.tenses.map((n, i) => (
            <span key={i} className={`tchip t${i + 1}`}>{n}</span>
          ))}
        </div>
      </div>
      <div className="card-bd">
        {t.lanes.map((l, i) => (
          <div className="lane" key={i}>
            <LaneSvg l={l} gid={`${t.id}-${i}`} />
            <div className="lane-txt">
              {l.sentences.map((s, k) => (
                <Sentence key={k} s={s} />
              ))}
            </div>
          </div>
        ))}
        <div className="tl-lg">
          <div><span className="lg-sq t1" /> {t.tenses[0]}</div>
          {two && <div><span className="lg-sq t2" /> {t.tenses[1]}</div>}
          <div>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className="lg-x">
              <path d="M3 1l12 12M15 1L3 13" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            one action at a point
          </div>
          <div><span className="lg-block" /> action with duration</div>
          <div><span className="lg-time" /> time expression</div>
        </div>
      </div>
      <div className="card-ft">
        <span>{BRAND.name}</span>
        <span>{footer}</span>
      </div>
    </div>
  );
}
