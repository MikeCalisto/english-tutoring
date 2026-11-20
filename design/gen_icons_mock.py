#!/usr/bin/env python3
"""Макет «іконки на платформі»: 5 артбордів для canvas типу Design.
Стилі беруться прямо з src/app/globals.css, щоб макет збігався з платформою.
Запуск: python3 design/gen_icons_mock.py <out_root>   -> <out_root>/project/*.dc.html + canvas.json
"""
import json, pathlib, sys, datetime

REPO = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(sys.argv[1]) / "project"
OUT.mkdir(parents=True, exist_ok=True)
PLATFORM_CSS = (REPO / "src/app/globals.css").read_text(encoding="utf-8")

# ---------- набір іконок: сітка 24, штрих 1.75, круглі кінці ----------
ICONS = {
    # розділи
    "cards": '<rect x="3" y="7" width="14" height="12" rx="2.5"/><path d="M7 4h11.5A2.5 2.5 0 0 1 21 6.5V15"/>',
    "timeline": '<path d="M2 12h19"/><path d="M18 8.5l3.5 3.5-3.5 3.5"/><circle cx="8" cy="12" r="2.4" fill="currentColor" stroke="none"/>',
    "tasks": '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    "tests": '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.2V3h6v1.2"/><path d="M9 13l2.2 2.2L15.2 11"/>',
    # аспекти часів: міні-таймлайни
    "simple": '<path d="M2 12h20"/><path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4"/>',
    "continuous": '<path d="M2 12h4M18 12h4"/><rect x="6" y="8" width="12" height="8" rx="2.5"/>',
    "perfect": '<path d="M2 12h2.5M19 12h3"/><rect x="4.5" y="8" width="11" height="8" rx="2.5"/><path d="M19 5.5v13"/>',
    "perfcont": '<path d="M2 12h2.5M19 12h3"/><rect x="4.5" y="8" width="11" height="8" rx="2.5"/><path d="M7.5 12h.01M10 12h.01M12.5 12h.01"/><path d="M19 5.5v13"/>',
    # суміжні теми
    "goto": '<path d="M3 12h11"/><path d="M10.5 8.5L14 12l-3.5 3.5"/><circle cx="19" cy="12" r="2.2"/>',
    "state": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>',
    "history": '<path d="M4.2 12a7.8 7.8 0 1 0 2.4-5.6"/><path d="M4 4.5V8h3.5"/><path d="M12 8v4.2l2.8 1.8"/>',
    "table": '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M9 4v16M15 4v16"/>',
    "versus": '<circle cx="9" cy="12" r="5.8"/><circle cx="15" cy="12" r="5.8"/>',
    # типи карток
    "form": '<rect x="3" y="4" width="7.5" height="7" rx="1.8"/><rect x="13.5" y="4" width="7.5" height="7" rx="1.8"/><rect x="3" y="14" width="18" height="6" rx="1.8"/>',
    "tobe": '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 10h7M8.5 14h7"/>',
    "spelling": '<path d="M4 20l1.2-4.2L16 5l3 3L8.2 18.8z"/><path d="M13.8 7.2l3 3"/>',
    "used": '<path d="M4 6.2l1.4 1.4L8 5M4 12.2l1.4 1.4L8 11M4 18.2l1.4 1.4L8 17"/><path d="M11.5 6.5H20M11.5 12.5H20M11.5 18.5H20"/>',
    "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    "compare": '<rect x="3" y="5" width="7" height="14" rx="1.8"/><rect x="14" y="5" width="7" height="14" rx="1.8"/><path d="M12 3v18" stroke-dasharray="1.5 3"/>',
    # ролі панелей
    "plus": '<circle cx="12" cy="12" r="8.5"/><path d="M12 8.2v7.6M8.2 12h7.6"/>',
    "minus": '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12h7.6"/>',
    "question": '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.8a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8"/><path d="M12 16.6h.01"/>',
    "reply": '<path d="M4 5.5h16v10.5H10l-6 4.5z"/>',
    "alert": '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4.2M12 16.8h.01"/>',
    "quote": '<path d="M4 5.5h16v10.5H10l-6 4.5z"/><path d="M8 9.5h8M8 12.5h5"/>',
    # випадки вживання
    "home": '<path d="M3.5 11.5L12 4.5l8.5 7"/><path d="M5.5 10v9.5h13V10"/>',
    "repeat": '<path d="M17 3l3.5 3.5L17 10"/><path d="M3.5 11.5v-2a3 3 0 0 1 3-3h14"/><path d="M7 21l-3.5-3.5L7 14"/><path d="M20.5 12.5v2a3 3 0 0 1-3 3h-14"/>',
    "globe": '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
    "calendar": '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    "mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
    # типи завдань
    "quiz": '<path d="M4 5.5h16v10.5H10l-6 4.5z"/><path d="M10.2 9.3a2 2 0 1 1 2.8 1.8c-.6.3-1 .8-1 1.4"/>',
    "match": '<rect x="2.5" y="8" width="7" height="8" rx="2"/><rect x="14.5" y="8" width="7" height="8" rx="2"/><path d="M9.5 12h5"/>',
    "sort": '<path d="M4 6.5h10M4 12h7M4 17.5h4"/><path d="M18 5v14"/><path d="M15 16l3 3 3-3"/>',
    "type": '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9"/>',
    "box": '<path d="M3.5 8.5l8.5-4 8.5 4-8.5 4z"/><path d="M3.5 8.5v7.5l8.5 4 8.5-4V8.5M12 12.5V20"/>',
    "truefalse": '<path d="M2.5 12.5l3 3 5-6.5"/><path d="M14.5 9l6 6M20.5 9l-6 6"/>',
    "gap": '<path d="M3 8h18M3 16h5M16 16h5"/><path d="M10.5 16h3" stroke-dasharray="0.1 3"/>',
    # інтерфейс
    "search": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20.5 20.5"/>',
    "expand": '<path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15"/>',
    "moon": '<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2z"/>',
    "user": '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1-4 4-5.5 7.5-5.5s6.5 1.500 7.5 5.5"/>',
    "left": '<path d="M14.500 5.500L8 12l6.500 6.500"/>',
    "right": '<path d="M9.500 5.500L16 12l-6.500 6.500"/>',
    "external": '<path d="M13.500 4.500h6v6M19.500 4.500L11 13M17 13.500V19.500H4.500V7H10.500"/>',
}


