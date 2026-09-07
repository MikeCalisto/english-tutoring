#!/usr/bin/env python3
"""Три варианта раскладки платформы (страница «Розкладка» на канвасе). Стиль — направление A."""
import pathlib
from gen_directions import BASE_CSS, DIRS, R_POS1, R_POS2, R_NEG1, R_NEG2, R_QUE1, R_QUE2, SA_YES, SA_NO

HERE = pathlib.Path(__file__).parent
A = DIRS[0]
BRAND = "english-tutors"

LOGO = ('<span class="logo"><i></i>' + BRAND + '</span>')
ICON_FS = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/></svg>'
ICON_SEARCH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="4.2"/><path d="M9.2 9.2L13 13"/></svg>'
ICON_L = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 3L5 9l6 6"/></svg>'
ICON_R = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3l6 6-6 6"/></svg>'

TENSES = {
    "present": ["Present Simple", "Present Continuous", "Present Perfect", "Present Perfect Continuous"],
    "past": ["Past Simple", "Past Continuous", "Past Perfect", "Past Perfect Continuous"],
    "future": ["Future Simple", "Future Continuous", "Future Perfect", "Future Perfect Continuous"],
    "other": ["To be going to", "Stative verbs", "Used to", "Irregular verbs", "Сполучення часів"],
}
GLABEL = {"present": "PRESENT", "past": "PAST", "future": "FUTURE", "other": "ІНШЕ"}


def mini_card(compact=False):
    """Карточка Present Simple Form в реальной вёрстке, чуть плотнее."""
    return f'''
    <div class="card g-present{" compact" if compact else ""}">
      <div class="card-hd"><div class="card-t"><span class="card-h">Present Simple Form</span><span class="card-sub">main verbs</span></div><span class="grp g-present">PRESENT</span></div>
      <div class="card-bd">
        <div class="panels">
          <div class="pn p-pos"><div class="pn-lb">Positive</div>{R_POS1}{R_POS2}</div>
          <div class="pn p-neg"><div class="pn-lb">Negative</div>{R_NEG1}{R_NEG2}</div>
          <div class="pn p-que"><div class="pn-lb">Question</div>{R_QUE1}{R_QUE2}</div>
          <div class="pn p-ans"><div class="pn-lb">Short answer</div><div class="sa-wrap">{SA_YES}{SA_NO}</div></div>
        </div>
        <div class="bottom">
          <div class="pn p-warn wide"><div class="pn-lb">Careful</div>
            <div class="warn-cols"><div><div class="warn-h">Negative</div><div class="warnrow x"><span class="ic">✕</span><span>He doesn't work<b class="k">s</b>.</span></div><div class="warnrow v"><span class="ic">✓</span><span>He doesn't work.</span></div></div>
            <div><div class="warn-h">Question</div><div class="warnrow x"><span class="ic">✕</span><span>Does she work<b class="k">s</b>?</span></div><div class="warnrow v"><span class="ic">✓</span><span>Does she work?</span></div></div></div>
          </div>
          <div class="exs"><div class="exs-h">Examples</div><div class="ex">— <b class="k">Do</b> you <b class="k">work</b> here? — Yes, I <b class="k">do</b>.</div><div class="ex">— <b class="k">Does</b> she <b class="k">work</b> here? — Yes, she <b class="k">does</b>.</div></div>
        </div>
      </div>
      <div class="card-ft"><span>{BRAND}</span><span>Present Simple · 1 / 4</span></div>
    </div>'''


def topbar(tabs=None, extra="", search=True):
    t = "".join(f'<span class="tab{" on" if i == 0 else ""}">{x}</span>' for i, x in enumerate(tabs or []))
    s = f'<span class="search">{ICON_SEARCH} Пошук часу або картки… <kbd>⌘K</kbd></span>' if search else ""
    return (f'<div class="topbar">{LOGO}<div class="tabs">{t}</div>{extra}<div class="grow"></div>{s}'
            f'<span class="btn small">{ICON_FS} Проєктор</span><span class="avatar">М</span></div>')


def screen(title, note, body, h):
    return f'<div class="screen" style="height:{h}px"><div class="screen-lbl"><b>{title}</b> · {note}</div><div class="win">{body}</div></div>'


def head(letter, name, idea, plus, minus):
    return (f'<div class="dhead"><div class="dname">{letter}</div><div class="dtitle"><div class="dt1">{name}</div>'
            f'<div class="dt2">{idea}</div><div class="dt3"><span class="pl">+</span> {plus}</div><div class="dt3"><span class="mi">−</span> {minus}</div></div></div>')


