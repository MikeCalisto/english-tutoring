import { Tile } from "@/components/Icon";

export default function TestsPage() {
  return (
    <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
      <main className="main">
        <h1 className="h1">Тести</h1>
        <div className="empty g-present">
          <Tile name="tests" />
          <h2>Тести ще не перенесені</h2>
          Тут будуть тести з автоматичною перевіркою. Результати зберігатимуться з прив&apos;язкою до учня.
        </div>
      </main>
    </div>
  );
}