def ic(name, size=16, cls=""):
    return (f'<svg class="ic {cls}" width="{size}" height="{size}" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>')


def tile(name, cls=""):
    size = 18 if "sm" in cls else 22
    return f'<span class="tile {cls}">{ic(name, size)}</span>'


LOGO = ('<svg viewBox="0 0 64 64" width="26" height="26" style="border-radius:7px;display:block" aria-hidden="true"><rect width="64" height="64" fill="#1F2429"/>'
        '<line x1="10" y1="40" x2="54" y2="40" stroke="#F3EFE4" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="17" x2="32" y2="31" stroke="#4DD6B8" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 5"/>'
        '<circle cx="19" cy="40" r="5" fill="#82A7FF"/><circle cx="32" cy="40" r="6.5" fill="#4DD6B8"/><circle cx="45" cy="40" r="5" fill="#F5A95B"/></svg>')

EXTRA_CSS = '''
/* ---------- макет: шрифти платформи ---------- */
:root{--font-display:"Geologica";--font-body:"Manrope";--font-mono:"JetBrains Mono"}
body{margin:0}
a{color:inherit}a:hover{color:inherit}
.shell{min-height:0}
.rail{position:static;max-height:none}
.topbar{position:static}
/* ---------- НОВЕ: іконки ---------- */
.ic{flex:none;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
.tile{width:44px;height:44px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;flex:none;background:color-mix(in srgb,var(--frame) 14%,var(--paper));color:var(--frame)}
.tile.sm{width:34px;height:34px;border-radius:11px}
.tab{display:inline-flex;align-items:center;gap:7px}
.rail a .lbl,.rail .dis .lbl{display:inline-flex;align-items:center;gap:9px}
.rail a .ic{color:var(--frame);opacity:.85}
.rail a.on .ic{opacity:1}
.rail-h{display:flex;align-items:center;gap:7px}
.rail-h i{width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block}
.crumb2{display:inline-flex;align-items:center;gap:6px}
.pn-lb{display:inline-flex;align-items:center;gap:6px}
.blk h4,.exs-h,.warn-h{display:flex;align-items:center;gap:7px}
.card-hd .hd-l{display:flex;align-items:center;gap:14px}
.card-hd .hd-r{display:flex;align-items:center;gap:14px}
.sig{width:150px;height:34px;color:var(--frame)}
.u .tile{margin-top:1px}
.tcard-type{display:inline-flex;align-items:center;gap:6px}
.tcard-noimg{font-size:13px;gap:8px;flex-direction:column}
.btn .ic{opacity:.8}
.tl-lg .ic{color:var(--muted)}
.empty{display:flex;flex-direction:column;align-items:center;gap:10px}
.empty .tile{width:56px;height:56px;border-radius:18px}
/* аркуш іконок */
.sheet{padding:44px 48px 56px;display:flex;flex-direction:column;gap:30px;color:var(--ink);font-family:var(--body)}
.sheet h1{font-family:var(--display);font-weight:500;font-size:34px;letter-spacing:-.02em;margin:0}
.sheet .lead{font-size:16px;color:var(--muted);margin:6px 0 0;max-width:70ch;line-height:1.5}
.rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.rule{background:var(--surface);border:1px solid var(--line);border-radius:var(--rp);padding:16px 18px;box-shadow:var(--shadow-sm)}
.rule b{font-family:var(--display);font-weight:500;font-size:15px;color:var(--ink);display:block;margin-bottom:4px}
.rule span{font-size:13px;color:var(--muted);line-height:1.45;display:block}
.set h2{font-family:var(--display);font-weight:600;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
.set .grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
.it{background:var(--surface);border:1px solid var(--line);border-radius:var(--rp);padding:14px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow-sm)}
.it b{font-size:13.5px;font-weight:600;color:var(--ink);display:block}
.it span.w{font-size:11.5px;color:var(--muted);display:block;line-height:1.3}
'''