# ---------- A: бічна панель ----------
def layout_a():
    rail = '<div class="rail">'
    for g, names in TENSES.items():
        rail += f'<div class="rail-h {g}">{GLABEL[g]}</div>'
        for i, n in enumerate(names):
            on = " on" if n == "Present Simple" else ""
            rail += f'<a class="{on.strip()}">{n}<span class="cnt">{4 if g != "other" else 2}</span></a>'
    rail += '</div>'
    sub = ('<div class="subnav"><span class="grp g-present">PRESENT</span><span class="crumb on">Present Simple</span>'
           '<div class="grow"></div><span class="crumb2 on">Form</span><span class="crumb2">to be</span><span class="crumb2">Spelling</span><span class="crumb2">is used</span>'
           '<span class="pager"><span class="pbtn">' + ICON_L + '</span> 1 / 4 <span class="pbtn">' + ICON_R + '</span></span></div>')
    body1 = topbar(["Картки", "Таймлайни", "Завдання", "Тести"]) + f'<div class="layout"><div>{rail}</div><div class="main">{sub}{mini_card()}</div></div>'
    # экран 2: та же тема, вкладка таймлайнов — показываем, что боковая панель переключается на список таймлайнов
    rail2 = '<div class="rail"><div class="rail-h present">ЧАСИ</div><a class="on">Present Simple</a><a>Present Continuous</a><a>Present Perfect</a><div class="rail-h past">КОНФЛІКТИ</div><a>Past Continuous vs Past Simple</a><a>Past Perfect vs Past Simple</a></div>'
    body2 = topbar(["Таймлайни", "Картки", "Завдання", "Тести"]) + f'<div class="layout"><div>{rail2}</div><div class="main"><div class="ph tl-ph"><span>Таймлайн Present Simple</span></div></div></div>'
    return head("A", "Бічна панель", "Те, що є зараз, доведене до кінця: зліва завжди список часів, зверху розділи. Додано пошук ⌘K, лічильники карток у панелі і стрілки гортання.",
                "Все на відстані одного кліку, звичний патерн застосунків.",
                "Дві осі навігації одразу (розділ + час): у вкладці «Таймлайни» панель зліва змінює вміст, це може плутати.") + \
        screen("Екран 1", "картки Present Simple", body1, 900) + screen("Екран 2", "вкладка Таймлайни: панель зліва вже інша", body2, 520)


# ---------- B: хаб ----------
def layout_b():
    tiles = '<div class="hub">'
    for g in ["present", "past", "future"]:
        tiles += f'<div class="hub-col"><div class="rail-h {g}">{GLABEL[g]}</div>'
        for n in TENSES[g]:
            tiles += (f'<div class="tile g-{g}"><div class="tile-t">{n}</div>'
                      f'<div class="tile-m"><span>4 картки</span><span>таймлайн</span><span>2 завдання</span><span>тест</span></div></div>')
        tiles += '</div>'
    tiles += '</div>'
    other = '<div class="hub-row"><div class="rail-h other">ІНШЕ</div><div class="tiles-row">' + "".join(
        f'<div class="tile g-other small"><div class="tile-t">{n}</div></div>' for n in TENSES["other"]) + '</div></div>'
    recent = '<div class="hub-row"><div class="rail-h other">ОСТАННЄ</div><div class="tiles-row"><div class="tile g-past small"><div class="tile-t">Past Continuous vs Past Simple</div><div class="tile-m"><span>таймлайн</span></div></div><div class="tile g-present small"><div class="tile-t">Present Perfect is used</div><div class="tile-m"><span>картка 3 / 5</span></div></div></div></div>'
    body1 = topbar([], search=True) + f'<div class="main hubmain"><h1 class="h1">Що показуємо сьогодні?</h1>{tiles}{other}{recent}</div>'
    crumbs = ('<div class="subnav"><span class="crumb">Головна</span><span class="sep">/</span><span class="grp g-present">PRESENT</span><span class="crumb on">Present Simple</span>'
              '<div class="grow"></div><span class="seg"><span class="on">Картки</span><span>Таймлайн</span><span>Завдання</span><span>Тест</span></span></div>')
    body2 = topbar([], search=True) + f'<div class="main"><div class="stage"><span class="side-btn">{ICON_L}</span>{crumbs}{mini_card()}<div class="dots"><i class="on"></i><i></i><i></i><i></i></div><span class="side-btn r">{ICON_R}</span></div></div>'
    return head("B", "Хаб", "Без бічної панелі. Вхід — сітка плиток за групами часів, у кожній плитці видно, що є всередині. Усередині часу — перемикач Картки / Таймлайн / Завдання / Тест, стрілки по боках, крапки прогресу.",
                "Один екран пояснює весь продукт; максимум місця під картку на проєкторі.",
                "Перехід між часами на два кліки далі, ніж із панеллю; без пошуку не обійтись.") + \
        screen("Екран 1", "головна: сітка часів", body1, 980) + screen("Екран 2", "усередині часу", body2, 820)


