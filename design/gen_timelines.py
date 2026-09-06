#!/usr/bin/env python3
"""Рендерер таймлайнов: timelines.json -> Timelines.dc.html в направлении A.

Один рендерер рисует одно время и конфликт двух времён. Координаты в JSON — доли 0..1.
"""
import json, pathlib
from gen_directions import BASE_CSS, DIRS

HERE = pathlib.Path(__file__).parent
A = DIRS[0]

W, H = 800, 158          # viewBox
X0, X1 = 30, 764         # axis extent
AX = 82                  # axis y
BAND = (58, 106)         # span rect top / bottom


def px(f):
    return X0 + f * (X1 - X0)


def cross(x, cls, small=False):
    r = 8 if small else 12
    sw = 4.5 if small else 6
    return (f'<path d="M{x-r:.1f} {AX-r}l{2*r} {2*r}M{x+r:.1f} {AX-r}l{-2*r} {2*r}" '
            f'class="{cls}" style="stroke-width:{sw}"/>')


def lane_svg(l, gid):
    out = [f'<svg viewBox="0 0 {W} {H}" class="tlsvg">']
    if any(s.get("openStart") for s in l.get("spans", [])):
        out.append('<defs>'
                   f'<linearGradient id="fade1-{gid}" x1="0" x2="1"><stop offset="0" stop-color="var(--t1)" stop-opacity="0"/><stop offset=".35" stop-color="var(--t1)" stop-opacity=".28"/><stop offset="1" stop-color="var(--t1)" stop-opacity=".28"/></linearGradient>'
                   f'<linearGradient id="fadeS1-{gid}" x1="0" x2="1"><stop offset="0" stop-color="var(--t1)" stop-opacity="0"/><stop offset=".4" stop-color="var(--t1)" stop-opacity="1"/></linearGradient>'
                   '</defs>')
    out.append(f'<text x="{X0}" y="24" class="tl-axis">past</text>')
    out.append(f'<text x="{X1+6}" y="24" text-anchor="end" class="tl-axis">future</text>')
    # spans under the axis line
    for s in l.get("spans", []):
        t = s.get("t", 1)
        x1, x2 = px(s["from"]), px(s["to"])
        if s.get("openStart"):
            out.append(f'<rect x="{x1:.1f}" y="{BAND[0]}" width="{x2-x1:.1f}" height="{BAND[1]-BAND[0]}" rx="10" '
                       f'fill="url(#fade1-{gid})"/>')
            out.append(f'<path d="M{x1:.1f} {BAND[0]}H{x2:.1f}V{BAND[1]}H{x1:.1f}" fill="none" stroke="url(#fadeS1-{gid})" stroke-width="2"/>')
        else:
            out.append(f'<rect x="{x1:.1f}" y="{BAND[0]}" width="{x2-x1:.1f}" height="{BAND[1]-BAND[0]}" rx="10" class="tl-span t{t}"/>')
        if s.get("label"):
            out.append(f'<text x="{(x1+x2)/2:.1f}" y="{BAND[0]-8}" text-anchor="middle" class="tl-lbl t{t}">{s["label"]}</text>')
    # axis
    out.append(f'<line x1="{X0}" y1="{AX}" x2="{X1}" y2="{AX}" class="tl-line"/>')
    out.append(f'<path d="M{X1-4} {AX-11}l16 11-16 11" class="tl-line" fill="none"/>')
    # now
    nx = px(l["nowAt"])
    out.append(f'<line x1="{nx:.1f}" y1="36" x2="{nx:.1f}" y2="128" class="tl-now-line"/>')
    out.append(f'<rect x="{nx-30:.1f}" y="6" width="60" height="24" rx="12" class="tl-now"/>')
    out.append(f'<text x="{nx:.1f}" y="22.5" text-anchor="middle" class="tl-now-t">NOW</text>')
    # points
    for p in l.get("points", []):
        out.append(cross(px(p["at"]), f'tl-point t{p.get("t",1)}', p.get("small")))
    # ticks
    for tk in l.get("ticks", []):
        out.append(f'<text x="{px(tk["at"]):.1f}" y="126" text-anchor="middle" class="tl-tick">{tk["text"]}</text>')
    # time mark
    tm = l.get("timeMark")
    if tm:
        a, b = px(tm["from"]), px(tm["to"])
        y = 136
        if abs(b - a) < 2:
            out.append(f'<line x1="{a:.1f}" y1="{y-6}" x2="{a:.1f}" y2="{y}" class="tl-tm"/>')
        else:
            out.append(f'<path d="M{a:.1f} {y-6}v6H{b:.1f}v-6" fill="none" class="tl-tm"/>')
        out.append(f'<text x="{(a+b)/2:.1f}" y="{y+12}" text-anchor="middle" class="tl-time">{tm["text"]}</text>')
    out.append('</svg>')
    return "".join(out)


def sentence(s):
    parts = []
    for tk in s["tokens"]:
        m = tk.get("mark")
        if m == "time":
            parts.append(f'<span class="w-time">{tk["text"]}</span>')
        elif m in ("v1", "v2"):
            parts.append(f'<span class="w-{m}">{tk["text"]}</span>')
        else:
            parts.append(tk["text"])
    note = f'<div class="tl-note">{s["note"]}</div>' if s.get("note") else ""
    return f'<div class="sent"><div class="sentence">{"".join(parts)}</div>{note}</div>'


