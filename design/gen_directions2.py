#!/usr/bin/env python3
"""Три направления по референсам заказчика (Tera / Visora / Aurevia). Та же структура артборда, что у A/B/C."""
import pathlib
from gen_directions import build, HERE

GLASS_COMMON = '''
    .card,.col,.chrome{backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
'''

DIRS2 = [
    dict(
        file="DirectionD.dc.html", letter="D", name="Атмосфера",
        motivation="Глубокий тёмно-зелёный фон с мягкими световыми пятнами, стеклянные панели, крупный геометрический гротеск. Навигация — центральная пилюля. Ощущение приборной панели, как у Tera: спокойно, дорого, всё светится изнутри.",
        tradeoff="свечения и размытия тяжелее для слабых проекторов; на печати фон уходит в чёрный.",
        font_display="Sora 800", font_body="Manrope 400 / 700", font_mono="JetBrains Mono",
        fonts_url="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap",
        tok=dict(radius="24 / 18 / 12 px", border="1 px біла з прозорістю 10%", space="4 · 8 · 12 · 16 · 24 · 40", shadow="свічення кольору групи під карткою", tl_rx="14"),
        colors=dict(
            neutral=[("фон", "#0B1412"), ("скло", "#132019"), ("текст", "#F2F6F0"), ("другорядний", "#93A39A"), ("лінія", "#274038")],
            roles=[("positive", "#CFF06A"), ("negative", "#FF9BA8"), ("question", "#B7B4FF"), ("short answer", "#FFD166"), ("careful", "#FF7A6B")],
            groups=[("present", "#CFF06A"), ("past", "#7CC6FF"), ("future", "#FFB46B")],
            timeline=[("відрізок", "#7CC6FF"), ("точка", "#FFB46B"), ("вираз часу", "#B7B4FF")],
        ),
        css=''':root{}
    .root{--bg:#0B1412;--surface:rgba(19,32,25,.72);--surface2:rgba(255,255,255,.05);--ink:#F2F6F0;--muted:#93A39A;--line:rgba(255,255,255,.10);
      --pos:#CFF06A;--neg:#FF9BA8;--que:#B7B4FF;--ans:#FFD166;--warn:#FF7A6B;
      --frame-present:#CFF06A;--frame-past:#7CC6FF;--frame-future:#FFB46B;
      --soft-present:rgba(207,240,106,.14);--soft-past:rgba(124,198,255,.14);--soft-future:rgba(255,180,107,.14);
      --span:#7CC6FF;--span-bg:rgba(124,198,255,.22);--point:#FFB46B;--timeword:#B7B4FF;--t1:#7CC6FF;--t2:#FFB46B;
      --display:"Sora","Arial Black",sans-serif;--body:"Manrope","Helvetica Neue",Arial,sans-serif;--mono:"JetBrains Mono","Menlo",monospace;
      --r:24px;--rp:18px;--rb:12px;--bw:1px;--pbw:1px;--shadow:0 30px 80px rgba(0,0,0,.45);
      --panel-bg:rgba(255,255,255,.04);--pill-line:rgba(255,255,255,.22);--pill-bg:rgba(255,255,255,.03);--fm-mix:18%;--exs-bg:rgba(255,255,255,.04);
      background:radial-gradient(900px 600px at 15% 10%,rgba(207,240,106,.16),transparent 60%),radial-gradient(800px 600px at 85% 30%,rgba(124,198,255,.16),transparent 60%),radial-gradient(700px 500px at 50% 100%,rgba(255,180,107,.10),transparent 60%),#0B1412}
    .card{border:1px solid var(--line);box-shadow:0 0 0 1px rgba(255,255,255,.02),0 40px 90px -30px color-mix(in srgb,var(--frame) 40%,transparent)}
    .card-hd{border-bottom:1px solid var(--line)}
    .card-h{font-weight:800;letter-spacing:-.03em;font-size:38px}
    .card-ft{background:rgba(0,0,0,.25)}
    .pn{border:1px solid var(--line);border-top:1px solid var(--line)}
    .pn-lb{display:inline-flex;align-items:center;gap:8px}
    .pn-lb::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 12px var(--c)}
    .grp{color:#0B1412}
    .tl-now-t{fill:#0B1412}
    .chrome{border-radius:999px;padding:8px 10px 8px 18px;border:1px solid var(--line)}
    .tabs{margin:0 auto;background:rgba(255,255,255,.05);border-radius:999px;padding:4px}
    .tab{border-radius:999px;padding:8px 18px;font-family:var(--display);font-weight:600;font-size:13px;letter-spacing:.02em}
    .tab.on{background:rgba(124,198,255,.18);color:var(--ink);border:1px solid rgba(124,198,255,.35)}
    .btn-p{background:var(--pos);color:#0B1412;border-color:var(--pos);border-radius:999px}
    .btn-s{border-radius:999px;border-color:var(--line)}
    .chip{background:rgba(255,255,255,.06);border:1px solid var(--line)}
    .crumb2.on{color:#0B1412}
    .col{border:1px solid var(--line)}
    .sentence{font-family:var(--display);font-weight:600;font-size:24px}
    .ty-display{font-size:52px;letter-spacing:-.04em}
''' + GLASS_COMMON,
    ),
    dict(
        file="DirectionE.dc.html", letter="E", name="Студія",
        motivation="Почти чёрный фон, электрический синий, тонкий геометрический шрифт, скруглённые квадратные кнопки и плавающие панели с лёгким синим свечением. Как у Visora: платформа выглядит как профессиональный инструмент, а не как учебник.",
        tradeoff="холодная гамма и тонкий шрифт требуют крупных кеглей на проекторе; синий занят под акцент, поэтому Past получает бирюзу.",
        font_display="Lexend 500 / 600", font_body="Lexend 300 / 400", font_mono="JetBrains Mono",
        fonts_url="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap",
        tok=dict(radius="18 / 14 / 12 px", border="1 px #1C2330, свічення синім на активному", space="4 · 8 · 12 · 16 · 24 · 32", shadow="0 0 40px синього з прозорістю 25% на активному", tl_rx="12"),
        colors=dict(
            neutral=[("фон", "#07090D"), ("панель", "#0F131A"), ("текст", "#EEF2F8"), ("другорядний", "#8B96A8"), ("лінія", "#1C2330")],
            roles=[("positive", "#5EE1A0"), ("negative", "#FF6B8A"), ("question", "#9C8CFF"), ("short answer", "#FFC65C"), ("careful", "#FF5C5C")],
            groups=[("present", "#2F7BFF"), ("past", "#34D3C8"), ("future", "#FF8A3D")],
            timeline=[("відрізок", "#2F7BFF"), ("точка", "#FF8A3D"), ("вираз часу", "#9C8CFF")],
        ),
        css=''':root{}
    .root{--bg:#07090D;--surface:#0F131A;--surface2:#141A23;--ink:#EEF2F8;--muted:#8B96A8;--line:#1C2330;
      --pos:#5EE1A0;--neg:#FF6B8A;--que:#9C8CFF;--ans:#FFC65C;--warn:#FF5C5C;
      --frame-present:#2F7BFF;--frame-past:#34D3C8;--frame-future:#FF8A3D;
      --soft-present:rgba(47,123,255,.16);--soft-past:rgba(52,211,200,.16);--soft-future:rgba(255,138,61,.16);
      --span:#2F7BFF;--span-bg:rgba(47,123,255,.22);--point:#FF8A3D;--timeword:#9C8CFF;--t1:#2F7BFF;--t2:#FF8A3D;
      --display:"Lexend","Helvetica Neue",Arial,sans-serif;--body:"Lexend","Helvetica Neue",Arial,sans-serif;--mono:"JetBrains Mono","Menlo",monospace;
      --r:18px;--rp:14px;--rb:12px;--bw:1px;--pbw:1px;--shadow:0 0 0 1px #1C2330,0 30px 60px -30px rgba(47,123,255,.35);
      --panel-bg:#0B0F15;--pill-line:#2A3442;--pill-bg:#0F131A;--fm-mix:14%;--exs-bg:#0B0F15;
      background:radial-gradient(1200px 500px at 50% -10%,rgba(47,123,255,.12),transparent 60%),#07090D;font-weight:300}
    .dname,.dt1,.card-h,.ty-display,.pn-lb,.grp,.tchip,.exs-h,.colh{font-weight:500}
    .card-h{font-size:34px;letter-spacing:-.02em}
    .card{border:1px solid var(--line)}
    .card-hd{background:linear-gradient(180deg,#121825,#0F131A);border-bottom:1px solid var(--line)}
    .card-ft{background:#0B0F15}
    .pn{border:1px solid var(--line);border-top:1px solid var(--line);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
    .pn-lb{padding:4px 10px;border:1px solid color-mix(in srgb,var(--c) 45%,transparent);border-radius:8px;align-self:flex-start;letter-spacing:.08em;font-size:11px;background:color-mix(in srgb,var(--c) 10%,transparent)}
    .pr{border-radius:8px;border-color:var(--pill-line);font-weight:400}
    .fm{border-radius:8px;font-weight:400}
    .brace{border-color:color-mix(in srgb,var(--c) 70%,transparent)}
    .grp{color:#07090D;border-radius:6px;font-weight:600}
    .tl-now-t{fill:#07090D}
    .chrome{border:1px solid var(--line);border-radius:16px;box-shadow:0 20px 50px -30px rgba(47,123,255,.4)}
    .brand{border:none;background:#2F7BFF;color:#fff;border-radius:12px;padding:8px 12px;font-weight:600}
    .tabs{background:#0B0F15;border:1px solid var(--line);border-radius:14px;padding:4px}
    .tab{border-radius:10px;font-weight:400}
    .tab.on{background:#2F7BFF;color:#fff;box-shadow:0 0 24px rgba(47,123,255,.45)}
    .btn-p{background:#2F7BFF;color:#fff;border-color:#2F7BFF;box-shadow:0 0 24px rgba(47,123,255,.35);border-radius:12px}
    .btn-s{border-radius:12px;border-color:var(--line);background:#0F131A}
    .chip{background:#0B0F15;border:1px solid var(--line);color:var(--muted)}
    .crumb2{border-color:var(--line)}.crumb2.on{color:#fff}
    .col{border:1px solid var(--line)}
    .sentence{font-weight:400;font-size:25px}
    .w-span{border-radius:8px}
    .k{font-weight:500}
''',
    ),
    dict(
        file="DirectionF.dc.html", letter="F", name="Скло",
        motivation="Светлая версия: молочный фон с пастельными пятнами, матовые стеклянные карточки, тонкий геометрический шрифт, синяя пилюля активной вкладки. Как у Aurevia: легко, воздушно, отлично печатается и читается днём в светлом классе.",
        tradeoff="на проекторе в тёмной комнате светлый экран слепит; контраст пастелей нужно держать под контролем.",
        font_display="Lexend 400 / 500", font_body="Manrope 400 / 600", font_mono="JetBrains Mono",
        fonts_url="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500&family=Manrope:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap",
        tok=dict(radius="22 / 16 / 12 px", border="1 px біла 70%, скло 65% з розмиттям", space="4 · 8 · 12 · 16 · 24 · 40", shadow="0 20px 60px рожево-блакитної тіні 12%", tl_rx="12"),
        colors=dict(
            neutral=[("фон", "#EEF3FA"), ("скло", "#FFFFFF"), ("текст", "#141A2A"), ("другорядний", "#6B7590"), ("лінія", "#D9E2F0")],
            roles=[("positive", "#22B573"), ("negative", "#E5527A"), ("question", "#6D5BE8"), ("short answer", "#E6931E"), ("careful", "#E0413A")],
            groups=[("present", "#3B82F6"), ("past", "#22B573"), ("future", "#F0823C")],
            timeline=[("відрізок", "#3B82F6"), ("точка", "#F0823C"), ("вираз часу", "#6D5BE8")],
        ),
        css=''':root{}
    .root{--bg:#EEF3FA;--surface:rgba(255,255,255,.66);--surface2:rgba(255,255,255,.55);--ink:#141A2A;--muted:#6B7590;--line:rgba(255,255,255,.85);
      --pos:#22B573;--neg:#E5527A;--que:#6D5BE8;--ans:#E6931E;--warn:#E0413A;
      --frame-present:#3B82F6;--frame-past:#22B573;--frame-future:#F0823C;
      --soft-present:#DCE9FF;--soft-past:#D8F3E6;--soft-future:#FFE6D6;
      --span:#3B82F6;--span-bg:#CFE0FF;--point:#F0823C;--timeword:#6D5BE8;--t1:#3B82F6;--t2:#F0823C;
      --display:"Lexend","Helvetica Neue",Arial,sans-serif;--body:"Manrope","Helvetica Neue",Arial,sans-serif;--mono:"JetBrains Mono","Menlo",monospace;
      --r:22px;--rp:16px;--rb:12px;--bw:1px;--pbw:1px;--shadow:0 20px 60px rgba(120,140,190,.14);
      --panel-bg:rgba(255,255,255,.6);--pill-line:#C9D4E6;--pill-bg:#fff;--fm-mix:12%;--exs-bg:rgba(255,255,255,.6);
      background:radial-gradient(800px 500px at 10% 0%,rgba(59,130,246,.16),transparent 60%),radial-gradient(700px 500px at 90% 20%,rgba(240,130,60,.14),transparent 60%),radial-gradient(700px 500px at 50% 100%,rgba(34,181,115,.12),transparent 60%),#EEF3FA}
    .dname,.dt1,.card-h,.ty-display{font-weight:500}
    .card{border:1px solid var(--line);border-top:1px solid var(--line)}
    .card-hd{border-bottom:1px solid #E6ECF5}
    .card-h{font-size:34px;letter-spacing:-.02em}
    .card-ft{background:rgba(255,255,255,.5);border-top:1px solid #E6ECF5}
    .pn{border:1px solid rgba(255,255,255,.9);border-top:1px solid rgba(255,255,255,.9);box-shadow:0 8px 24px rgba(120,140,190,.08)}
    .pn-lb{padding:4px 10px;border-radius:999px;align-self:flex-start;background:color-mix(in srgb,var(--c) 12%,#fff);font-size:11px;letter-spacing:.08em}
    .pr{border-radius:999px;background:#fff;border-color:#C9D4E6}
    .fm{border-radius:999px}
    .grp{color:#fff;border-radius:999px}
    .tl-now-t{fill:#fff}
    .chrome{border:1px solid var(--line);border-radius:999px}
    .brand{color:var(--ink);border-color:#C9D4E6}
    .tabs{gap:8px}
    .tab{border-radius:999px;background:rgba(255,255,255,.7);border:1px solid var(--line);color:var(--muted)}
    .tab.on{background:#3B82F6;color:#fff;border-color:#3B82F6;box-shadow:0 8px 20px rgba(59,130,246,.35)}
    .btn-p{background:#3B82F6;border-color:#3B82F6;color:#fff;border-radius:999px}
    .btn-s{border-radius:999px;background:rgba(255,255,255,.7);border-color:#C9D4E6}
    .chip{background:#fff;border:1px solid #D9E2F0}
    .crumb2{background:rgba(255,255,255,.7);border-color:#D9E2F0}.crumb2.on{color:#fff}
    .col{border:1px solid var(--line)}
    .swc{border-color:rgba(0,0,0,.06)}
    .sentence{font-weight:400;font-size:25px}
    .lg-block{background:#E3EAF6}
''' + GLASS_COMMON,
    ),
]

if __name__ == "__main__":
    for d in DIRS2:
        (HERE / d["file"]).write_text(build(d), encoding="utf-8")
        print("written", d["file"])
