#!/usr/bin/env python3
"""Генерирует три артборда направлений дизайна из одной разметки и трёх наборов стилей."""
import pathlib

HERE = pathlib.Path(__file__).parent

ARROW = '<svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 5h13M10 1l4 4-4 4"/></svg>'
X = '<svg class="ic" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>'
V = '<svg class="ic" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7.5l3.5 3.5L12 4"/></svg>'


def pills(items, cls="pr"):
    return "".join(f'<span class="{cls}">{i}</span>' for i in items)


def row(pron, forms, prefix=None):
    pre = f'<div class="pre">{pills(prefix, "fm")}</div>' if prefix else ""
    return (f'<div class="r">{pre}<div class="prons">{pills(pron)}</div>'
            f'<div class="brace"></div><div class="forms">{pills(forms, "fm")}</div></div>')


def sa(word, lines):
    ls = "".join(f'<div class="sa-line"><div class="prons">{pills(p)}</div><div class="brace"></div>'
                 f'<div class="forms"><span class="fm">{f}</span></div></div>' for p, f in lines)
    return f'<div class="sa-unit"><span class="sa-word">{word}</span><div class="sagrp">{ls}</div></div>'


def swatches(title, items):
    sw = "".join(
        f'<div class="sw"><div class="swc" style="background:{hexv}"></div>'
        f'<div class="swl"><span>{name}</span><span class="mono">{hexv}</span></div></div>'
        for name, hexv in items)
    return f'<div class="swg"><div class="swt">{title}</div><div class="swr">{sw}</div></div>'



R_POS1 = row(["I","you","we","they"], ["work …"])
R_POS2 = row(["he","she","it"], ["work<b class=\"k\">s</b> …"])
R_NEG1 = row(["I","you","we","they"], ["<b class=\"k\">do not</b> work …", "<b class=\"k\">don't</b> work …"])
R_NEG2 = row(["he","she","it"], ["<b class=\"k\">does not</b> work …", "<b class=\"k\">doesn't</b> work …"])
R_QUE1 = row(["I","you","we","they"], ["work …?"], ["<b class=\"k\">Do</b>"])
R_QUE2 = row(["he","she","it"], ["work …?"], ["<b class=\"k\">Does</b>"])
SA_YES = sa("Yes,", [(["I","you","we","they"], "<b class=\"k\">do</b>."), (["he","she","it"], "<b class=\"k\">does</b>.")])
SA_NO = sa("No,", [(["I","you","we","they"], "<b class=\"k\">don't</b>."), (["he","she","it"], "<b class=\"k\">doesn't</b>.")])

def build(d):
    c = d["colors"]
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="{d["fonts_url"]}">
  <style>
{BASE_CSS}
{d["css"]}
  </style>
</helmet>

