import { getTasks } from "@/content";
import { TasksGrid } from "@/components/TasksGrid";

export default function TasksPage() {
  const tasks = getTasks();
  return (
    <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
      <main className="main">
        <div className="cab-head">
          <div>
            <h1 className="h1">Інтерактивні завдання</h1>
            <p className="muted">Завдання живуть на Wordwall і відкриваються в новій вкладці.</p>
          </div>
        </div>
        {tasks.length === 0 ? (
          <div className="empty">
            <h2>Посилання ще не додані</h2>
            Список Wordwall-завдань з&apos;явиться тут, щойно замовник передасть посилання.
          </div>
        ) : (
          <TasksGrid tasks={tasks} />
        )}
      </main>
    </div>
  );
}
