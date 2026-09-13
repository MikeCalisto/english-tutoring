import Link from "next/link";
import { BRAND } from "@/config/brand";
import { LANDING as L } from "@/config/landing";
import { CardView } from "@/components/cards/Card";
import { TimelineCard } from "@/components/timeline/Timeline";
import type { Card, Timeline } from "@/content/types";

/**
 * Лендинг продукту. Публічна сторінка, структура готова, тексти — заглушки з src/config/landing.ts.
 * Блоки demo показують справжню картку і таймлайн з контенту платформи.
 */
export function Landing({ loggedIn, demoCard, demoTimeline }: { loggedIn: boolean; demoCard: Card | null; demoTimeline: Timeline | null }) {
  return (
    <div className="ld">
      <header className="ld-head">
        <Link href="/" className="brand"><img src="/brand/logo.svg" alt="" />{BRAND.name}</Link>
        <nav className="ld-nav">
          <a href="#inside">Що всередині</a>
          <a href="#demo">Приклад</a>
          <a href="#pricing">Ціна</a>
          <a href="#faq">Питання</a>
        </nav>
        <div className="grow" />
        <Link href={loggedIn ? "/cards" : "/login"} className="btn">{loggedIn ? "Відкрити платформу" : L.loginLabel}</Link>
        <a href={L.buyUrl} className="btn primary" target="_blank" rel="noopener noreferrer">{L.buyLabel}</a>
      </header>

      <section className="ld-hero" id="hero">
        <div className="ld-hero-txt">
          <div className="ld-eyebrow">{L.hero.eyebrow}</div>
          <h1 className="ld-h1">{L.hero.title}</h1>
          <p className="ld-lead">{L.hero.subtitle}</p>
          <div className="ld-cta">
            <a href={L.buyUrl} className="btn primary big" target="_blank" rel="noopener noreferrer">{L.hero.cta}</a>
            <span className="muted small">{L.hero.note}</span>
          </div>
        </div>
        <div className="ld-hero-visual ph">[Візуал: скриншот або відео платформи]</div>
      </section>

      <section className="ld-sec" id="problem">
        <h2 className="ld-h2">{L.problem.title}</h2>
        <div className="ld-grid3">
          {L.problem.items.map((t, i) => (
            <div className="ld-tile" key={i}>{t}</div>
          ))}
        </div>
      </section>

      <section className="ld-sec" id="inside">
        <h2 className="ld-h2">{L.inside.title}</h2>
        <div className="ld-grid4">
          {L.inside.items.map((it, i) => (
            <div className="ld-tile" key={i}>
              <div className="ld-tile-t">{it.title}</div>
              <p className="muted">{it.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ld-sec ld-demo" id="demo">
        <h2 className="ld-h2">{L.demo.title}</h2>
        <p className="ld-lead muted">{L.demo.text}</p>
        {demoCard && <CardView card={demoCard} footer="приклад картки" />}
        {demoTimeline && <TimelineCard t={demoTimeline} footer="приклад таймлайна" />}
      </section>

      <section className="ld-sec" id="for-whom">
        <h2 className="ld-h2">{L.forWhom.title}</h2>
        <div className="ld-grid3">
          {L.forWhom.items.map((t, i) => (
            <div className="ld-tile" key={i}>{t}</div>
          ))}
        </div>
      </section>

      <section className="ld-sec ld-author" id="author">
        <div className="ph ld-avatar">[Фото]</div>
        <div>
          <h2 className="ld-h2">{L.author.title}</h2>
          <p className="ld-lead">{L.author.text}</p>
          <div className="ld-author-name">{L.author.name}</div>
          <div className="muted small">{L.author.role}</div>
        </div>
      </section>

      <section className="ld-sec" id="pricing">
        <h2 className="ld-h2">{L.pricing.title}</h2>
        <div className="ld-price">
          <div className="ld-price-num">{L.pricing.price}</div>
          <div className="muted">{L.pricing.period}</div>
          <ul className="ld-list">
            {L.pricing.includes.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <a href={L.buyUrl} className="btn primary big" target="_blank" rel="noopener noreferrer">{L.pricing.cta}</a>
        </div>
      </section>

      <section className="ld-sec" id="faq">
        <h2 className="ld-h2">{L.faq.title}</h2>
        <div className="ld-faq">
          {L.faq.items.map((it, i) => (
            <details key={i} className="ld-q">
              <summary>{it.q}</summary>
              <p className="muted">{it.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ld-sec ld-final" id="final">
        <h2 className="ld-h2">{L.final.title}</h2>
        <a href={L.buyUrl} className="btn primary big" target="_blank" rel="noopener noreferrer">{L.final.cta}</a>
      </section>

      <footer className="ld-foot">
        <span className="brand"><img src="/brand/logo.svg" alt="" />{BRAND.name}</span>
        <span className="muted small">{L.footer.contacts}</span>
        <span className="muted small">{L.footer.legal}</span>
      </footer>
    </div>
  );
}