def page(title, body, w, h):
    return f'''<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geologica:wght@400;500;600&family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
{PLATFORM_CSS}
{EXTRA_CSS}
</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''


# ---------- спільні частини екрана ----------
def topbar(active):
    tabs = [("cards", "Картки"), ("timeline", "Таймлайни"), ("tasks", "Завдання"), ("tests", "Тести")]
    t = "".join(f'<a class="tab{" on" if k == active else ""}" href="#">{ic(k)}{label}</a>' for k, label in tabs)
    return (f'<header class="topbar"><a class="brand" href="#">{LOGO}english-tutors</a><nav class="tabs">{t}</nav><div class="grow"></div>'
            f'<button class="search" type="button">{ic("search", 14)}<span>Пошук…</span><kbd>⌘K</kbd></button>'
            f'<button class="theme-btn" type="button" aria-label="Перемкнути тему">{ic("moon")}</button>'
            f'<button class="btn" type="button">{ic("expand", 14)}Проєктор</button>'
            f'<a class="btn" href="#">{ic("user", 14)}Михаил Земляной</a></header>')


RAIL_CARDS = [
    ("present", "Present", [("simple", "Present Simple", 4), ("continuous", "Present Continuous", 3), ("perfect", "Present Perfect", 5), ("perfcont", "Present Perfect Continuous", 2)]),
    ("past", "Past", [("simple", "Past Simple", 4), ("continuous", "Past Continuous", 3), ("perfect", "Past Perfect", 2), ("perfcont", "Past Perfect Continuous", 2)]),
    ("future", "Future", [("simple", "Future Simple", 3), ("continuous", "Future Continuous", 2), ("perfect", "Future Perfect", 2), ("perfcont", "Future Perfect Continuous", 2)]),
    ("other", "Інше", [("goto", "To be going to", 2), ("state", "Stative verbs", 2), ("history", "Used to", 2), ("table", "Irregular verbs", 1), ("versus", "Сполучення: пари", 5), ("versus", "Сполучення: сценарії", 5), ("versus", "Сполучення: огляди", 3)]),
]


def rail(groups, active):
    out = '<aside class="rail">'
    for gid, label, items in groups:
        out += f'<div class="g-{gid}"><div class="rail-h {gid}"><i></i>{label.upper()}</div>'
        for icon, name, cnt in items:
            on = ' class="on"' if name == active else ""
            c = f'<span class="cnt">{cnt}</span>' if cnt else ""
            out += f'<a{on} href="#"><span class="lbl">{ic(icon)}{name}</span>{c}</a>'
        out += "</div>"
    return out + "</aside>"


def subnav(group, items, active, pos):
    crumbs = "".join(f'<button class="crumb2 g-{group}{" on" if n == active else ""}" type="button">{ic(i, 14)}{n}</button>' for i, n in items)
    return (f'<div class="subnav subnav-row"><span class="grp g-{group}">{group.upper()}</span>{crumbs}<div class="grow"></div>'
            f'<div class="pager"><button type="button" aria-label="Попередня">{ic("left")}</button><span>{pos}</span><button type="button" aria-label="Наступна">{ic("right")}</button></div></div>')


def pills(xs, cls="pr"):
    return "".join(f'<span class="{cls}">{x}</span>' for x in xs)


def row(prons, forms, prefix=None):
    pre = f'<div class="pre">{pills(prefix, "fm")}</div>' if prefix else ""
    return f'<div class="r">{pre}<div class="prons">{pills(prons)}</div><div class="brace"></div><div class="forms">{pills(forms, "fm")}</div></div>'


def sa(word, lines):
    ls = "".join(f'<div class="sa-line"><div class="prons">{pills(p)}</div><div class="brace"></div><div class="forms"><span class="fm">{f}</span></div></div>' for p, f in lines)
    return f'<div class="sa-unit"><span class="sa-word">{word}</span><div class="sagrp">{ls}</div></div>'


SIG_PS = ('<svg class="sig" viewBox="0 0 150 34" role="img" aria-label="Підпис часу: повторювана дія"><path d="M4 20h138" stroke="var(--muted)" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M138 16l5 4-5 4" stroke="var(--muted)" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
          '<path d="M75 5v25" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 3.5" stroke-linecap="round"/>'
          + "".join(f'<path d="M{x-3.5} 16.5l7 7M{x+3.5} 16.5l-7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' for x in (39, 57, 75, 93, 111)) + '</svg>')

A, B = ["I", "you", "we", "they"], ["he", "she", "it"]


def screen_cards():
    card = f'''<div class="card g-present">