def card(c, n):
    lanes = ""
    for i, l in enumerate(c["lanes"]):
        gid = c["id"] + "-" + str(i)
        txt = "".join(sentence(s) for s in l["sentences"])
        lanes += '<div class="lane">' + lane_svg(l, gid) + '<div class="lane-txt">' + txt + '</div></div>'
    chips = "".join('<span class="tchip t%d">%s</span>' % (i + 1, tn) for i, tn in enumerate(c["tenses"]))
    two = len(c["tenses"]) > 1
    legend = (
        '<div class="tl-lg">'
        f'<div><span class="lg-sq t1"></span> {c["tenses"][0]}</div>'
        + (f'<div><span class="lg-sq t2"></span> {c["tenses"][1]}</div>' if two else "")
        + '<div><svg width="18" height="14" viewBox="0 0 18 14" fill="none" class="lg-x"><path d="M3 1l12 12M15 1L3 13" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg> one action at a point</div>'
        '<div><span class="lg-block"></span> action with duration</div>'
        '<div><span class="lg-time"></span> time expression</div>'
        '</div>')
    return (f'<div class="card g-{c["group"]} tl">'
            f'<div class="card-hd"><div class="card-t"><span class="card-h">{c["title"]}</span>'
            f'<span class="card-sub">{c["subtitle"]}</span></div><div class="tchips">{chips}</div></div>'
            f'<div class="card-bd tl-bd">{lanes}{legend}</div>'
            f'<div class="card-ft"><span>[НАЗВА]</span><span>Timelines · {n} / 7</span></div></div>')


TL_CSS = '''
    .root{gap:28px}
    .tchips{display:flex;gap:8px}
    .tchip{font-family:var(--display);font-size:12px;letter-spacing:.06em;font-weight:700;padding:5px 11px;border-radius:8px;color:#16191D}
    .tchip.t1{background:var(--t1)}.tchip.t2{background:var(--t2)}
    .lane{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:28px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
    .lane:last-of-type{border-bottom:none}
    .lane-txt{display:flex;flex-direction:column;gap:14px}
    .sent{display:flex;flex-direction:column;gap:6px}
    .sentence{font-size:23px;line-height:1.45;text-align:left}
    .tl-note{text-align:left;font-size:14.5px}
    .w-v1{background:color-mix(in srgb,var(--t1) 28%,transparent);color:var(--t1);font-weight:700;padding:1px 7px;border-radius:7px;box-decoration-break:clone}
    .w-v2{background:color-mix(in srgb,var(--t2) 28%,transparent);color:var(--t2);font-weight:700;padding:1px 7px;border-radius:7px;box-decoration-break:clone}
    .tl-span.t1{fill:color-mix(in srgb,var(--t1) 28%,transparent);stroke:var(--t1);stroke-width:2}
    .tl-span.t2{fill:color-mix(in srgb,var(--t2) 28%,transparent);stroke:var(--t2);stroke-width:2}
    .tl-point.t1{stroke:var(--t1);stroke-linecap:round}
    .tl-point.t2{stroke:var(--t2);stroke-linecap:round}
    .tl-lbl{font-family:var(--display);font-size:13px;font-weight:700}
    .tl-lbl.t1{fill:var(--t1)}.tl-lbl.t2{fill:var(--t2)}
    .tl-tm{stroke:var(--timeword);stroke-width:1.5}
    .tl-line{stroke:var(--ink);stroke-width:2.5}
    .tl-lg{gap:24px;flex-wrap:wrap}
    .lg-sq{width:22px;height:12px;border-radius:3px}
    .lg-sq.t1{background:var(--t1)}.lg-sq.t2{background:var(--t2)}
    .lg-x{color:var(--muted)}
    .lg-block{width:22px;height:12px;border-radius:3px;border:1.5px solid var(--muted);background:color-mix(in srgb,var(--muted) 25%,transparent)}
    .intro{display:flex;flex-direction:column;gap:6px}
    .intro .dt1{font-family:var(--display);font-size:30px;font-weight:700}
    .intro .dt2{font-size:15px;color:var(--muted);max-width:980px}
'''


def main():
    data = json.loads((HERE / "timelines.json").read_text(encoding="utf-8"))
    cards = "".join(card(c, n + 1) for n, c in enumerate(data))
    html = f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{A["fonts_url"]}">
  <style>
{BASE_CSS}
{A["css"]}
{TL_CSS}
  </style>
</helmet>
<div class="root">
  <div class="intro">
    <div class="dt1">Таймлайни · напрям «Дошка»</div>
    <div class="dt2">Один рендерер, дані в JSON. Хрестик = одна дія в точці, блок = дія з тривалістю, пунктир = NOW. Дієслово підсвічене кольором своєї мітки на шкалі, вираз часу завжди фіолетовий. Час на шкалі умовний.</div>
  </div>
  {cards}
</div>
</x-dc>
</body>
</html>
'''
    (HERE / "Timelines.dc.html").write_text(html, encoding="utf-8")
    print("written Timelines.dc.html,", len(data), "cards")


if __name__ == "__main__":
    main()
