"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { finishTour } from "@/app/tour-actions";

type Role = "admin" | "teacher" | "student";

interface Step {
  id: string;
  /** CSS-селектор елемента, який підсвічуємо. Без нього крок показується по центру. */
  target?: string;
  title: string;
  text: string;
  /** Текст для учня, якщо відрізняється. */
  student?: string;
  /** Текст, коли навчання йде на сторінці таймлайнів. */
  onTimelines?: string;
}

const STEPS: Step[] = [
  {
    id: "welcome",
    title: "Ласкаво просимо",
    text: "Це збірник для уроку: відкрили потрібний час, показали учню, пояснили. За хвилину покажу, що де лежить.",
    student: "Тут ви бачите часи англійської на шкалі. Коротко покажу, що де.",
  },
  {
    id: "tabs",
    target: '[data-tour="tabs"]',
    title: "Розділи платформи",
    text: "Картки пояснюють правило. Таймлайни показують час на шкалі. Майндмеп збирає всі часи на одній карті. Завдання дають практику.",
    student: "Вам відкриті таймлайни: кожен час намальовано на шкалі.",
  },
  {
    id: "rail",
    target: '[data-tour="rail"]',
    title: "Усі часи зліва",
    text: "Часи згруповано за кольором: Present, Past, Future. Натисніть на час, щоб відкрити його картки.",
  },
  {
    id: "subnav",
    target: '[data-tour="subnav"]',
    title: "Картки одного часу",
    text: "У кожного часу кілька карток: Форма, Правопис, Використання. Перемикайте їх тут або стрілками ← → на клавіатурі.",
  },
  {
    id: "card",
    target: '[data-tour="card"]',
    title: "Картка для показу учню",
    text: "Кольори панелей однакові всюди: зелений для ствердження, рожевий для заперечення, фіолетовий для питання. Ключові слова виділено.",
    onTimelines: "Блок на шкалі — дія з тривалістю, хрестик — дія в точці, пунктир — зараз. Дієслово в реченні має колір своєї позначки.",
  },
  {
    id: "tab-timelines",
    target: '[data-tour="tab-timelines"]',
    title: "Таймлайни",
    text: "Кожен час намальовано на шкалі. Окремо зібрано конфлікти часів: два часи на одній шкалі, щоб різницю було видно, а не чути.",
  },
  {
    id: "tab-tasks",
    target: '[data-tour="tab-tasks"]',
    title: "Завдання",
    text: "Інтерактивні завдання Wordwall розкладено за часами і відкриваються в один клік.",
  },
  {
    id: "actions",
    target: '[data-tour="actions"]',
    title: "Пошук, проєктор, кабінет",
    text: "⌘K знаходить будь-яку картку. «Проєктор» розгортає її на весь екран. У кабінеті ви створюєте коди доступу для учнів. Знак питання запускає це навчання знову.",
    student: "Тут пошук, темна тема і повноекранний режим. Знак питання запускає це навчання знову.",
  },
];

const POP_W = 340;