<div class="card-hd"><div class="hd-l">{tile("form")}<div class="card-t"><span class="card-h">Present Simple Form</span><span class="card-sub">main verbs</span></div></div><div class="hd-r">{SIG_PS}<span class="grp">PRESENT</span></div></div>
<div class="card-bd">
<div class="panels">
<div class="pn p-positive"><div class="pn-lb">{ic("plus", 14)}Positive</div>{row(A, ["work …"])}{row(B, ["work<b>s</b> …"])}</div>
<div class="pn p-negative"><div class="pn-lb">{ic("minus", 14)}Negative</div>{row(A, ["do not work …", "don't work …"])}{row(B, ["does not work …", "doesn't work …"])}</div>
<div class="pn p-question"><div class="pn-lb">{ic("question", 14)}Question</div>{row(A, ["work? …"], ["Do"])}{row(B, ["work? …"], ["Does"])}</div>
<div class="pn p-short_answer"><div class="pn-lb">{ic("reply", 14)}Short answer</div><div class="sa-wrap">{sa("Yes,", [(A, "<b>do</b>."), (B, "<b>does</b>.")])}{sa("No,", [(A, "<b>don't</b>."), (B, "<b>doesn't</b>.")])}</div></div>
</div>
<div class="bottom">
<div class="pn p-careful"><div class="pn-lb">{ic("alert", 14)}Careful</div><div class="warn-cols">
<div><div class="warn-h">Negative</div><div class="warnrow x"><svg class="ic" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="stroke-width:2.2"><path d="M3 3l8 8M11 3l-8 8"/></svg><span>He doesn't work<b>s</b>.</span></div><div class="warnrow v"><svg class="ic" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="stroke-width:2.2"><path d="M2 7.5l3.5 3.5L12 4"/></svg><span>He doesn't work.</span></div></div>
<div><div class="warn-h">Question</div><div class="warnrow x"><svg class="ic" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="stroke-width:2.2"><path d="M3 3l8 8M11 3l-8 8"/></svg><span>Does she work<b>s</b>?</span></div><div class="warnrow v"><svg class="ic" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="stroke-width:2.2"><path d="M2 7.5l3.5 3.5L12 4"/></svg><span>Does she work?</span></div></div>
<div class="warn-note">Use <b>does</b> or <b>doesn't</b> + infinitive with no -s in questions and negatives.</div></div></div>
<div class="exs"><div class="exs-h">{ic("quote", 14)}Examples</div><div class="ex-grid"><span class="ex">— <b>Do</b> you <b>work</b> here? — Yes, I <b>do</b>.</span><span class="ex">— <b>Does</b> she <b>work</b> here? — Yes, she <b>does</b>.</span><span class="ex">— <b>Do</b> they <b>work</b> together? — No, they <b>don't</b>.</span></div></div>
</div>
</div>
<div class="card-ft"><span>english-tutors</span><span>Present Simple · 1 / 4</span></div>
</div>'''
    sub = subnav("present", [("form", "Form"), ("tobe", "to be"), ("spelling", "Spelling"), ("used", "is used")], "Form", "1 / 4")
    return f'<div class="shell">{topbar("cards")}<div class="layout">{rail(RAIL_CARDS, "Present Simple")}<main class="main">{sub}{card}</main></div></div>'


def use(icon, case, exs, hint=""):
    e = "".join(f'<p class="ex2">{x}</p>' for x in exs)
    h = f'<div class="hint">{hint}</div>' if hint else ""
    return f'<div class="u">{tile(icon, "sm")}<div><div class="ttl">{case}</div>{e}{h}</div></div>'


def screen_uses():
    uses = (use("home", "permanent situations or states", ["She <b>works</b> as a nurse.", "She <b>owns</b> a large shop."])
            + use("repeat", "repeated / habitual actions (especially with frequency adverbs: often, usually, etc.)", ["I usually <b>get up</b> at 7:30 am.", "He often <b>buys</b> her flowers."])
            + use("globe", "permanent truths or laws of nature", ["Money <b>doesn't buy</b> happiness.", "Water <b>freezes</b> at 0°C."])
            + use("calendar", "timetables / programmes (future meaning)", ["The match <b>finishes</b> at 7:45 pm.", "The plane <b>leaves</b> at 6:05 am."])
            + use("mic", "reviews / sports commentaries / dramatic narratives", ["Angelina Jolie <b>acts</b> brilliantly in this film."]))
    chips = "".join(f'<span class="chip">{c}</span>' for c in ["every day / week / month / year", "usually", "often", "always", "rarely", "never", "sometimes", "in the morning / evening", "at night", "on Mondays"])
    card = f'''<div class="card g-present">
