#!/usr/bin/env node
/**
 * Добавляет задания Wordwall в content/tasks.json и скачивает превью в public/tasks/.
 *   node tools/wordwall.mjs <tense-id> "<Назва часу>" <url> [<url> ...]
 * Пример: node tools/wordwall.mjs present-simple "Present Simple" https://wordwall.net/uk/resource/123?wwmethod=link
 * Повторный запуск с той же ссылкой обновляет запись, а не дублирует.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [tense, tenseLabel, ...urls] = process.argv.slice(2);
if (!tense || !tenseLabel || urls.length === 0) {
  console.error('usage: node tools/wordwall.mjs <tense-id> "<Назва>" <url> [...]');
  process.exit(1);
}
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TASKS = path.join(ROOT, "content", "tasks.json");
const IMG = path.join(ROOT, "public", "previews");
fs.mkdirSync(IMG, { recursive: true });
const tasks = JSON.parse(fs.readFileSync(TASKS, "utf8"));
const UA = { "user-agent": "Mozilla/5.0" };
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) =>
  s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
   .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
   .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
const meta = (html, prop) => {
  const m = html.match(new RegExp(`property="${prop}" content="([^"]*)"`)) || html.match(new RegExp(`name="${prop}" content="([^"]*)"`));
  return m ? decode(m[1]) : "";
};

for (const url of urls) {
  const id = (url.match(/resource\/(\d+)/) || [])[1];
  if (!id) { console.error("no resource id in", url); continue; }
  // метаданные всегда берём с украинской версии страницы, чтобы типы заданий были одной мовою
  const html = await (await fetch(`https://wordwall.net/uk/resource/${id}`, { headers: UA })).text();
  const ogTitle = meta(html, "og:title");
  const desc = meta(html, "og:description");
  const type = desc.split(" - ")[0].trim();
  const img = meta(html, "og:image");
  let image = "";
  if (img) {
    const r = await fetch(img, { headers: UA });
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      const ext = (r.headers.get("content-type") || "").includes("png") ? "png" : "jpg";
      image = `/previews/${id}.${ext}`;
      fs.writeFileSync(path.join(IMG, `${id}.${ext}`), buf);
    }
  }
  const entry = { id, tense, tenseLabel, title: ogTitle, type, url, image };
  const idx = tasks.findIndex((t) => t.id === id || t.url === url);
  if (idx >= 0) tasks[idx] = { ...tasks[idx], ...entry };
  else tasks.push(entry);
  console.log(`${idx >= 0 ? "updated" : "added"}: ${ogTitle} · ${type} · ${image || "no image"}`);
}
fs.writeFileSync(TASKS, JSON.stringify(tasks, null, 2) + "\n");
