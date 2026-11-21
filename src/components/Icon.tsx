/**
 * Набір лінійних іконок платформи: сітка 24, штрих 1.75, круглі кінці.
 * Власного кольору немає: іконка бере currentColor (колір групи часу або ролі).
 */
const P: Record<string, string> = {
  // розділи
  cards: '<rect x="3" y="7" width="14" height="12" rx="2.5"/><path d="M7 4h11.5A2.5 2.5 0 0 1 21 6.5V15"/>',
  timeline: '<path d="M2 12h19"/><path d="M18 8.5l3.5 3.5-3.5 3.5"/><circle cx="8" cy="12" r="2.4" fill="currentColor" stroke="none"/>',
  tasks: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9l5 3-5 3z"/>',
  tests: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.2V3h6v1.2"/><path d="M9 13l2.2 2.2L15.2 11"/>',
  mindmap: '<circle cx="12" cy="12" r="2.6"/><path d="M9.4 12H7M14.6 12H17"/><path d="M7 12C5 12 5 6.500 2.500 6.500M7 12c-2 0-2 5.500-4.500 5.500M17 12c2 0 2-5.500 4.500-5.500M17 12c2 0 2 5.500 4.500 5.500"/>',
  // аспекти часів: міні-таймлайни
  simple: '<path d="M2 12h20"/><path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4"/>',
  continuous: '<path d="M2 12h4M18 12h4"/><rect x="6" y="8" width="12" height="8" rx="2.5"/>',
  perfect: '<path d="M2 12h2.5M19 12h3"/><rect x="4.5" y="8" width="11" height="8" rx="2.5"/><path d="M19 5.5v13"/>',
  perfcont: '<path d="M2 12h2.5M19 12h3"/><rect x="4.5" y="8" width="11" height="8" rx="2.5"/><path d="M7.5 12h.01M10 12h.01M12.5 12h.01"/><path d="M19 5.5v13"/>',
  // суміжні теми
  goto: '<path d="M3 12h11"/><path d="M10.5 8.5L14 12l-3.5 3.5"/><circle cx="19" cy="12" r="2.2"/>',
  state: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>',
  history: '<path d="M4.2 12a7.8 7.8 0 1 0 2.4-5.6"/><path d="M4 4.5V8h3.5"/><path d="M12 8v4.2l2.8 1.8"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M9 4v16M15 4v16"/>',
  versus: '<circle cx="9" cy="12" r="5.8"/><circle cx="15" cy="12" r="5.8"/>',
  // типи карток
  form: '<rect x="3" y="4" width="7.5" height="7" rx="1.8"/><rect x="13.5" y="4" width="7.5" height="7" rx="1.8"/><rect x="3" y="14" width="18" height="6" rx="1.8"/>',
  tobe: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 10h7M8.5 14h7"/>',
  spelling: '<path d="M4 20l1.2-4.2L16 5l3 3L8.2 18.8z"/><path d="M13.8 7.2l3 3"/>',
  used: '<path d="M4 6.2l1.4 1.4L8 5M4 12.2l1.4 1.4L8 11M4 18.2l1.4 1.4L8 17"/><path d="M11.5 6.5H20M11.5 12.5H20M11.5 18.5H20"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  compare: '<rect x="3" y="5" width="7" height="14" rx="1.8"/><rect x="14" y="5" width="7" height="14" rx="1.8"/><path d="M12 3v18" stroke-dasharray="1.5 3"/>',
  // ролі панелей
  plus: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8.2v7.6M8.2 12h7.6"/>',
  minus: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12h7.6"/>',
  question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.8a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8"/><path d="M12 16.6h.01"/>',
  reply: '<path d="M4 5.5h16v10.5H10l-6 4.5z"/>',
  alert: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4.2M12 16.8h.01"/>',
  quote: '<path d="M4 5.5h16v10.5H10l-6 4.5z"/><path d="M8 9.5h8M8 12.5h5"/>',
  // випадки вживання
  home: '<path d="M3.5 11.5L12 4.5l8.5 7"/><path d="M5.5 10v9.5h13V10"/>',
  repeat: '<path d="M17 3l3.5 3.5L17 10"/><path d="M3.5 11.5v-2a3 3 0 0 1 3-3h14"/><path d="M7 21l-3.5-3.5L7 14"/><path d="M20.5 12.5v2a3 3 0 0 1-3 3h-14"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
  spark: '<path d="M12 3l2 6.5 6.5 2.5-6.5 2-2 7-2-7-6.5-2 6.5-2.5z"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  train: '<rect x="5" y="3.5" width="14" height="13" rx="3"/><path d="M5 11h14M9 16.5l-2 4M15 16.5l2 4"/><path d="M9 13.8h.01M15 13.8h.01"/>',
  stopwatch: '<circle cx="12" cy="13.5" r="7"/><path d="M12 9.5v4l2.5 1.5M10 3h4M12 3v3.5"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.3l2.6 2.6 5-5.6"/>',
  hourglass: '<path d="M6 3.5h12M6 20.5h12"/><path d="M7 3.5c0 4.5 5 5.5 5 8.5s-5 4-5 8.500"/><path d="M17 3.5c0 4.5-5 5.5-5 8.5s5 4 5 8.5"/>',
  ban: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4.5h11l-2 4 2 4H5"/>',
  bolt: '<path d="M13 3L5 13.5h6l-1 7.5 8-10.5h-6z"/>',
  pin: '<path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0c0 5 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.2"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5 6.5-5s5.7 1.5 6.5 5"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.600M18.500 15.300c1.700.7 2.700 2.200 3 4.700"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.500h2"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 16l5-4.500 4 3.500 3-2.500 6 5"/><circle cx="15.500" cy="9.500" r="1.300"/>',
  xcircle: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9l6 6M15 9l-6 6"/>',
  rewind: '<path d="M11 6.500L4 12l7 5.500zM20 6.500L13 12l7 5.500z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.500c0 3 1.500 4.500 3.500 4.500M16 6h3.500c0 3-1.500 4.500-3.500 4.500M12 13v4M8.500 20.500h7M10 17h4"/>',
  steps: '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500"/>',
  eye: '<path d="M2.500 12s3.500-6.500 9.500-6.500 9.500 6.500 9.500 6.500-3.500 6.500-9.500 6.500S2.500 12 2.500 12z"/><circle cx="12" cy="12" r="2.8"/>',
  frown: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01"/><path d="M8.500 16c1-1.500 2.200-2 3.500-2s2.500.5 3.500 2"/>',
  trend: '<path d="M3.500 17l5.500-6 4 3.500 7-8"/><path d="M15 6.500h5v5"/>',
  star: '<path d="M12 3.500l2.600 5.400 5.900.8-4.300 4.100 1 5.900L12 16.900l-5.200 2.800 1-5.900-4.300-4.100 5.900-.8z"/>',
  hash: '<path d="M9 4L7.500 20M16.500 4L15 20M4.500 9h16M3.500 15h16"/>',
  back: '<path d="M9 7L4 12l5 5"/><path d="M4.500 12H15a4.500 4.500 0 0 1 0 9h-2"/>',
  heart: '<path d="M12 20s-7.500-4.500-7.500-10a4.300 4.300 0 0 1 7.500-2.800A4.300 4.300 0 0 1 19.500 10c0 5.500-7.500 10-7.500 10z"/>',
  // типи завдань
  quiz: '<path d="M4 5.5h16v10.5H10l-6 4.5z"/><path d="M10.2 9.3a2 2 0 1 1 2.8 1.8c-.6.3-1 .8-1 1.4"/>',
  match: '<rect x="2.5" y="8" width="7" height="8" rx="2"/><rect x="14.5" y="8" width="7" height="8" rx="2"/><path d="M9.5 12h5"/>',
  sort: '<path d="M4 6.5h10M4 12h7M4 17.5h4"/><path d="M18 5v14"/><path d="M15 16l3 3 3-3"/>',
  type: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/>',
  box: '<path d="M3.5 8.5l8.5-4 8.5 4-8.5 4z"/><path d="M3.5 8.5v7.5l8.5 4 8.5-4V8.5M12 12.5V20"/>',
  truefalse: '<path d="M2.5 12.5l3 3 5-6.5"/><path d="M14.5 9l6 6M20.5 9l-6 6"/>',
  gap: '<path d="M3 8h18M3 16h5M16 16h5"/><path d="M10.5 16h3" stroke-dasharray="0.1 3"/>',
  // інтерфейс
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20.5 20.5"/>',
  expand: '<path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1-4 4-5.5 7.5-5.5s6.500 1.500 7.500 5.500"/>',
  left: '<path d="M14.500 5.500L8 12l6.500 6.500"/>',
  right: '<path d="M9.500 5.500L16 12l-6.500 6.500"/>',
  external: '<path d="M13.500 4.500h6v6M19.500 4.500L11 13M17 13.500V19.500H4.500V7H10.500"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.8a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8"/><path d="M12 16.6h.01"/>',
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const d = P[name] ?? P.state;
  return (
    <svg className={`ic${className ? ` ${className}` : ""}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  );
}

/** Кольорова плитка з іконкою: тон кольору групи (--frame) 14%. */
export function Tile({ name, small }: { name: string; small?: boolean }) {
  return (
    <span className={`tile${small ? " sm" : ""}`}>
      <Icon name={name} size={small ? 18 : 22} />
    </span>
  );
}

/* ---------- відповідності ---------- */

/** Іконка теми або таймлайна за id: аспект часу як міні-таймлайн. */
export function topicIcon(id: string, tenses = 1): string {
  if (tenses > 1 || id.startsWith("combinations")) return "versus";
  if (id.includes("going-to")) return "goto";
  if (id === "stative-verbs") return "state";
  if (id === "used-to") return "history";
  if (id === "irregular-verbs") return "table";
  if (id.endsWith("perfect-continuous")) return "perfcont";
  if (id.endsWith("perfect")) return "perfect";
  if (id.endsWith("continuous")) return "continuous";
  if (id.endsWith("simple")) return "simple";
  return "cards";
}

export const ROLE_ICON: Record<string, string> = {
  positive: "plus",
  negative: "minus",
  question: "question",
  short_answer: "reply",
  careful: "alert",
};

export const BLOCK_ICON: Record<string, string> = {
  spelling: "spelling",
  pairs: "spelling",
  chips: "clock",
  uses: "used",
  text: "quote",
  lines: "used",
  careful: "alert",
  scenario: "compare",
  table: "table",
  verbs: "table",
};

/** Іконка картки за її типом і назвою. */
export function cardIcon(card: { type?: string; title: string; blocks?: { kind?: string }[] }): string {
  const t = card.title.toLowerCase();
  if (card.type === "compare") return "compare";
  if (card.type === "form") return t.includes("to be") ? "tobe" : "form";
  if (t.includes("spelling")) return "spelling";
  if (t.includes("time expressions")) return "clock";
  if (t.includes("irregular")) return "table";
  if (t.includes("is used") || t.includes("used to express")) return "used";
  const k = card.blocks?.[0]?.kind;
  return (k && BLOCK_ICON[k]) || "cards";
}

const EMOJI: Record<string, string> = {
  "🔮": "spark", "🎯": "target", "📅": "calendar", "📆": "calendar", "🗓": "calendar", "🎉": "calendar",
  "🚂": "train", "🚆": "train", "⏱": "stopwatch", "🧳": "stopwatch", "✅": "check", "⏳": "hourglass",
  "🕒": "clock", "🕰": "history", "⛔": "ban", "🚫": "ban", "🚶": "goto", "✈": "goto", "🔁": "repeat", "🍲": "repeat",
  "🙏": "question", "🤔": "question", "❓": "question", "🙋": "quiz", "🏁": "flag", "⚠": "alert", "⚡": "bolt",
  "💭": "quote", "💬": "quote", "📌": "pin", "📍": "pin", "👥": "users", "📞": "phone", "🌲": "image",
  "🤒": "xcircle", "🚗": "xcircle", "🚪": "xcircle", "🌧": "eye", "👀": "eye", "👁": "eye", "⏪": "rewind",
  "🏆": "trophy", "🏠": "home", "🏢": "home", "🔗": "steps", "🔒": "lock", "😤": "frown", "😠": "frown",
  "📈": "trend", "🍪": "perfect", "🔍": "search", "🎨": "spark", "🪂": "star", "🔢": "hash", "🌍": "globe",
  "🔙": "back", "🎬": "mic", "❤": "heart", "📦": "box", "🧊": "state",
};

/** Контент зберігає емодзі; на екрані показуємо відповідну лінійну іконку. */
export function emojiIcon(emoji?: string): string {
  if (!emoji) return "state";
  return EMOJI[emoji.replace(/️/g, "")] ?? "state";
}

const TASK: [string, string][] = [
  ["ігрова вікторина", "quiz"], ["вікторина", "quiz"], ["відповідники", "match"], ["сортування", "sort"],
  ["введіть відповідь", "type"], ["відкрийте коробку", "box"], ["правильно чи неправильно", "truefalse"], ["доповніть речення", "gap"],
];

export function taskIcon(type: string): string {
  const t = type.toLowerCase();
  return TASK.find(([k]) => t.includes(k))?.[1] ?? "tasks";
}

/* ---------- підпис часу: смужка-таймлайн у шапці картки ---------- */

/** Міні-таймлайн, що показує суть часу: де дія відносно NOW. Тільки для 12 часів. */
export function TenseSig({ topicId }: { topicId?: string }) {
  if (!topicId) return null;
  const m = /^(present|past|future)-(simple|continuous|perfect-continuous|perfect)$/.exec(topicId);
  if (!m) return null;
  const [, time, aspect] = m;
  const now = time === "present" ? 75 : time === "past" ? 112 : 38;
  // опорна точка дії: для present це NOW, для past лівіше, для future правіше
  const ref = time === "present" ? 75 : time === "past" ? 62 : 100;
  const cross = (x: number, k: number) => <path key={k} d={`M${x - 3.5} 16.5l7 7M${x + 3.5} 16.5l-7 7`} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />;
  const block = (x1: number, x2: number, dotted?: boolean) => (
    <g>
      <rect x={x1} y="13" width={x2 - x1} height="14" rx="4" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.6" />
      {dotted && <path d={`M${x1 + 6} 20H${x2 - 6}`} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 5" />}
    </g>
  );
  let marks: React.ReactNode;
  if (aspect === "simple") {
    marks = time === "present" ? [39, 57, 75, 93, 111].map(cross) : cross(ref, 0);
  } else if (aspect === "continuous") {
    marks = block(ref - 20, ref + 20);
  } else {
    // perfect / perfect continuous: блок закінчується в опорній точці
    marks = (
      <>
        {block(ref - 40, ref, aspect === "perfect-continuous")}
        {time !== "present" && <path d={`M${ref} 9v22`} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      </>
    );
  }
  return (
    <svg className="sig" viewBox="0 0 150 34" role="img" aria-label="Підпис часу">
      <path d="M4 20h138" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M138 16l5 4-5 4" stroke="var(--muted)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {marks}
      <path d={`M${now} 4v27`} stroke="var(--ink)" strokeWidth="1.4" strokeDasharray="2 3.5" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}
