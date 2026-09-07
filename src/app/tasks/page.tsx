import Image from "next/image";
import { getTasks } from "@/content";

export default function TasksPage() {
  const tasks = getTasks();
  const groups = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const arr = groups.get(t.tenseLabel) ?? [];
    arr.push(t);
    groups.set(t.tenseLabel, arr);
  }
  return (
    <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
      <main className="main">
        <h1 className="h1">Інтерактивні завдання</h1>
        <p className="muted">Завдання живуть на Wordwall. Платформа групує їх за часами і відкриває в новій вкладці.</p>
        {tasks.length === 0 ? (
          <div className="empty">
            <h2>Посилання ще не додані</h2>
            Список Wordwall-завдань з&apos;явиться тут, щойно замовник передасть посилання.
          </div>
        ) : (
          Array.from(groups.entries()).map(([label, items]) => (
            <section key={label} className="task-group">
              <h2 className="h2">{label}</h2>
              <div className="task-grid">
                {items.map((t) => (
                  <a key={t.url} className="tcard" href={t.url} target="_blank" rel="noopener noreferrer">
                    <div className="tcard-img">
                      {t.image ? (
                        <Image src={t.image} alt="" width={800} height={450} sizes="(max-width: 1100px) 100vw, 33vw" />
                      ) : (
                        <div className="tcard-noimg">Wordwall</div>
                      )}
                      <span className="tcard-type">{t.type}</span>
                    </div>
                    <div className="tcard-body">
                      <div className="tcard-title">{t.title}</div>
                      <div className="tcard-meta">
                        <span>Wordwall</span>
                        <span className="btn">Відкрити</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
