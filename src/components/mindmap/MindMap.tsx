"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import type { MindTense } from "@/content";

/**
 * Майндмеп часів: векторна карта (SVG), яку можна тягнути й масштабувати без втрати якості.
 * Радіальна карта: від центру три промені до Present, Past і Future, часи розходяться віялом навколо груп.
 */

type Kind = "root" | "group" | "tense" | "cat" | "leaf";
type GroupId = "present" | "past" | "future";

interface N {
  id: string;
  kind: Kind;
  label: string;
  group?: GroupId;
  sign?: "pos" | "neg" | "que";
  children: N[];
  // геометрія, яку заповнює розкладка
  w: number;
  h: number;
  x: number;
  cy: number;
  dir: 1 | -1;
}

interface Edge {
  d: string;
  group?: GroupId;
  key: string;
  /** лінія від центру до групи */
  main?: boolean;
  /** лінія від групи до часу */
  branch?: boolean;
}

const H: Record<Kind, number> = { root: 64, group: 40, tense: 32, cat: 26, leaf: 24 };
const FONT: Record<Kind, string> = { root: "600 28px", group: "600 15px", tense: "600 14px", cat: "600 13px", leaf: "400 13px" };
const PADX: Record<Kind, number> = { root: 28, group: 22, tense: 15, cat: 2, leaf: 2 };
const VGAP: Record<Kind, number> = { root: 0, group: 44, tense: 22, cat: 8, leaf: 3 };
const HGAP = 44;
const SIGN_W = 24;
const CATS: { key: "form" | "uses" | "time" | "spelling"; label: string }[] = [
  { key: "form", label: "Form" },
  { key: "uses", label: "Is used" },
  { key: "time", label: "Time expressions" },
  { key: "spelling", label: "Spelling" },
];
const GROUP_LABEL: Record<GroupId, string> = { present: "Present", past: "Past", future: "Future" };

function node(id: string, kind: Kind, label: string, group?: GroupId, children: N[] = [], sign?: N["sign"]): N {
  return { id, kind, label, group, sign, children, w: 0, h: H[kind], x: 0, cy: 0, dir: 1 };
}

function tenseNode(t: MindTense): N {
  const g = t.group as GroupId;
  const cats: N[] = [];
  for (const c of CATS) {
    let leaves: N[];
    if (c.key === "form") {
      leaves = (["pos", "neg", "que"] as const).map((s) => node(`${t.id}/form/${s}`, "leaf", t.form[s], g, [], s));
    } else {
      leaves = (t[c.key] ?? []).map((txt, i) => node(`${t.id}/${c.key}/${i}`, "leaf", txt, g));
    }
    if (leaves.length) cats.push(node(`${t.id}/${c.key}`, "cat", c.label, g, leaves));
  }
  return node(t.id, "tense", t.title, g, cats);
}

/* ---------- розкладка ---------- */

function visibleChildren(n: N, collapsed: Set<string>) {
  return collapsed.has(n.id) ? [] : n.children;
}

function subH(n: N, collapsed: Set<string>): number {
  const ch = visibleChildren(n, collapsed);
  if (ch.length === 0) return n.h;
  const sum = ch.reduce((a, c) => a + subH(c, collapsed), 0) + VGAP[ch[0].kind] * (ch.length - 1);
  return Math.max(n.h, sum);
}

/** Ставить вузол і його гілку. near — край, ближчий до центру карти. */
function place(n: N, near: number, top: number, dir: 1 | -1, collapsed: Set<string>) {
  n.dir = dir;
  n.x = dir > 0 ? near : near - n.w;
  const total = subH(n, collapsed);
  const ch = visibleChildren(n, collapsed);
  if (ch.length === 0) {
    n.cy = top + total / 2;
    return;
  }
  const sum = ch.reduce((a, c) => a + subH(c, collapsed), 0) + VGAP[ch[0].kind] * (ch.length - 1);
  let y = top + (total - sum) / 2;
  const childNear = dir > 0 ? n.x + n.w + HGAP : n.x - HGAP;
  for (const c of ch) {
    place(c, childNear, y, dir, collapsed);
    y += subH(c, collapsed) + VGAP[c.kind];
  }
  n.cy = (ch[0].cy + ch[ch.length - 1].cy) / 2;
}

