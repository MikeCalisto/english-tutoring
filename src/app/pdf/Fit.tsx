"use client";

import { useEffect } from "react";

/**
 * Вписує кожну картку в аркуш. Картка верстається на різній ширині; береться найбільший масштаб,
 * за якого вона цілком уміщається, а серед рівних — найширша верстка, щоб аркуш був заповнений.
 * Масштаб задається через zoom: друк ріже сторінки за розміром верстки, тому transform не підходить.
 * Коли все готово, на <html> з'являється data-pdf-ready: цього чекає скрипт друку.
 */
export function Fit() {
  useEffect(() => {
    let off = false;
    (async () => {
      try { await document.fonts.ready; } catch {}
      if (off) return;
      const report: string[] = [];
      document.querySelectorAll<HTMLElement>(".pdf-stage").forEach((stage) => {
        const el = stage.querySelector<HTMLElement>(".pdf-fit");
        if (!el) return;
        const aw = stage.clientWidth;
        const ah = stage.clientHeight - 6;
        el.style.zoom = "1";
        const tries: { s: number; w: number }[] = [];
        for (let w = 940; w <= 2200; w += 30) {
          el.style.width = `${w}px`;
          tries.push({ w, s: Math.min(aw / w, ah / el.offsetHeight, 1.12) });
        }
        const top = Math.max(...tries.map((t) => t.s));
        const best = tries.filter((t) => t.s >= top - 0.012).pop()!;
        el.style.width = `${best.w}px`;
        el.style.zoom = best.s.toFixed(4);
        stage.dataset.scale = best.s.toFixed(2);
        report.push(`${stage.parentElement?.id} ${best.s.toFixed(2)} w${best.w}`);
      });
      document.documentElement.dataset.pdfFit = report.join("; ");
      document.documentElement.dataset.pdfReady = "1";
    })();
    return () => { off = true; };
  }, []);
  return null;
}