<div class="root">

  <div class="dhead">
    <div class="dname">{d["letter"]}</div>
    <div class="dtitle">
      <div class="dt1">{d["name"]}</div>
      <div class="dt2">{d["motivation"]}</div>
      <div class="dt3">Компроміс: {d["tradeoff"]}</div>
    </div>
  </div>

  <!-- design system sheet -->
  <div class="sheet">
    <div class="col">
      <div class="colh">Типографіка</div>
      <div class="ty-display">Present Perfect</div>
      <div class="ty-sub">{d["font_display"]} · заголовки карток, читаються з проєктора</div>
      <div class="ty-body">She <b class="k">has lived</b> here <span class="tw">since 2010</span>. Ann <b class="k">has never been</b> to Rome.</div>
      <div class="ty-sub">{d["font_body"]} · приклади, пояснення, інтерфейс</div>
      <div class="ty-mono">have / has + V3 &nbsp;&nbsp; -ed &nbsp;&nbsp; consonant + y → -ies</div>
      <div class="ty-sub">{d["font_mono"]} · формули, закінчення, вирази часу</div>
      <div class="scale">
        <span class="s1">48</span><span class="s2">32</span><span class="s3">22</span><span class="s4">18</span><span class="s5">15</span><span class="s6">12</span>
      </div>
    </div>
    <div class="col">
      <div class="colh">Кольори</div>
      {swatches("Нейтральні", c["neutral"])}
      {swatches("Ролі в панелях форми", c["roles"])}
      {swatches("Групи часів", c["groups"])}
      {swatches("Таймлайн", c["timeline"])}
    </div>
    <div class="col">
      <div class="colh">Компоненти і токени</div>
      <div class="cmp-row"><button class="btn-p">Відкрити картку</button><button class="btn-s">Завантажити PDF</button></div>
      <div class="cmp-row tabs"><span class="tab on">Картки</span><span class="tab">Таймлайни</span><span class="tab">Завдання</span><span class="tab">Тести</span></div>
      <div class="cmp-row"><span class="pr">she</span><span class="brace-demo"></span><span class="fm">work<b class="k">s</b> …</span><span class="chip">since 2010</span><span class="chip">just</span></div>
      <div class="cmp-row"><span class="grp g-present">PRESENT</span><span class="grp g-past">PAST</span><span class="grp g-future">FUTURE</span><span class="lbl-demo">POSITIVE</span></div>
      <div class="tokens">
        <div><span>Радіус</span><span class="mono">{d["tok"]["radius"]}</span></div>
        <div><span>Рамка</span><span class="mono">{d["tok"]["border"]}</span></div>
        <div><span>Крок відступів</span><span class="mono">{d["tok"]["space"]}</span></div>
        <div><span>Ширина картки</span><span class="mono">100% контенту, 16:7 на проєкторі</span></div>
        <div><span>Тінь</span><span class="mono">{d["tok"]["shadow"]}</span></div>
      </div>
    </div>
  </div>

  <!-- platform chrome -->
  <div class="chrome">
    <div class="brand">[НАЗВА]</div>
    <div class="tabs"><span class="tab on">Картки</span><span class="tab">Таймлайни</span><span class="tab">Завдання</span><span class="tab">Тести</span></div>
    <div class="grow"></div>
    <span class="btn-s small">PDF</span>
    <span class="btn-s small">Кабінет</span>
  </div>
  <div class="subnav">
    <span class="grp g-present">PRESENT</span>
    <span class="crumb on">Present Simple</span><span class="crumb">Present Continuous</span><span class="crumb">Present Perfect</span><span class="crumb">Present Perfect Continuous</span>
    <div class="grow"></div>
    <span class="crumb2 on">Form</span><span class="crumb2">to be</span><span class="crumb2">Spelling</span><span class="crumb2">is used</span>
  </div>

  <!-- card: Present Simple Form, horizontal -->
  <div class="card g-present">
    <div class="card-hd">
      <div class="card-t"><span class="card-h">Present Simple Form</span><span class="card-sub">main verbs</span></div>
      <span class="grp g-present">PRESENT</span>
    </div>
    <div class="card-bd">
      <div class="panels">
        <div class="pn p-pos"><div class="pn-lb">Positive</div>
          {R_POS1}
          {R_POS2}
        </div>
        <div class="pn p-neg"><div class="pn-lb">Negative</div>
          {R_NEG1}
          {R_NEG2}
        </div>
        <div class="pn p-que"><div class="pn-lb">Question</div>
          {R_QUE1}
          {R_QUE2}
        </div>
        <div class="pn p-ans"><div class="pn-lb">Short answer</div>
          <div class="sa-wrap">
            {SA_YES}
            {SA_NO}
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="pn p-warn wide"><div class="pn-lb">Careful</div>
          <div class="warn-cols">
            <div><div class="warn-h">Negative</div>
              <div class="warnrow x">{X}<span>He doesn't work<b class="k">s</b>.</span></div>
              <div class="warnrow v">{V}<span>He doesn't work.</span></div></div>
            <div><div class="warn-h">Question</div>
              <div class="warnrow x">{X}<span>Does she work<b class="k">s</b>?</span></div>
              <div class="warnrow v">{V}<span>Does she work?</span></div></div>
            <div class="warn-note">Use <b class="k">does</b> or <b class="k">doesn't</b> + infinitive with no -s in questions and negatives.</div>
          </div>
        </div>
        <div class="exs">
          <div class="exs-h">Examples</div>
          <div class="ex">— <b class="k">Do</b> you <b class="k">work</b> here? — Yes, I <b class="k">do</b>.</div>
          <div class="ex">— <b class="k">Does</b> she <b class="k">work</b> here? — Yes, she <b class="k">does</b>.</div>
          <div class="ex">— <b class="k">Do</b> they <b class="k">work</b> together? — No, they <b class="k">don't</b>.</div>
        </div>
      </div>
    </div>
    <div class="card-ft"><span>[НАЗВА]</span><span>Present Simple · 1 / 4</span></div>
  </div>

  <!-- timeline: conflict of two tenses -->
  <div class="card g-past tl">
    <div class="card-hd">
      <div class="card-t"><span class="card-h">Past Continuous vs Past Simple</span><span class="card-sub">a long action interrupted by a short one</span></div>
      <span class="grp g-past">PAST</span>
    </div>
    <div class="card-bd tl-bd">
      <svg viewBox="0 0 1300 170" class="tlsvg">
        <text x="20" y="28" class="tl-axis">past</text>
        <text x="1280" y="28" text-anchor="end" class="tl-axis">future</text>
        <rect x="260" y="72" width="500" height="52" rx="{d["tok"]["tl_rx"]}" class="tl-span"/>
        <line x1="20" y1="98" x2="1250" y2="98" class="tl-line"/>
        <path d="M1248 86l22 12-22 12" class="tl-line" fill="none"/>
        <line x1="1050" y1="46" x2="1050" y2="140" class="tl-now-line"/>
        <rect x="1016" y="26" width="68" height="26" rx="13" class="tl-now"/>
        <text x="1050" y="44" text-anchor="middle" class="tl-now-t">NOW</text>
        <path d="M546 84l28 28M574 84l-28 28" class="tl-point"/>
        <text x="260" y="146" text-anchor="middle" class="tl-tick">8:00</text>
        <text x="560" y="146" text-anchor="middle" class="tl-tick tl-tick-p">8:30</text>
        <text x="760" y="146" text-anchor="middle" class="tl-tick">9:00</text>
        <text x="1050" y="146" text-anchor="middle" class="tl-tick">today</text>
        <text x="560" y="166" text-anchor="middle" class="tl-time">when</text>
      </svg>
      <div class="sentence">I <span class="w-span">was watching</span> TV <span class="w-time">when</span> the phone <span class="w-point">rang</span>.</div>
      <div class="tl-note">The long action was in progress. The short action happened at one point inside it and interrupted it.</div>
      <div class="tl-lg">
        <div><span class="lg-span"></span> Past Continuous · action in progress</div>
        <div><svg width="18" height="14" viewBox="0 0 18 14" fill="none" class="lg-point"><path d="M3 1l12 12M15 1L3 13" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg> Past Simple · one finished action</div>
        <div><span class="lg-time"></span> time expression</div>
      </div>
    </div>
    <div class="card-ft"><span>[НАЗВА]</span><span>Timelines · conflicts · 3 / 8</span></div>
  </div>

