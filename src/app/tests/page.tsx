export default function TestsPage() {
  return (
    <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
      <main className="main">
        <h1 style={{ fontFamily: "var(--display)", margin: 0, fontSize: 28 }}>Тести</h1>
        <div className="empty">
          <h2>Тести ще не перенесені</h2>
          Тут будуть тести з автоматичною перевіркою. Результати зберігатимуться з прив&apos;язкою до учня.
        </div>
      </main>
    </div>
  );
}
