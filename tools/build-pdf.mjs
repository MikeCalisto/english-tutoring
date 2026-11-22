// Друкує сторінку /pdf у PDF через встановлений Chrome (без додаткових пакетів).
//   node tools/build-pdf.mjs <url> <файл з токеном сесії> <куди зберегти.pdf>
// Токен читається з файлу і ніде не друкується. Сторінка /pdf відкрита тільки адміністратору.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [, , url, tokenFile, out] = process.argv;
if (!url || !tokenFile || !out) {
  console.error("usage: node tools/build-pdf.mjs <url> <token-file> <out.pdf>");
  process.exit(1);
}
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9377;
const profile = fs.mkdtempSync(path.join(process.env.PDF_TMP || os.tmpdir(), "pdf-chrome-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome did not start");
}

try {
  const ws = new WebSocket(await target());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const wait = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && wait.has(d.id)) {
      const { res, rej } = wait.get(d.id);
      wait.delete(d.id);
      d.error ? rej(new Error(d.error.message)) : res(d.result);
    }
  };
  const send = (method, params = {}) => new Promise((res, rej) => { wait.set(++id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });

  const u = new URL(url);
  await send("Network.enable");
  await send("Network.setCookie", { name: "sid", value: fs.readFileSync(tokenFile, "utf8").trim(), domain: u.hostname, path: "/", httpOnly: true });
  // верстаємо одразу в режимі друку на ширині аркуша, щоб вписування рахувалось так само, як у PDF
  await send("Emulation.setEmulatedMedia", { media: "print" });
  await send("Emulation.setDeviceMetricsOverride", { width: 1123, height: 794, deviceScaleFactor: 1, mobile: false });
  await send("Page.enable");
  await send("Page.navigate", { url });

  let ready = false;
  for (let i = 0; i < 240 && !ready; i++) {
    await sleep(250);
    const r = await send("Runtime.evaluate", { expression: "document.documentElement.dataset.pdfReady === '1'" });
    ready = r.result?.value === true;
  }
  if (!ready) throw new Error("page did not report ready (not logged in as admin?)");
  const info = await send("Runtime.evaluate", { expression: "JSON.stringify({pages: document.querySelectorAll('.pdf-page').length, fit: document.documentElement.dataset.pdfFit, path: location.pathname})" });
  console.log(info.result.value);
  // перевірка: картка не виходить за свою сторінку, і всередині картки нічого не стирчить за її край
  const audit = await send("Runtime.evaluate", { expression: `(() => {
    const out = [];
    document.querySelectorAll(".pdf-page").forEach((pg) => {
      const pr = pg.getBoundingClientRect();
      const stage = pg.querySelector(".pdf-stage");
      if (!stage) { for (const el of pg.querySelectorAll("*")) { const r = el.getBoundingClientRect(); if (r.width && (r.bottom > pr.bottom + 1 || r.right > pr.right + 1)) { out.push(pg.id + ": " + el.className + " out of page"); break; } } return; }
      const sr = stage.getBoundingClientRect();
      const card = stage.querySelector(".card");
      const cr = card.getBoundingClientRect();
      if (cr.bottom > sr.bottom + 1 || cr.right > sr.right + 1 || cr.left < sr.left - 1) out.push(pg.id + ": card does not fit the page");
      if (+stage.dataset.scale < 0.78) out.push(pg.id + ": small scale " + stage.dataset.scale);
      const bad = new Set();
      for (const el of card.querySelectorAll("*")) {
        if (el.closest("svg") && el.tagName !== "svg") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (r.right > cr.right + 1 || r.left < cr.left - 1) bad.add(el.tagName.toLowerCase() + "." + el.className);
        const p = el.parentElement.getBoundingClientRect();
        const pos = getComputedStyle(el).position;
        if (pos !== "absolute" && getComputedStyle(el.parentElement).display !== "inline" && r.right > p.right + 2) bad.add(el.tagName.toLowerCase() + "." + el.className + " wider than parent");
      }
      if (bad.size) out.push(pg.id + ": " + [...bad].slice(0, 4).join(" | "));
    });
    return out.length ? out.join("\\n") : "audit: all pages fit";
  })()` });
  console.log(audit.result.value);

  const pdf = await send("Page.printToPDF", {
    // розмір паперу задаємо явно: за ним Chrome рахує ширину для media-запитів (інакше бере Letter)
    landscape: false, paperWidth: 297 / 25.4, paperHeight: 210 / 25.4, printBackground: true, preferCSSPageSize: true,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    generateDocumentOutline: true, generateTaggedPDF: true,
  });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, Buffer.from(pdf.data, "base64"));
  console.log("saved", out, Math.round(fs.statSync(out).size / 1024) + " KB");
  ws.close();
} finally {
  chrome.kill();
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
}