</div>
</x-dc>
</body>
</html>
'''


BASE_CSS = '''
    *{box-sizing:border-box}
    body{margin:0}
    a{color:var(--ink)} a:hover{color:var(--muted)}
    .root{width:1440px;padding:48px 56px 64px;display:flex;flex-direction:column;gap:32px;background:var(--bg);color:var(--ink);font-family:var(--body);font-size:15px;line-height:1.45}
    .mono{font-family:var(--mono);font-size:12px}
    .grow{flex-grow:1}
    .k{font-weight:700;color:var(--c,var(--frame))}
    .dhead{display:flex;gap:20px;align-items:flex-start}
    .dname{font-family:var(--display);font-size:64px;line-height:1;font-weight:800;color:var(--frame-present)}
    .dt1{font-family:var(--display);font-size:32px;font-weight:700;line-height:1.1}
    .dt2{font-size:16px;color:var(--ink);margin-top:6px;max-width:900px}
    .dt3{font-size:14px;color:var(--muted);margin-top:4px}
    .sheet,.chrome,.subnav{--frame:var(--frame-present);--c:var(--frame-present)}
    .sheet{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
    .col{background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--r);padding:22px 24px;display:flex;flex-direction:column;gap:12px}
    .colh{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:700}
    .ty-display{font-family:var(--display);font-size:48px;line-height:1.05;font-weight:800;color:var(--frame-present)}
    .ty-body{font-size:18px;line-height:1.5}
    .ty-mono{font-family:var(--mono);font-size:14px;color:var(--ink)}
    .ty-sub{font-size:12px;color:var(--muted);margin-top:-6px}
    .scale{display:flex;align-items:baseline;gap:14px;font-family:var(--display);font-weight:700;color:var(--muted)}
    .s1{font-size:48px}.s2{font-size:32px}.s3{font-size:22px}.s4{font-size:18px}.s5{font-size:15px}.s6{font-size:12px}
    .swg{display:flex;flex-direction:column;gap:6px}
    .swt{font-size:12px;color:var(--muted)}
    .swr{display:flex;gap:8px;flex-wrap:wrap}
    .sw{display:flex;flex-direction:column;gap:4px;width:72px}
    .swc{height:34px;border-radius:calc(var(--r) / 2);border:1px solid rgba(127,127,127,.25)}
    .swl{display:flex;flex-direction:column;font-size:10.5px;line-height:1.2;color:var(--muted)}
    .swl span:first-child{color:var(--ink)}
    .cmp-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .tokens{display:flex;flex-direction:column;gap:4px;font-size:13px;border-top:1px solid var(--line);padding-top:10px}
    .tokens div{display:flex;justify-content:space-between;gap:12px}
    .tokens .mono{color:var(--muted)}
    .btn-p,.btn-s{font-family:var(--body);font-size:14px;font-weight:600;padding:10px 16px;border-radius:var(--rb);border:var(--bw) solid var(--ink);cursor:default}
    .btn-p{background:var(--ink);color:var(--bg)}
    .btn-s{background:transparent;color:var(--ink)}
    .btn-s.small{padding:6px 12px;font-size:13px}
    .tabs{display:flex;gap:4px}
    .tab{padding:8px 14px;border-radius:var(--rb);font-weight:600;font-size:14px;color:var(--muted)}
    .tab.on{background:var(--ink);color:var(--bg)}
    .chip{font-family:var(--mono);font-size:12.5px;padding:5px 10px;border-radius:999px;background:var(--frame-soft);color:var(--ink)}
    .grp{font-family:var(--display);font-size:11px;letter-spacing:.12em;font-weight:700;padding:4px 9px;border-radius:calc(var(--rb) / 1.5);color:#fff}
    .g-present{--frame:var(--frame-present);--frame-soft:var(--soft-present)}
    .g-past{--frame:var(--frame-past);--frame-soft:var(--soft-past)}
    .g-future{--frame:var(--frame-future);--frame-soft:var(--soft-future)}
    .grp{background:var(--frame)}
    .lbl-demo{font-size:11px;letter-spacing:.12em;font-weight:700;color:var(--pos);text-transform:uppercase}
    .brace-demo{width:10px;height:22px;border:2px solid var(--pos);border-left:none;border-radius:0 8px 8px 0;display:inline-block}
    .chrome{display:flex;align-items:center;gap:22px;padding:12px 20px;background:var(--surface);border:var(--bw) solid var(--line);border-radius:var(--r)}
    .brand{font-family:var(--display);font-weight:800;font-size:15px;letter-spacing:.06em;padding:6px 12px;border:1.5px dashed var(--muted);border-radius:var(--rb);color:var(--muted)}
    .subnav{display:flex;align-items:center;gap:6px;padding:0 6px;margin-top:-16px}
    .crumb{font-size:14px;padding:6px 10px;border-radius:var(--rb);color:var(--muted)}
    .crumb.on{color:var(--ink);font-weight:700}
    .crumb2{font-size:13px;padding:5px 10px;border-radius:999px;color:var(--muted);border:1px solid var(--line)}
    .crumb2.on{background:var(--frame-present);border-color:var(--frame-present);color:#fff;font-weight:600}
    /* card */
    .card{border-radius:var(--r);overflow:hidden;background:var(--surface);border:var(--bw) solid var(--frame);box-shadow:var(--shadow)}
    .card-hd{display:flex;align-items:center;justify-content:space-between;padding:18px 28px}
    .card-t{display:flex;align-items:baseline;gap:16px}
    .card-h{font-family:var(--display);font-size:34px;font-weight:800;letter-spacing:-.01em;color:var(--frame);line-height:1.1}
    .card-sub{font-size:15px;color:var(--muted)}
    .card-bd{padding:18px 28px 24px;display:flex;flex-direction:column;gap:14px}
    .card-ft{display:flex;justify-content:space-between;padding:9px 28px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);border-top:1px solid var(--line)}
    .panels{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr) minmax(0,1.15fr) minmax(0,1.75fr);gap:14px;align-items:stretch}
    .pn{--c:var(--pos);border-radius:var(--rp);padding:14px 16px 12px;display:flex;flex-direction:column;justify-content:flex-start;gap:12px;background:var(--panel-bg);border:var(--pbw) solid var(--c)}
    .p-pos{--c:var(--pos)}.p-neg{--c:var(--neg)}.p-que{--c:var(--que)}.p-ans{--c:var(--ans)}.p-warn{--c:var(--warn)}
    .pn-lb{font-family:var(--display);font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--c)}
    .r{display:flex;align-items:center;gap:10px}
    .prons{display:flex;flex-direction:column;gap:4px}
    .pr{border:1.5px solid var(--pill-line);border-radius:var(--rb);padding:1px 10px;font-size:14px;color:var(--ink);text-align:center;background:var(--pill-bg);white-space:nowrap}
    .brace{width:10px;align-self:stretch;border:2px solid var(--c);border-left:none;border-radius:0 9px 9px 0}
    .forms,.pre{display:flex;flex-direction:column;gap:4px}
    .fm{border:1.5px solid var(--c);border-radius:var(--rb);padding:3px 12px;font-size:15px;color:var(--ink);background:color-mix(in srgb,var(--c) var(--fm-mix),var(--surface));white-space:nowrap}
    .sa-wrap{display:flex;flex-direction:row;flex-wrap:wrap;gap:12px 18px}
    .sa-unit{display:flex;align-items:center;gap:10px}
    .sa-word{font-size:15px;font-weight:700}
    .sagrp{display:flex;flex-direction:column;gap:6px}
    .sa-line{display:flex;align-items:center;gap:8px}
    .bottom{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px;align-items:stretch}
    .warn-cols{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}
    .warn-h{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--c);font-weight:700;margin-bottom:4px}
    .warnrow{display:flex;align-items:center;gap:8px;font-size:15px;padding:2px 0}
    .warnrow.x .ic{color:var(--warn)}.warnrow.v .ic{color:var(--pos)}
    .warn-note{grid-column:1 / -1;font-size:13.5px;color:var(--muted);margin-top:4px}
    .exs{border-radius:var(--rp);padding:14px 18px;background:var(--exs-bg);border:var(--pbw) solid var(--line);display:flex;flex-direction:column;gap:6px;--c:var(--frame)}
    .exs-h{font-family:var(--display);font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--muted)}
    .ex{font-size:16px}
    /* timeline */
    .tl-bd{gap:10px}
    .tlsvg{width:100%;height:auto;display:block}
    .tl-axis{font-family:var(--body);font-size:13px;fill:var(--muted)}
    .tl-line{stroke:var(--ink);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
    .tl-span{fill:var(--span-bg);stroke:var(--span);stroke-width:2}
    .tl-point{stroke:var(--point);stroke-width:7;stroke-linecap:round}
    .tl-now-line{stroke:var(--frame);stroke-width:2;stroke-dasharray:5 6}
    .tl-now{fill:var(--frame)}
    .tl-now-t{font-family:var(--display);font-size:11px;font-weight:700;fill:#fff;letter-spacing:.1em}
    .tl-tick{font-family:var(--mono);font-size:13px;fill:var(--muted)}
    .tl-tick-p{fill:var(--point);font-weight:700}
    .tl-time{font-family:var(--body);font-size:14px;fill:var(--timeword);font-weight:600}
    .sentence{font-size:26px;text-align:center;line-height:1.4}
    .w-span{background:var(--span-bg);color:var(--span);font-weight:700;padding:1px 8px;border-radius:calc(var(--rb) / 1.2)}
    .w-point{color:var(--point);font-weight:700}
    .w-time{color:var(--timeword);font-weight:700;border-bottom:2.5px solid var(--timeword)}
    .tl-note{text-align:center;color:var(--muted);font-size:15px}
    .tl-lg{display:flex;justify-content:center;gap:28px;font-size:13px;color:var(--muted);padding-top:10px;border-top:1px solid var(--line)}
    .tl-lg div{display:flex;align-items:center;gap:8px}
    .lg-span{width:24px;height:12px;border-radius:3px;background:var(--span-bg);border:1.5px solid var(--span)}
    .lg-point{color:var(--point)}
    .lg-time{width:24px;height:3px;background:var(--timeword)}
'''

DIRS = [
    dict(
        file="Main.dc.html", letter="A", name="Дошка · обраний напрям",
        motivation="Тёмная поверхность, как доска в классе или слайд на проекторе. Светлый текст, крупная подача, цвета ролей как цветной мел. Первая цель: карточка читается с последней парты.",
        tradeoff="печатать тёмное дорого, PDF потребует светлой темы из тех же токенов.",
        font_display="Bricolage Grotesque 800", font_body="Onest 400 / 700", font_mono="JetBrains Mono",
        fonts_url="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Onest:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap",
        tok=dict(radius="16 / 12 / 8 px", border="1 px, лінія #343B42", space="4 · 8 · 12 · 16 · 24 · 32", shadow="немає, глибина через тон", tl_rx="12"),
        colors=dict(
            neutral=[("фон", "#16191D"), ("поверхня", "#1F2429"), ("текст", "#F3EFE4"), ("другорядний", "#A5ADB5"), ("лінія", "#343B42")],
            roles=[("positive", "#7ED99A"), ("negative", "#F58BA0"), ("question", "#B9A8FF"), ("short answer", "#F6C76A"), ("careful", "#FF7B72")],
            groups=[("present", "#4DD6B8"), ("past", "#82A7FF"), ("future", "#F5A95B")],
            timeline=[("відрізок", "#82A7FF"), ("точка", "#FF8A65"), ("вираз часу", "#B9A8FF")],
        ),
        css=''':root{}
    .root{--bg:#16191D;--surface:#1F2429;--surface2:#272D33;--ink:#F3EFE4;--muted:#A5ADB5;--line:#343B42;
      --pos:#7ED99A;--neg:#F58BA0;--que:#B9A8FF;--ans:#F6C76A;--warn:#FF7B72;
      --frame-present:#4DD6B8;--frame-past:#82A7FF;--frame-future:#F5A95B;
      --soft-present:#1F3A38;--soft-past:#232E48;--soft-future:#3A2E1F;
      --span:#82A7FF;--span-bg:#2A3A5E;--point:#FF8A65;--timeword:#B9A8FF;--t1:#82A7FF;--t2:#FF8A65;
      --display:"Bricolage Grotesque","Arial Black",sans-serif;--body:"Onest","Helvetica Neue",Arial,sans-serif;--mono:"JetBrains Mono","Menlo",monospace;
      --r:16px;--rp:12px;--rb:8px;--bw:1px;--pbw:1px;--shadow:none;
      --panel-bg:var(--surface2);--pill-line:#4A525B;--pill-bg:transparent;--fm-mix:16%;--exs-bg:var(--surface2)}
    .card{border-width:1px;border-color:var(--line);border-top:4px solid var(--frame)}
    .card-hd{background:var(--surface);border-bottom:1px solid var(--line)}
    .card-ft{background:#14171B}
    .pn{border-color:var(--line);border-top:2px solid var(--c)}
    .grp{color:#16191D}
    .tl-now-t{fill:#16191D}
    .swc{border-color:rgba(255,255,255,.12)}
    .btn-p{background:var(--ink);color:#16191D}
    .tab.on{background:var(--ink);color:#16191D}
    .crumb2.on{color:#16191D}
''',
    ),
    dict(
        file="DirectionB.dc.html", letter="B", name="Підручник",
        motivation="Светлая бумага, антиква в заголовках, тонкие линейки вместо цветных рамок. Выглядит как разворот хорошего учебника: спокойно, дорого, идеально печатается в PDF без переделки.",
        tradeoff="меньше «вау» на экране, цвет только там, где он несёт смысл.",
        font_display="Playfair Display 700", font_body="Commissioner 400 / 600", font_mono="IBM Plex Mono",
        fonts_url="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,500&family=Commissioner:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
        tok=dict(radius="6 / 4 / 3 px", border="1 px чорнильна, волосяні лінії між панелями", space="4 · 8 · 12 · 16 · 24 · 40", shadow="немає, папір", tl_rx="4"),
        colors=dict(
            neutral=[("папір", "#F6F2EA"), ("аркуш", "#FFFDF9"), ("чорнило", "#1E1B16"), ("другорядний", "#6F675A"), ("лінія", "#DDD5C4")],
            roles=[("positive", "#1E6B3C"), ("negative", "#A12A4E"), ("question", "#4A3B9C"), ("short answer", "#9C5A0C"), ("careful", "#B3261E")],
            groups=[("present", "#0B6B5A"), ("past", "#24406E"), ("future", "#7B4B00")],
            timeline=[("відрізок", "#24406E"), ("точка", "#C2410C"), ("вираз часу", "#4A3B9C")],
        ),
        css=''':root{}
    .root{--bg:#F6F2EA;--surface:#FFFDF9;--surface2:#FAF7F0;--ink:#1E1B16;--muted:#6F675A;--line:#DDD5C4;
      --pos:#1E6B3C;--neg:#A12A4E;--que:#4A3B9C;--ans:#9C5A0C;--warn:#B3261E;
      --frame-present:#0B6B5A;--frame-past:#24406E;--frame-future:#7B4B00;
      --soft-present:#E3EFEA;--soft-past:#E4E9F2;--soft-future:#F1E8D8;
      --span:#24406E;--span-bg:#DCE3F0;--point:#C2410C;--timeword:#4A3B9C;
      --display:"Playfair Display","Georgia",serif;--body:"Commissioner","Helvetica Neue",Arial,sans-serif;--mono:"IBM Plex Mono","Courier New",monospace;
      --r:6px;--rp:4px;--rb:3px;--bw:1px;--pbw:0px;--shadow:none;
      --panel-bg:transparent;--pill-line:var(--ink);--pill-bg:transparent;--fm-mix:0%;--exs-bg:var(--surface2)}
    .card{border:1px solid var(--ink)}
    .card-h{font-weight:700;letter-spacing:0}
    .card-sub{font-family:var(--display);font-style:italic;font-size:17px}
    .card-hd{border-bottom:1px solid var(--ink)}
    .panels{gap:0}
    .pn{border:none;border-left:1px solid var(--line);padding:6px 18px 6px 18px}
    .pn:first-child{border-left:none;padding-left:0}
    .pn-lb{font-family:var(--mono);letter-spacing:.16em;font-size:11px}
    .pr{border:none;border-bottom:1px solid var(--line);border-radius:0;padding:1px 6px;text-align:left}
    .fm{border:none;background:transparent;padding:2px 0;font-size:16px}
    .exs{border:none;border-top:1px solid var(--line);border-radius:0;background:transparent;padding-left:0}
    .bottom{border-top:1px solid var(--line);padding-top:12px}
    .p-warn.wide{border-left:none;padding-left:0;border-right:1px solid var(--line)}
    .card-ft{background:var(--surface2);font-family:var(--mono)}
    .col{border:1px solid var(--ink)}
    .chrome{border:1px solid var(--ink)}
    .grp{border-radius:2px;font-family:var(--mono);letter-spacing:.14em}
    .tab{border-radius:0;border-bottom:2px solid transparent;padding:8px 6px;margin-right:8px}
    .tab.on{background:transparent;color:var(--ink);border-bottom-color:var(--ink)}
    .btn-p,.btn-s{border-radius:3px}
    .chip{border-radius:2px;border:1px solid var(--line);background:transparent}
    .tl-line{stroke-width:2}
    .w-span{border-radius:2px}
''',
    ),
    dict(
        file="DirectionC.dc.html", letter="C", name="Постер",
        motivation="Белый лист, чёрный жирный гротеск и насыщенные плашки. Заголовок карточки сидит на цветной шапке группы времени, панели ролей залиты своим цветом на 8–10%. Похоже на хорошие учебные постеры, но чище и современнее.",
        tradeoff="самый «громкий» из трёх, требует дисциплины, чтобы не превратиться в ярмарку.",
        font_display="Rubik 900", font_body="Manrope 500 / 800", font_mono="DM Mono",
        fonts_url="https://fonts.googleapis.com/css2?family=Rubik:wght@700;900&family=Manrope:wght@500;700;800&family=DM+Mono:wght@400;500&display=swap",
        tok=dict(radius="20 / 14 / 10 px", border="2 px чорна на пілюлях, панелі без рамки", space="4 · 8 · 12 · 16 · 24 · 32", shadow="0 8px 0 чорна під картками", tl_rx="14"),
        colors=dict(
            neutral=[("фон", "#EFEFEA"), ("аркуш", "#FFFFFF"), ("чорний", "#0F0F10"), ("другорядний", "#6B6B6E"), ("лінія", "#E1E1DC")],
            roles=[("positive", "#12B76A"), ("negative", "#F63D68"), ("question", "#6938EF"), ("short answer", "#F79009"), ("careful", "#E5261F")],
            groups=[("present", "#00A886"), ("past", "#2E5BFF"), ("future", "#FF6A00")],
            timeline=[("відрізок", "#2E5BFF"), ("точка", "#F63D68"), ("вираз часу", "#6938EF")],
        ),
        css=''':root{}
    .root{--bg:#EFEFEA;--surface:#FFFFFF;--surface2:#F6F6F2;--ink:#0F0F10;--muted:#6B6B6E;--line:#E1E1DC;
      --pos:#12B76A;--neg:#F63D68;--que:#6938EF;--ans:#F79009;--warn:#E5261F;
      --frame-present:#00A886;--frame-past:#2E5BFF;--frame-future:#FF6A00;
      --soft-present:#D9F3EC;--soft-past:#DEE6FF;--soft-future:#FFE6D3;
      --span:#2E5BFF;--span-bg:#DEE6FF;--point:#F63D68;--timeword:#6938EF;
      --display:"Rubik","Arial Black",sans-serif;--body:"Manrope","Helvetica Neue",Arial,sans-serif;--mono:"DM Mono","Menlo",monospace;
      --r:20px;--rp:14px;--rb:10px;--bw:2px;--pbw:0px;--shadow:0 8px 0 #0F0F10;
      --panel-bg:color-mix(in srgb,var(--c) 9%,#fff);--pill-line:var(--ink);--pill-bg:#fff;--fm-mix:100%;--exs-bg:var(--surface2)}
    .root{font-weight:500}
    .card{border:2px solid var(--ink)}
    .card-hd{background:var(--frame);padding:20px 28px}
    .card-h,.card-sub{color:#fff}
    .card-sub{opacity:.85;font-weight:700}
    .card-hd .grp{background:#fff;color:var(--frame)}
    .card-h{font-weight:900;letter-spacing:-.02em;font-size:38px}
    .pn-lb{background:var(--c);color:#fff;align-self:flex-start;padding:4px 10px;border-radius:6px;font-size:11px}
    .pr{border:2px solid var(--ink);font-weight:700}
    .fm{border:none;color:#fff;font-weight:700;font-size:15px}
    .fm .k{color:#fff;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px}
    .brace{border-color:var(--ink);border-width:2px}
    .exs{border:2px solid var(--ink);background:#fff}
    .card-ft{background:var(--ink);color:#fff;border-top:none}
    .col{border:2px solid var(--ink);box-shadow:0 6px 0 var(--ink)}
    .chrome{border:2px solid var(--ink);box-shadow:0 4px 0 var(--ink)}
    .tab{font-weight:800}
    .tab.on{background:var(--frame-present)}
    .btn-p,.btn-s{border-width:2px;font-weight:800;box-shadow:0 3px 0 var(--ink)}
    .chip{font-weight:500;border:2px solid var(--ink);background:#fff}
    .tl-line{stroke-width:4}
    .tl-point{stroke-width:9}
    .sentence{font-weight:700;font-size:28px}
    .w-time{border-bottom-width:4px}
''',
    ),
]

if __name__ == "__main__":
    for d in DIRS:
        (HERE / d["file"]).write_text(build(d), encoding="utf-8")
        print("written", d["file"])
