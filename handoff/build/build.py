#!/usr/bin/env python3
"""Собирает cards.html из data/*.json по утверждённому шаблону prototype.html.

Вёрстка меняется здесь, содержание — только в data/. Руками HTML не писать.
"""
import json, pathlib, sys

HERE = pathlib.Path(__file__).parent
DATA = HERE / "data"
BRAND = "ENGLISH TUTORING PLATFORM"  # заглушка, название ещё не выбрано

ROLE_CLASS = {
    "positive": "p-pos", "negative": "p-neg", "question": "p-que",
    "short_answer": "p-ans", "careful": "p-warn",
}
ROLE_LABEL = {
    "positive": "POSITIVE", "negative": "NEGATIVE", "question": "QUESTION",
    "short_answer": "SHORT ANSWER", "careful": "CAREFUL",
}


def pills(items, cls="pr"):
    return "".join(f'<span class="{cls}">{i}</span>' for i in items)


def row(r, with_examples=True):
    out = ['<div class="r">']
    if r.get("prefix"):
        out.append(f'<div class="pre">{pills(r["prefix"], "fm")}</div>')
    if r.get("pronouns"):
        out.append(f'<div class="prons">{pills(r["pronouns"])}</div>')
        out.append('<div class="brace"></div>')
    if r.get("forms"):
        out.append(f'<div class="forms">{pills(r["forms"], "fm")}</div>')
    if with_examples and r.get("examples"):
        ex = "".join(f'<div class="ex">{e}</div>' for e in r["examples"])
        out.append(f'<div class="exs">{ex}</div>')
    out.append("</div>")
    return "".join(out)


def short_answer_wide(units, examples):
    us = []
    for u in units:
        lines = "".join(
            f'<div class="sa-line"><div class="prons">{pills(l["pronouns"])}</div>'
            f'<div class="brace"></div>'
            f'<div class="forms"><span class="fm">{l["form"]}</span></div></div>'
            for l in u["lines"])
        us.append(f'<div class="sa-unit"><span class="fm">{u["word"]}</span>'
                  f'<div class="sagrp">{lines}</div></div>')
    ex = ""
    if examples:
        ex = '<div class="sa-ex">' + "".join(
            f'<div class="ex">{e}</div>' for e in examples) + "</div>"
    return f'<div class="sa-wide">{"".join(us)}{ex}</div>'


def short_answer(units):
    out = []
    for u in units:
        lines = "".join(
            f'<div class="sa-line"><div class="prons">{pills(l["pronouns"])}</div>'
            f'<div class="brace"></div>'
            f'<div class="forms"><span class="fm">{l["form"]}</span></div></div>'
            for l in u["lines"])
        out.append(f'<div class="sa-row"><div class="sa-unit">'
                   f'<span class="fm">{u["word"]}</span>'
                   f'<div class="sagrp">{lines}</div></div></div>')
    return "".join(out)


def careful(p):
    cols = "".join(
        f'<div><div class="warn-h">{c["heading"]}</div>'
        f'<div class="warnrow"><span class="x">&#10007;</span><span>{c["wrong"]}</span></div>'
        f'<div class="warnrow"><span class="v">&#10003;</span><span>{c["right"]}</span></div></div>'
        for c in p.get("columns", []))
    note = f'<div class="warn-note">{p["note"]}</div>' if p.get("note") else ""
    return f'<div class="warn-cols">{cols}</div>{note}'


def panel(p, row3=False):
    role = p["role"]
    span = ""
    if role == "careful":
        span = " span3" if row3 else " span2"
        body = careful(p)
    elif role == "short_answer":
        span = " span3" if row3 else " span2"
        if row3:
            body = short_answer_wide(p["units"], p.get("examples"))
        else:
            body = short_answer(p["units"])
            if p.get("examples"):
                ex = "".join(f'<div class="ex">{e}</div>' for e in p["examples"])
                body += f'<div class="sa-row">{ex}</div>'
    else:
        body = "".join(row(r, with_examples=not row3) for r in p["rows"])
    return (f'<div class="pn {ROLE_CLASS[role]}{span}">'
            f'<div class="pn-lb">{ROLE_LABEL[role]}</div>'
            f'<div class="pn-bd">{body}</div></div>')


def shell(group, title, subtitle, body):
    sub = f'<div class="sub">{subtitle}</div>' if subtitle else ""
    return (f'<div class="card g-{group}"><div class="card-in">'
            f'<div class="card-hd"><h3>{title}</h3>{sub}</div>'
            f'<div class="card-bd">{body}</div>'
            f'<div class="card-ft">{BRAND}</div></div></div>')


def form_card(c):
    row3 = c.get("layout", "row3") == "row3"
    cls = "panels3" if row3 else "panels2"
    panels = "".join(panel(p, row3) for p in c["panels"])
    return shell(c["group"], c["title"], c.get("subtitle"),
                 f'<div class="{cls}">{panels}</div>')