<div class="card-hd"><div class="hd-l">{tile("used")}<div class="card-t"><span class="card-h">Present Simple is used</span><span class="card-sub">all cases and time expressions</span></div></div><div class="hd-r">{SIG_PS}<span class="grp">PRESENT</span></div></div>
<div class="card-bd"><div class="blocks">
<div class="blk wide"><h4>{ic("used", 14)}Uses</h4><div class="uses">{uses}</div></div>
<div class="blk wide"><h4>{ic("clock", 14)}Time expressions</h4><div class="chips">{chips}</div></div>
</div></div>
<div class="card-ft"><span>english-tutors</span><span>Present Simple · 4 / 4</span></div>
</div>'''
    sub = subnav("present", [("form", "Form"), ("tobe", "to be"), ("spelling", "Spelling"), ("used", "is used")], "is used", "4 / 4")
    return f'<div class="shell">{topbar("cards")}<div class="layout">{rail(RAIL_CARDS, "Present Simple")}<main class="main">{sub}{card}</main></div></div>'


RAIL_TL = [
    ("present", "Часи", [("simple", "Present Simple", 0), ("continuous", "Present Continuous", 0), ("perfect", "Present Perfect", 0), ("simple", "Past Simple", 0), ("continuous", "Past Continuous", 0), ("perfect", "Past Perfect", 0), ("perfcont", "Past Perfect Continuous", 0), ("simple", "Future Simple", 0), ("continuous", "Future Continuous", 0), ("perfect", "Future Perfect", 0), ("perfcont", "Future Perfect Continuous", 0), ("goto", "Be going to", 0), ("history", "Used to", 0)]),
    ("past", "Конфлікти часів", [("versus", "Past Continuous vs Past Simple", 0), ("versus", "Past Perfect vs Past Simple", 0), ("versus", "Past Simple vs Present Simple", 0), ("versus", "Present Simple vs Present Continuous", 0), ("versus", "Present Perfect vs Past Simple", 0), ("versus", "Will vs Be going to", 0)]),
]


def screen_timeline():
    svg = '''<svg viewBox="0 0 800 158" class="tlsvg" role="img" aria-label="Таймлайн: тривала дія, перервана короткою">
