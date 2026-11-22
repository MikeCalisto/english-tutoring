/** Короткое имя карточки для переключателя: убираем название темы из заголовка. */
export function shortName(title: string, topic: string) {
  const s = title.replace(topic, "").replace(/^[\s—–-]+/, "").trim();
  return s || title;
}

/** Назва картки в перемикачі: типові картки українською, решта як у заголовку. */
export function pillLabel(c: { type?: string; title: string }, topic: string) {
  const t = c.title.toLowerCase();
  if (c.type === "form") return t.includes("to be") ? "To be" : "Форма";
  if (t.endsWith("spelling")) return "Правопис";
  if (t.endsWith("is used")) return "Використання";
  if (t.includes("time expressions")) return "Вирази часу";
  return shortName(c.title, topic);
}