/** Навчання при першому вході: екран затемнюється, елементи підсвічуються по черзі. */
export function Tour({ auto, role }: { auto: boolean; role: Role }) {
  const path = usePathname();
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const started = useRef(false);

  const start = useCallback(() => {
    // показуємо лише кроки, чиї елементи є на цій сторінці
    const list = STEPS.filter((s) => !s.target || document.querySelector(s.target));
    if (list.length === 0) return;
    setI(0);
    setSteps(list);
  }, []);

  const finish = useCallback(() => {
    setSteps(null);
    setRect(null);
    finishTour().catch(() => {});
  }, []);

  // перший вхід: стартуємо самі, коли сторінка платформи вже намальована
  useEffect(() => {
    if (!auto || started.current) return;
    if (path === "/" || path.startsWith("/login") || path.startsWith("/cabinet")) return;
    // прапорець ставимо, коли таймер спрацював: у dev React запускає ефект двічі
    const t = setTimeout(() => {
      started.current = true;
      start();
    }, 700);
    return () => clearTimeout(t);
  }, [auto, path, start]);

  useEffect(() => {
    const on = () => start();
    window.addEventListener("tour:start", on);
    return () => window.removeEventListener("tour:start", on);
  }, [start]);

  const step = steps?.[i] ?? null;

  const measure = useCallback(() => {
    setVp({ w: window.innerWidth, h: window.innerHeight });
    if (!step?.target) return setRect(null);
    const el = document.querySelector(step.target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => {
    if (!step) return;
    if (step.target) document.querySelector(step.target)?.scrollIntoView({ block: "nearest", inline: "nearest" });
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step, measure]);

  // клавіатура: під час навчання стрілки не гортають картки
  useEffect(() => {
    if (!steps) return;
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowRight", "ArrowLeft", "Enter", "Escape"].includes(e.key)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.key === "Escape") return finish();
      if (e.key === "ArrowLeft") return setI((x) => Math.max(0, x - 1));
      setI((x) => {
        if (x >= steps.length - 1) {
          finish();
          return x;
        }
        return x + 1;
      });
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [steps, finish]);

  if (!steps || !step) return null;

  const last = i === steps.length - 1;
  const text = role === "student" && step.student ? step.student : path.startsWith("/timelines") && step.onTimelines ? step.onTimelines : step.text;

  // вікно підсвічування: прямокутник елемента з полями, обрізаний екраном
  const pad = 6;
  const hole = rect
    ? {
        top: Math.max(rect.top - pad, 6),
        left: Math.max(rect.left - pad, 6),
        right: Math.min(rect.right + pad, vp.w - 6),
        bottom: Math.min(rect.bottom + pad, vp.h - 6),
      }
    : null;

  // де стоїть підказка: під елементом, праворуч, над ним або всередині знизу праворуч
  const gap = 14;
  const pos: React.CSSProperties = { width: Math.min(POP_W, vp.w - 24) };
  if (!hole) {
    pos.top = "50%";
    pos.left = "50%";
    pos.transform = "translate(-50%, -50%)";
  } else if (vp.h - hole.bottom > 230) {
    pos.top = hole.bottom + gap;
    pos.left = Math.min(Math.max(hole.left, 12), vp.w - POP_W - 12);
  } else if (vp.w - hole.right > POP_W + gap + 12) {
    pos.left = hole.right + gap;
    pos.top = Math.min(Math.max(hole.top, 12), vp.h - 260);
  } else if (hole.top > 230) {
    pos.bottom = vp.h - hole.top + gap;
    pos.left = Math.min(Math.max(hole.left, 12), vp.w - POP_W - 12);
  } else {
    pos.bottom = 24;
    pos.right = 24;
  }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Навчання по платформі">
      <div className="tour-block" />
      {hole ? (
        <div className="tour-hole" style={{ top: hole.top, left: hole.left, width: hole.right - hole.left, height: hole.bottom - hole.top }}>
          <div className="tour-ring" key={step.id} />
        </div>
      ) : (
        <div className="tour-dim" />
      )}
      <div className="tour-pop" style={pos}>
        <div className="tour-pop-in" key={step.id}>
        <div className="tour-step">Крок {i + 1} з {steps.length}</div>
        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-text">{text}</p>
        <div className="tour-dots" aria-hidden="true">
          {steps.map((s, k) => (
            <i key={s.id} className={k === i ? "on" : k < i ? "done" : ""} />
          ))}
        </div>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={finish}>{last ? "Закрити" : "Пропустити"}</button>
          <div className="grow" />
          {i > 0 && <button type="button" className="btn" onClick={() => setI(i - 1)}>Назад</button>}
          <button type="button" className="btn primary" autoFocus onClick={() => (last ? finish() : setI(i + 1))}>{last ? "Почати роботу" : "Далі"}</button>
        </div>
        </div>
      </div>
    </div>
  );
}