const isText = (n: N) => n.kind === "cat" || n.kind === "leaf";
/** Точка кріплення лінії: у «пігулок» по центру висоти, у текстових вузлів по підкресленню. */
const ay = (n: N) => (isText(n) ? n.cy + n.h / 2 - 3 : n.cy);
const nearX = (n: N) => (n.dir > 0 ? n.x : n.x + n.w);
const farX = (n: N) => (n.dir > 0 ? n.x + n.w : n.x);

function curve(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}C${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

interface Layout {
  nodes: N[];
  edges: Edge[];
  box: { x: number; y: number; w: number; h: number };
}

interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const hit = (a: Rect, b: Rect, m: number) => a.x1 - m < b.x2 && a.x2 + m > b.x1 && a.y1 - m < b.y2 && a.y2 + m > b.y1;

/**
 * Радіальна розкладка. Кут 0° дивиться праворуч, 90° униз.
 * a — напрям групи від центру; fan — напрями її чотирьох часів (Simple, Continuous, Perfect, Perfect Continuous).
 */
const RADIAL: Record<GroupId, { a: number; fan: number[] }> = {
  present: { a: -90, fan: [-128, 165, -52, 15] },
  past: { a: 150, fan: [238, 178, 135, 96] },
  future: { a: 30, fan: [-58, 2, 45, 84] },
};
const R_GROUP = 250;
/** Чим вищі розгорнуті гілки, тим далі групи від центру: так вони не налазять одна на одну. */
const R_GROUP_GROW = 0.9;
const R_TENSE = 170;

function subtreeRect(t: N, collapsed: Set<string>): Rect {
  const r: Rect = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  const walk = (n: N) => {
    r.x1 = Math.min(r.x1, n.x);
    r.x2 = Math.max(r.x2, n.x + n.w);
    r.y1 = Math.min(r.y1, n.cy - n.h / 2);
    r.y2 = Math.max(r.y2, n.cy + n.h / 2);
    visibleChildren(n, collapsed).forEach(walk);
  };
  walk(t);
  return r;
}

function layout(root: N, groups: Record<GroupId, N>, tenses: MindTense[], byId: Map<string, N>, collapsed: Set<string>): Layout {
  const nodes: N[] = [root];
  const edges: Edge[] = [];
  const taken: Rect[] = [];

  root.x = -root.w / 2;
  root.cy = 0;
  taken.push({ x1: root.x, y1: -root.h / 2, x2: root.x + root.w, y2: root.h / 2 });

  // групи стоять на трьох променях від центру
  const order: GroupId[] = ["present", "past", "future"];
  const tallest = Math.max(...tenses.map((t) => subH(byId.get(t.id)!, collapsed)));
  const rGroup = R_GROUP + Math.max(0, tallest - 120) * R_GROUP_GROW;
  for (const id of order) {
    const g = groups[id];
    const a = rad(RADIAL[id].a);
    const cx = Math.cos(a) * rGroup;
    g.cy = Math.sin(a) * rGroup;
    g.x = cx - g.w / 2;
    g.dir = cx >= 0 ? 1 : -1;
    nodes.push(g);
    taken.push({ x1: g.x, y1: g.cy - g.h / 2, x2: g.x + g.w, y2: g.cy + g.h / 2 });
    edges.push({ key: `root>${id}`, group: id, main: true, d: `M0 0L${cx.toFixed(1)} ${g.cy.toFixed(1)}` });
  }

  // часи розходяться віялом навколо своєї групи; гілку відсуваємо по променю, доки вона не перестане зачіпати сусідів
  for (const id of order) {
    const g = groups[id];
    const gx = g.x + g.w / 2;
    const list = tenses.filter((t) => t.group === id).map((t) => byId.get(t.id)!);
    list.forEach((t, i) => {
      // шукаємо найближче вільне місце: спершу свій промінь, потім трохи повертаємо його, потім відсуваємо далі
      const base = RADIAL[id].fan[i % RADIAL[id].fan.length];
      const total = subH(t, collapsed);
      const tries: { r: number; da: number; cost: number }[] = [];
      for (let step = 0; step < 60; step++) {
        for (const da of [0, -10, 10, -20, 20, -30, 30]) tries.push({ r: R_TENSE + step * 22, da, cost: step * 22 + Math.abs(da) * 5 });
      }
      tries.sort((x, y) => x.cost - y.cost);
      let cos = 1, sin = 0;
      let dir: 1 | -1 = 1;
      let rect: Rect = { x1: 0, y1: 0, x2: 0, y2: 0 };
      for (const c of tries) {
        const a = rad(base + c.da);
        cos = Math.cos(a);
        sin = Math.sin(a);
        dir = cos >= 0 ? 1 : -1;
        const cx = gx + cos * c.r;
        const cy = g.cy + sin * c.r;
        place(t, dir > 0 ? cx - t.w / 2 : cx + t.w / 2, cy - total / 2, dir, collapsed);
        rect = subtreeRect(t, collapsed);
        if (!taken.some((o) => hit(rect, o, 16))) break;
      }
      taken.push(rect);

      // лінія від групи до часу: виходить уздовж променя, заходить у «пігулку» збоку або знизу чи згори
      const vertical = Math.abs(sin) > 0.78;
      const tx = vertical ? t.x + t.w / 2 : nearX(t);
      const ty = vertical ? t.cy + (sin < 0 ? t.h / 2 : -t.h / 2) : t.cy;
      const len = Math.hypot(tx - gx, ty - g.cy);
      const c1x = gx + cos * len * 0.45;
      const c1y = g.cy + sin * len * 0.45;
      const c2x = vertical ? tx : tx - dir * len * 0.4;
      const c2y = vertical ? ty + (sin < 0 ? 1 : -1) * len * 0.4 : ty;
      edges.push({ key: `${id}>${t.id}`, group: id, branch: true, d: `M${gx.toFixed(1)} ${g.cy.toFixed(1)}C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}` });

      const walk = (n: N) => {
        nodes.push(n);
        for (const c of visibleChildren(n, collapsed)) {
          edges.push({ key: `${n.id}>${c.id}`, group: c.group, d: curve(farX(n), ay(n), nearX(c), ay(c)) });
          walk(c);
        }
      };
      walk(t);
    });
  }

  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const n of nodes) {
    x1 = Math.min(x1, n.x);
    x2 = Math.max(x2, n.x + n.w);
    y1 = Math.min(y1, n.cy - n.h / 2);
    y2 = Math.max(y2, n.cy + n.h / 2);
  }
  return { nodes, edges, box: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } };
}