# ---------- C: час спочатку ----------
def layout_c():
    seg = ('<div class="segrow"><span class="segbig"><span class="on g-present">Present</span><span class="g-past">Past</span><span class="g-future">Future</span><span class="g-other">Інше</span></span>'
           '<div class="chips-row">' + "".join(f'<span class="crumb2{" on" if i == 0 else ""}">{n}</span>' for i, n in enumerate(TENSES["present"])) + '</div></div>')
    local_tabs = '<div class="localtabs"><span class="ltab on">Картки <em>4</em></span><span class="ltab">Таймлайн</span><span class="ltab">Завдання <em>2</em></span><span class="ltab">Тест</span></div>'
    outline = ('<div class="outline"><div class="rail-h present">У ЦІЙ ТЕМІ</div>'
               '<a class="on"><b>1</b> Form</a><a><b>2</b> to be</a><a><b>3</b> Spelling</a><a><b>4</b> is used</a>'
               '<div class="rail-h other" style="margin-top:14px">ДАЛІ</div><a>Таймлайн</a><a>Завдання · 2</a><a>Тест</a></div>')
    body1 = topbar([], search=True) + f'<div class="main">{seg}{local_tabs}<div class="stage2"><div>{mini_card()}</div>{outline}</div></div>'
    body2 = ('<div class="proj"><div class="proj-bar"><span class="grp g-present">PRESENT</span><span>Present Simple · Form · 1 / 4</span><div class="grow"></div><span>← → гортати · Esc вийти</span></div>' + mini_card() + '</div>')
    return head("C", "Час спочатку", "Навігація від часу, а не від типу матеріалу: зверху перемикач групи і чіпи часів, усередині теми локальні вкладки Картки / Таймлайн / Завдання / Тест і план теми праворуч. Учитель відкриває «Present Perfect» і бачить усе про нього в одному місці.",
                "Одна ментальна модель: тема → усе про неї; проєктор-режим без хрому.",
                "Наскрізні матеріали (сполучення, порівняння) живуть у групі «Інше», їх треба знайти.") + \
        screen("Екран 1", "тема Present Simple з планом праворуч", body1, 900) + screen("Екран 2", "режим проєктора: лише картка і тонка смуга", body2, 720)