<text x="30" y="24" class="tl-axis">past</text><text x="770" y="24" text-anchor="end" class="tl-axis">future</text>
<rect x="235" y="58" width="206" height="48" rx="10" class="tl-span t1"/>
<line x1="30" y1="82" x2="764" y2="82" class="tl-line"/><path d="M760 71l16 11-16 11" class="tl-line" fill="none"/>
<line x1="617" y1="36" x2="617" y2="128" class="tl-now-line"/><rect x="587" y="6" width="60" height="24" rx="12" class="tl-now"/><text x="617" y="22.5" text-anchor="middle" class="tl-now-t">NOW</text>
<path d="M341 70l24 24M365 70l-24 24" class="tl-point t2" style="stroke-width:6"/>
<text x="235" y="126" text-anchor="middle" class="tl-tick">6:00</text><text x="353" y="126" text-anchor="middle" class="tl-tick">6:40</text><text x="441" y="126" text-anchor="middle" class="tl-tick">7:00</text>
</svg>'''
    card = f'''<div class="card g-past tl">
<div class="card-hd"><div class="hd-l">{tile("versus")}<div class="card-t"><span class="card-h">Past Continuous vs Past Simple</span><span class="card-sub">a long action interrupted by a short one</span></div></div><div class="tchips"><span class="tchip t1">Past Continuous</span><span class="tchip t2">Past Simple</span></div></div>
<div class="card-bd">
<div class="lane">{svg}<div class="lane-txt"><div class="sent"><div class="sentence">I <span class="w-v1">was cooking</span> dinner <span class="w-time">when</span> my husband <span class="w-v2">came</span> home.</div><div class="tl-note">I started at 6 and finished at 7. When he came home, I was in the middle of it.</div></div></div></div>
<div class="tl-lg"><div><span class="lg-sq t1"></span> Past Continuous</div><div><span class="lg-sq t2"></span> Past Simple</div><div>{ic("simple")} one action at a point</div><div>{ic("continuous")} action with duration</div><div>{ic("clock")} time expression</div></div>
</div>
<div class="card-ft"><span>english-tutors</span><span>Timelines · 5 / 22</span></div>
</div>'''
    return f'<div class="shell">{topbar("timeline")}<div class="layout">{rail(RAIL_TL, "Past Continuous vs Past Simple")}<main class="main">{card}</main></div></div>'


def tcard(group, tense, title, ttype, icon):
    return (f'<a class="tcard g-{group}" href="#"><div class="tcard-img"><div class="tcard-noimg">{ic(icon, 30)}<span>прев\'ю Wordwall</span></div><span class="tcard-type">{ic(icon, 13)}{ttype}</span></div>'
            f'<div class="tcard-body"><span class="grp">{tense}</span><div class="tcard-title">{title}</div><div class="tcard-meta"><span>Wordwall</span><span class="btn">Відкрити{ic("external", 14)}</span></div></div></a>')


def screen_tasks():
    filt = [("", "Усі · 24", "tasks", True), ("present", "Present Simple", "simple", False), ("present", "Present Continuous", "continuous", False), ("present", "Present Perfect", "perfect", False),
            ("past", "Past Simple", "simple", False), ("past", "Past Simple vs Past Continuous", "versus", False), ("future", "Future Simple", "simple", False), ("other", "Irregular verbs", "table", False)]
    chips = "".join(f'<button class="crumb2{" g-" + g if g else ""}{" on" if on else ""}" type="button">{ic(i, 14)}{n}</button>' for g, n, i, on in filt)
    grid = (tcard("present", "Present Simple", "Present Simple: правильні та неправильні речення", "Правильно чи неправильно", "truefalse")
            + tcard("present", "Present Continuous", "Present Continuous", "Відповідники", "match")
            + tcard("present", "Present Perfect", "Present Perfect", "Відкрийте коробку", "box")
            + tcard("past", "Past Simple", "Past Simple", "Вікторина", "quiz")
            + tcard("past", "Past Simple vs Past Continuous", "Past Simple & Past Continuous", "Сортування за групами", "sort")
            + tcard("past", "Past Simple vs Past Continuous", "Past Simple vs Past Continuous", "Введіть відповідь", "type")
            + tcard("other", "Усі часи", "Tense Review", "Доповніть речення", "gap")
            + tcard("future", "Future tenses", "Future Forms Rules", "Вікторина", "quiz"))
    empty = f'<div class="empty g-present">{tile("tests")}<h2>Тести ще не перенесені</h2>Тут будуть тести з автоматичною перевіркою. Результати зберігатимуться з прив\'язкою до учня.</div>'
    return (f'<div class="shell">{topbar("tasks")}<div class="layout" style="grid-template-columns: 1fr"><main class="main">'
            f'<div class="hd-l g-future" style="display:flex;align-items:center;gap:14px">{tile("tasks")}<div><h1 class="h1">Інтерактивні завдання</h1><p class="muted">Завдання живуть на Wordwall і відкриваються в новій вкладці.</p></div></div>'
            f'<div class="subnav">{chips}</div><div class="task-grid">{grid}</div>'
            f'<h2 class="h2" style="margin-top:18px">Порожній стан (вкладка «Тести»)</h2>{empty}</main></div></div>')


def item(name, label, where, group="present"):
    return f'<div class="it g-{group}">{tile(name, "sm")}<div><b>{label}</b><span class="w">{where}</span></div></div>'


def screen_icons():
    sets = [
        ("Розділи платформи", [("cards", "Картки", "вкладка, пошук"), ("timeline", "Таймлайни", "вкладка, пошук"), ("tasks", "Завдання", "вкладка, заголовок", "future"), ("tests", "Тести", "вкладка, порожній стан")]),
        ("Часи: іконка = міні-таймлайн аспекту", [("simple", "Simple", "дія в точці"), ("continuous", "Continuous", "дія з тривалістю"), ("perfect", "Perfect", "завершено до моменту"), ("perfcont", "Perfect Continuous", "тривалість до моменту"),
                                                 ("goto", "Be going to", "план → дія", "future"), ("state", "Stative verbs", "стан", "other"), ("history", "Used to", "звичка в минулому", "past"), ("table", "Irregular verbs", "таблиця", "other"), ("versus", "Сполучення / конфлікт", "два часи разом", "past")]),
        ("Типи карток", [("form", "Form", "панелі форми"), ("tobe", "to be", "дієслово be"), ("spelling", "Spelling", "правопис"), ("used", "is used", "випадки вживання"), ("clock", "Time expressions", "вирази часу"), ("compare", "Compare", "порівняння")]),
        ("Ролі в панелях (колір ролі)", [("plus", "Positive", "ствердження", "past"), ("minus", "Negative", "заперечення", "future"), ("question", "Question", "питання"), ("reply", "Short answer", "коротка відповідь", "future"), ("alert", "Careful", "типова помилка", "future"), ("quote", "Examples", "приклади", "other")]),
        ("Випадки вживання (замість емодзі)", [("home", "States", "постійні стани"), ("repeat", "Habits", "повторювані дії"), ("globe", "Truths", "закони природи"), ("calendar", "Timetables", "розклади"), ("mic", "Commentary", "огляди, репортажі")]),
        ("Типи завдань Wordwall", [("quiz", "Вікторина", "плашка на прев'ю", "future"), ("match", "Відповідники", "плашка на прев'ю", "future"), ("sort", "Сортування", "плашка на прев'ю", "future"), ("type", "Введіть відповідь", "плашка на прев'ю", "future"), ("box", "Відкрийте коробку", "плашка на прев'ю", "future"), ("truefalse", "Правильно чи ні", "плашка на прев'ю", "future"), ("gap", "Доповніть речення", "плашка на прев'ю", "future")]),
        ("Інтерфейс", [("search", "Пошук", "шапка", "other"), ("expand", "Проєктор", "шапка", "other"), ("moon", "Тема", "шапка", "other"), ("user", "Кабінет", "шапка", "other"), ("left", "Назад", "гортання", "other"), ("right", "Далі", "гортання", "other"), ("external", "Відкрити", "зовнішнє посилання", "other")]),
    ]
    body = ""
    for title, items in sets:
        body += f'<section class="set"><h2>{title}</h2><div class="grid">' + "".join(item(*i) for i in items) + "</div></section>"
    rules = ('<div class="rules">'
             '<div class="rule"><b>Одна лінія</b><span>Сітка 24 px, штрих 1.75, круглі кінці. Без заливок, тіней і градієнтів.</span></div>'
             '<div class="rule"><b>Колір несе зміст</b><span>Іконка бере колір групи часу або ролі. Власних кольорів у іконок немає.</span></div>'
             '<div class="rule"><b>Плитка для заголовків</b><span>44 px у шапці картки, 34 px у списках: тон кольору групи 14%.</span></div>'
             '<div class="rule"><b>Часи = міні-таймлайни</b><span>Хрестик, блок, блок до позначки: та сама мова, що й на шкалах.</span></div>'
             '</div>')
    return (f'<div class="sheet"><div><h1>Іконки english-tutors</h1><p class="lead">Набір з 44 лінійних іконок. Вони не прикрашають, а підписують: розділ, час, тип картки, роль панелі, тип завдання. Працюють в обох темах, бо беруть колір з тексту.</p></div>{rules}{body}</div>')


BOARDS = [
    ("Main.dc.html", "Картки · Form", screen_cards, 1440, 900, 0, 0, True),
    ("Uses.dc.html", "Картки · is used", screen_uses, 1440, 900, 1520, 0, True),
    ("Timeline.dc.html", "Таймлайни", screen_timeline, 1440, 960, 0, 1020, True),
    ("Tasks.dc.html", "Завдання і порожній стан", screen_tasks, 1440, 1160, 1520, 1020, True),
    ("Icons.dc.html", "Набір іконок", screen_icons, 1280, 1500, 3040, 0, False),
]

boards, order = {}, []
for fname, title, fn, w, h, x, y, fill in BOARDS:
    (OUT / fname).write_text(page(title, fn(), w, h), encoding="utf-8")
    b = {"x": x, "y": y, "w": w, "h": h, "title": title}
    if fill:
        b["expand"] = "fill"
    boards[fname] = b
    order.append(fname)

canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")},
          "title": "English Tutors Iconography", "launch": {"view": "canvas"}, "pages": [], "boards": boards, "order": order, "notes": {}, "designSystems": []}
(OUT / "canvas.json").write_text(json.dumps(canvas, ensure_ascii=False, indent=2), encoding="utf-8")
print("written", len(BOARDS), "artboards ->", OUT, "| icons:", len(ICONS))