def blk(b):
    h = f'<h4>{b["heading"]}</h4>' if b.get("heading") else ""
    inner = ""
    if b.get("kind") == "spelling":
        rows = "".join(
            f'<div><code>{i["from"]} <i>&rarr;</i> <em>{i["to"]}</em></code>'
            f'<span>{i["rule"]}</span></div>' for i in b["items"])
        inner = f'<div class="sp">{rows}</div>'
    elif b.get("kind") == "chips":
        inner = '<div class="chips">' + "".join(
            f'<span class="chip">{c}</span>' for c in b["items"]) + "</div>"
    elif b.get("kind") == "pairs":
        rows = "".join(
            f'<div><code>{i["left"]}</code><span>{i["right"]}</span></div>'
            for i in b["items"])
        inner = f'<div class="sp">{rows}</div>'
    elif b.get("kind") == "uses":
        items = "".join(
            f'<div class="u{" wide" if u.get("wide") else ""}">'
            f'<div class="em">{u.get("emoji","")}</div><div>'
            f'<div class="ttl">{u["case"]}</div>'
            + "".join(f'<p class="ex2">{e}</p>' for e in u["examples"])
            + (f'<div class="hint">{u["hint"]}</div>' if u.get("hint") else "")
            + "</div></div>" for u in b["items"])
        inner = f'<div class="uses">{items}</div>'
    elif b.get("kind") == "text":
        inner = "".join(f'<p class="note">{t}</p>' for t in b["items"])
    elif b.get("kind") == "lines":
        inner = '<p class="adv">' + "<br>".join(b["items"]) + "</p>"
    elif b.get("kind") == "careful":
        inner = "".join(
            f'<div class="warnrow"><span class="x">&#10007;</span><span>{i["wrong"]}</span></div>'
            f'<div class="warnrow"><span class="v">&#10003;</span><span>{i["right"]}</span></div>'
            for i in b["items"])
    elif b.get("kind") == "scenario":
        items = "".join(
            f'<div class="scn-i s-t{n+1}">'
            f'<div class="tn">{i["tense"]}</div>'
            f'<p class="st">{i["sentence"]}</p>'
            + (f'<div class="nt">{i["note"]}</div>' if i.get("note") else "")
            + "</div>" for n, i in enumerate(b["items"]))
        cols = len(b["items"])
        inner = f'<div class="scn" style="grid-template-columns:repeat({cols},1fr)">{items}</div>'
    elif b.get("kind") == "table":
        rows = "".join(f'<tr><td class="k">{r["k"]}</td><td class="v">{r["v"]}</td></tr>'
                       for r in b["items"])
        inner = f'<table class="te">{rows}</table>'
    note = f'<p class="note">{b["note"]}</p>' if b.get("note") else ""
    style = ' style="border-color:#F0C8C8;background:#FDF6F5"' if b.get("warn") else ""
    return f'<div class="blk"{style}>{h}{note}{inner}</div>'


def compare_card(c):
    cols = []
    for n, col in enumerate(c["columns"]):
        items = "".join(
            f'<div class="cmp-i"><div class="ttl">{i["case"]}</div>'
            + "".join(f'<p class="ex2">{e}</p>' for e in i["examples"])
            + (f'<div class="hint">{i["hint"]}</div>' if i.get("hint") else "")
            + "</div>" for i in col["items"])
        te = ""
        if col.get("time"):
            chips = "".join(f'<span class="chip">{t}</span>' for t in col["time"])
            te = ('<div class="cmp-te"><div class="lb">TIME EXPRESSIONS</div>'
                  f'<div class="chips">{chips}</div></div>')
        cols.append(f'<div class="cmp-col c-t{n+1}"><div class="cmp-hd">{col["tense"]}</div>'
                    f'<div class="cmp-bd">{items}{te}</div></div>')
    n = len(c["columns"])
    body = (f'<div class="cmp" style="grid-template-columns:repeat({n},1fr)">'
            + "".join(cols) + "</div>")
    for b in c.get("blocks", []):
        body += blk(b)
    return shell(c["group"], c["title"], c.get("subtitle"), body)


def content_card(c):
    blocks = c["blocks"]
    if c.get("layout") == "two":
        half = (len(blocks) + 1) // 2
        left = "".join(blk(b) for b in blocks[:half])
        right = "".join(blk(b) for b in blocks[half:])
        body = f'<div class="two"><div>{left}</div><div>{right}</div></div>'
    else:
        body = "".join(blk(b) for b in blocks)
    return shell(c["group"], c["title"], c.get("subtitle"), body)


def render(card):
    t = card.get("type")
    if t == "form":
        return form_card(card)
    if t == "compare":
        return compare_card(card)
    return content_card(card)


def main():
    order = json.loads((DATA / "_order.json").read_text(encoding="utf-8"))
    css = (HERE / "style.css").read_text(encoding="utf-8")
    parts = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        "<title>English tenses — cards</title>",
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700'
        '&family=Unbounded:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">',
        f"<style>{css}</style>",
        '<div class="wrap">',
    ]
    total = 0
    for topic in order:
        f = DATA / f"{topic}.json"
        if not f.exists():
            print(f"  пропущен (нет файла): {topic}", file=sys.stderr)
            continue
        d = json.loads(f.read_text(encoding="utf-8"))
        parts.append(f'<div class="divider"><h2>{d["topic"]}</h2></div>')
        for card in d["cards"]:
            card.setdefault("group", d["group"])
            parts.append(render(card))
            total += 1
    parts.append("</div>")
    out = HERE.parent / "cards.html"
    out.write_text("\n".join(parts), encoding="utf-8")
    print(f"собрано карточек: {total} -> {out}")


if __name__ == "__main__":
    main()