LAYOUT_CSS = '''
    .root{gap:26px;padding:40px 48px 56px}
    .dt3 .pl{color:var(--pos);font-weight:700}.dt3 .mi{color:var(--warn);font-weight:700}
    .screen{display:flex;flex-direction:column;gap:8px}
    .screen-lbl{font-size:13px;color:var(--muted)}
    .win{flex:1;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--bg);display:flex;flex-direction:column}
    .topbar{display:flex;align-items:center;gap:20px;padding:10px 20px;background:var(--surface);border-bottom:1px solid var(--line)}
    .logo{font-family:var(--display);font-weight:800;font-size:16px;display:inline-flex;align-items:center;gap:8px}
    .logo i{width:10px;height:10px;border-radius:3px;background:var(--frame-present);box-shadow:14px 0 0 var(--frame-past),28px 0 0 var(--frame-future);margin-right:28px}
    .search{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);border:1px solid var(--line);border-radius:8px;padding:6px 10px;min-width:280px}
    .search kbd{margin-left:auto;font-family:var(--mono);font-size:11px;border:1px solid var(--line);border-radius:4px;padding:0 5px;color:var(--faint)}
    .btn.small{padding:6px 10px;font-size:13px;display:inline-flex;align-items:center;gap:6px}
    .avatar{width:30px;height:30px;border-radius:50%;background:var(--frame-present);color:#16191D;font-weight:800;display:inline-flex;align-items:center;justify-content:center}
    .layout{display:grid;grid-template-columns:240px minmax(0,1fr);flex:1;min-height:0}
    .rail{border-right:1px solid var(--line);padding:14px 12px;display:flex;flex-direction:column;gap:2px;height:100%}
    .rail-h{font-family:var(--display);font-size:10.5px;letter-spacing:.14em;font-weight:700;padding:12px 10px 5px}
    .rail-h.present{color:var(--frame-present)}.rail-h.past{color:var(--frame-past)}.rail-h.future{color:var(--frame-future)}.rail-h.other{color:#C9C2B4}
    .rail a{display:flex;justify-content:space-between;padding:6px 10px;border-radius:8px;font-size:13.5px;color:var(--muted)}
    .rail a.on{background:var(--surface2);color:var(--ink);font-weight:600}
    .rail .cnt{font-family:var(--mono);font-size:11px;color:var(--faint)}
    .main{padding:18px 24px;display:flex;flex-direction:column;gap:14px;min-width:0}
    .subnav{margin:0;padding:0;display:flex;align-items:center;gap:6px}
    .crumb{font-size:14px;padding:6px 8px;color:var(--muted)}.crumb.on{color:var(--ink);font-weight:700}
    .sep{color:var(--faint)}
    .pager{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);margin-left:10px}
    .pbtn{display:inline-flex;border:1px solid var(--line);border-radius:8px;padding:4px;color:var(--ink)}
    .card.compact .card-bd{padding:14px 20px 16px}
    .ph{border:1px dashed var(--line);border-radius:16px;flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);min-height:300px}
    .g-other{--frame:#C9C2B4;--frame-soft:#2E2F2C}
    /* hub */
    .hubmain{padding:26px 40px}
    .h1{font-family:var(--display);font-size:30px;font-weight:800;margin:0 0 6px}
    .hub{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
    .hub-col{display:flex;flex-direction:column;gap:8px}
    .tile{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--frame);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}
    .tile-t{font-family:var(--display);font-size:16px;font-weight:700}
    .tile-m{display:flex;gap:10px;font-size:12px;color:var(--muted);flex-wrap:wrap}
    .tile.small{padding:10px 14px}
    .hub-row{display:flex;flex-direction:column;gap:6px;margin-top:6px}
    .tiles-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
    .stage{position:relative;display:flex;flex-direction:column;gap:12px;padding:0 54px}
    .side-btn{position:absolute;left:0;top:50%;transform:translateY(-50%);width:40px;height:64px;border:1px solid var(--line);border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--surface)}
    .side-btn.r{left:auto;right:0}
    .dots{display:flex;justify-content:center;gap:8px}.dots i{width:8px;height:8px;border-radius:50%;background:var(--line)}.dots i.on{background:var(--frame-present);width:22px;border-radius:4px}
    .seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
    .seg span{padding:6px 12px;font-size:13px;color:var(--muted)}.seg span.on{background:var(--ink);color:#16191D;font-weight:700}
    /* tense-first */
    .segrow{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
    .segbig{display:inline-flex;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--surface)}
    .segbig span{padding:9px 18px;font-family:var(--display);font-weight:700;font-size:14px;color:var(--muted)}
    .segbig span.on{background:var(--frame);color:#16191D}
    .chips-row{display:flex;gap:6px;flex-wrap:wrap}
    .localtabs{display:flex;gap:2px;border-bottom:1px solid var(--line)}
    .ltab{padding:10px 14px;font-weight:600;font-size:14px;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;gap:6px;align-items:center}
    .ltab.on{color:var(--ink);border-bottom-color:var(--frame-present)}
    .ltab em{font-style:normal;font-family:var(--mono);font-size:11px;color:var(--faint)}
    .stage2{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:18px;align-items:start}
    .outline{display:flex;flex-direction:column;gap:2px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 10px 12px}
    .outline a{display:flex;gap:10px;align-items:center;padding:7px 10px;border-radius:8px;font-size:13.5px;color:var(--muted)}
    .outline a.on{background:var(--surface2);color:var(--ink);font-weight:600}
    .outline a b{font-family:var(--mono);font-size:11px;color:var(--faint);width:14px}
    .proj{flex:1;background:#101215;padding:18px 40px 30px;display:flex;flex-direction:column;gap:14px}
    .proj-bar{display:flex;align-items:center;gap:12px;font-size:13px;color:var(--muted)}
'''


def build(name, letter, body):
    return f'''<!doctype html>
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
{LAYOUT_CSS}
  </style>
</helmet>
<div class="root">
{body}
</div>
</x-dc>
</body>
</html>
'''


if __name__ == "__main__":
    for fname, letter, fn in [("LayoutA.dc.html", "A", layout_a), ("LayoutB.dc.html", "B", layout_b), ("LayoutC.dc.html", "C", layout_c)]:
        (HERE / fname).write_text(build(fname, letter, fn()), encoding="utf-8")
        print("written", fname)
