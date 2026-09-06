# english-tutoring

Візуальний збірник з часів англійської для вчителів: картки, таймлайни, завдання, тести.

## Структура

- `content/` — єдине джерело контенту. `cards/*.json` (картки за темами), `timelines.json`, `tasks.json`, `_order.json` (порядок тем у навігації).
- `src/content/` — типи і завантаження контенту.
- `src/components/cards/` — рендерер карток (form / content / compare).
- `src/components/timeline/` — рендерер таймлайнів (JSON → SVG).
- `src/config/brand.ts` — назва продукту. Єдине місце.
- `design/` — макети (Claude Design canvas, генератори артбордів).
- `handoff/` — початкове ТЗ і правила від замовника. Дизайн у них застарів, контент актуальний.
- `sources/` — ескізи експерта.

## Запуск

```bash
npm install
npm run dev
```

Деплой: Vercel, гілка `main`.