/* ---------- компонент ---------- */

interface View {
  k: number;
  x: number;
  y: number;
}

const MIN_K = 0.12;
const MAX_K = 4;

export function MindMap({ title, tenses }: { title: string; tenses: MindTense[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;

  // дерево будується один раз; ширини вузлів міряємо в браузері після завантаження шрифтів
  const tree = useMemo(() => {
    const byId = new Map<string, N>();
    const tn = tenses.map(tenseNode);
    const reg = (n: N) => {
      byId.set(n.id, n);
      n.children.forEach(reg);
    };
    tn.forEach(reg);
    const groups = {
      present: node("g/present", "group", GROUP_LABEL.present, "present"),
      past: node("g/past", "group", GROUP_LABEL.past, "past"),
      future: node("g/future", "group", GROUP_LABEL.future, "future"),
    };
    const root = node("root", "root", title);
    const all = [root, ...Object.values(groups), ...byId.values()];
    return { root, groups, byId, all };
  }, [tenses, title]);

  // спочатку відкрито до категорій (Form, Is used…); клік по гілці розгортає її
  const allCats = useMemo(() => tree.all.filter((n) => n.kind === "cat").map((n) => n.id), [tree]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(allCats));

  useEffect(() => {
    let alive = true;
    const measure = () => {
      const cs = getComputedStyle(document.documentElement);
      const body = cs.getPropertyValue("--font-body").trim() || "sans-serif";
      const display = cs.getPropertyValue("--font-display").trim() || body;
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      for (const n of tree.all) {
        ctx.font = `${FONT[n.kind]} ${n.kind === "root" || n.kind === "group" ? display : body}, sans-serif`;
        n.w = Math.ceil(ctx.measureText(n.label).width) + PADX[n.kind] * 2 + (n.sign ? SIGN_W : 0);
      }
      if (alive) setReady(true);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(measure);
    return () => {
      alive = false;
    };
  }, [tree]);

  const lay = useMemo(
    () => (ready ? layout(tree.root, tree.groups, tenses, tree.byId, collapsed) : null),
    [ready, tree, tenses, collapsed],
  );

  const fit = useCallback(() => {
    const el = wrap.current;
    if (!el || !lay) return;
    const { width, height } = el.getBoundingClientRect();
    // знизу лишаємо місце під панель масштабу
    const padX = 48, padTop = 36, padBottom = 92;
    const k = Math.min(MAX_K, Math.max(MIN_K, Math.min((width - padX * 2) / lay.box.w, (height - padTop - padBottom) / lay.box.h, 1.25)));
    setView({ k, x: width / 2 - (lay.box.x + lay.box.w / 2) * k, y: padTop + (height - padTop - padBottom) / 2 - (lay.box.y + lay.box.h / 2) * k });
  }, [lay]);

  // перше вписування в екран
  const fitted = useRef(false);
  useEffect(() => {
    if (lay && !fitted.current) {
      fitted.current = true;
      fit();
    }
  }, [lay, fit]);

  const zoomAt = useCallback((factor: number, cx?: number, cy?: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = cx ?? r.width / 2;
    const py = cy ?? r.height / 2;
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
      const f = k / v.k;
      return { k, x: px - (px - v.x) * f, y: py - (py - v.y) * f };
    });
  }, []);

  // коліщатко миші масштабує, тачпад двома пальцями рухає, щипок масштабує
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mouseWheel = e.deltaMode !== 0 || (e.deltaX === 0 && Math.abs(e.deltaY) >= 50 && Number.isInteger(e.deltaY));
      if (e.ctrlKey || e.metaKey || mouseWheel) {
        const step = e.ctrlKey ? Math.exp(-e.deltaY * 0.01) : e.deltaY < 0 ? 1.15 : 1 / 1.15;
        zoomAt(step, e.clientX - r.left, e.clientY - r.top);
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // перетягування мишею або пальцем, щипок двома пальцями
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; k: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    setDragging(true);
  };
  useEffect(() => {
    if (!dragging) return;
    const el = wrap.current;
    const move = (e: PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      const pts = pointers.current;
      if (pts.size === 2 && el) {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const r = el.getBoundingClientRect();
        if (pinch.current) zoomAt(d / pinch.current.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
        pinch.current = { d, k: viewRef.current.k };
        moved.current = true;
        return;
      }
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    const up = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      pinch.current = null;
      if (pointers.current.size === 0) setDragging(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, zoomAt]);

  // клавіатура: + і − масштабують, 0 вписує карту в екран
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "+" || e.key === "=") zoomAt(1.2);
      else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.2);
      else if (e.key === "0") fit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomAt, fit]);

  const toggle = (n: N) => {
    if (moved.current || n.children.length === 0) return;
    setCollapsed((s) => {
      const next = new Set(s);
      if (next.has(n.id)) next.delete(n.id);
      else next.add(n.id);
      return next;
    });
  };

  const allOpen = collapsed.size === 0;
  const toggleAll = () => {
    setCollapsed(allOpen ? new Set(allCats) : new Set());
    fitted.current = false;
  };

  return (
    <div className={`mm${dragging ? " drag" : ""}`} ref={wrap} onPointerDown={onPointerDown}>
      {lay && (
        <svg className="mm-svg" role="img" aria-label="Майндмеп часів англійської">
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            <g className="mm-edges">
              {lay.edges.map((e) => (
                <path key={e.key} d={e.d} className={`mm-e g-${e.group ?? "present"}${e.main ? " main" : ""}${e.branch ? " branch" : ""}`} />
              ))}
            </g>
            {lay.nodes.map((n) => {
              const closed = collapsed.has(n.id) && n.children.length > 0;
              const can = n.children.length > 0;
              const top = n.cy - n.h / 2;
              const signX = n.dir > 0 ? n.x + PADX.leaf + 9 : n.x + PADX.leaf + 9;
              const textX = n.sign ? n.x + PADX[n.kind] + SIGN_W : n.x + PADX[n.kind];
              return (
                <g key={n.id} className={`mm-n k-${n.kind}${n.group ? ` g-${n.group}` : ""}${can ? " can" : ""}`} onClick={() => toggle(n)}>
                  {(n.kind === "group" || n.kind === "tense" || n.kind === "root") && <rect x={n.x} y={top} width={n.w} height={n.h} rx={n.h / 2} className="mm-pill" />}
                  {isText(n) && <path d={`M${n.x} ${ay(n)}H${n.x + n.w}`} className="mm-under" />}
                  {isText(n) && <rect x={n.x} y={top} width={n.w} height={n.h} className="mm-hit" />}
                  {n.sign && (
                    <g className={`mm-sign s-${n.sign}`}>
                      <circle cx={signX} cy={n.cy - 2} r="8" />
                      <text x={signX} y={n.cy - 2} textAnchor="middle" dominantBaseline="central">{n.sign === "pos" ? "+" : n.sign === "neg" ? "−" : "?"}</text>
                    </g>
                  )}
                  <text x={n.kind === "root" ? 0 : textX} y={isText(n) ? n.cy - 2 : n.cy} textAnchor={n.kind === "root" ? "middle" : "start"} dominantBaseline="central" className="mm-t">
                    {n.label}
                  </text>
                  {closed && (
                    <g className="mm-more">
                      <circle cx={farX(n) + n.dir * 13} cy={ay(n)} r="9" />
                      <text x={farX(n) + n.dir * 13} y={ay(n)} textAnchor="middle" dominantBaseline="central">{n.children.length}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      )}
      <div className="mm-bar" onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => zoomAt(1 / 1.25)} aria-label="Зменшити" title="Зменшити (−)">−</button>
        <button type="button" className="mm-pct" onClick={() => zoomAt(1 / view.k)} title="Масштаб 100%">{Math.round(view.k * 100)}%</button>
        <button type="button" onClick={() => zoomAt(1.25)} aria-label="Збільшити" title="Збільшити (+)">+</button>
        <span className="mm-sep" />
        <button type="button" onClick={fit} title="Вмістити всю карту (0)"><Icon name="expand" size={14} />Вмістити</button>
        <button type="button" onClick={toggleAll}><Icon name={allOpen ? "minus" : "plus"} size={14} />{allOpen ? "Згорнути все" : "Розгорнути все"}</button>
      </div>
      <div className="mm-hint">Тягніть карту · коліщатко або щипок масштабує · клік по гілці розгортає її</div>
    </div>
  );
}
