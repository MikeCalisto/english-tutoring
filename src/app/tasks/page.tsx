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
              <div className="task-list">
                {items.map((t, n) => (
                  <a key={n} className="task" href={t.url} target="_blank" rel="noopener noreferrer">
                    <div className="t">
                      <div>{t.title}</div>
                      <div className="tense">{t.type} · Wordwall</div>
                    </div>
                    <span className="btn">Відкрити</span>
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
