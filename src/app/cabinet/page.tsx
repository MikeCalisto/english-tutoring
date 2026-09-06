import { redirect } from "next/navigation";
import { desc, eq, isNull, and } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { createInvite, deleteInvite, removeStudent, setStudentLimit, setTeacherActive } from "./actions";

export const dynamic = "force-dynamic";

function fmt(d: Date | null) {
  return d ? new Intl.DateTimeFormat("uk-UA", { dateStyle: "short", timeStyle: "short" }).format(d) : "";
}

export default async function CabinetPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  if (me.role === "student") {
    return (
      <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
        <main className="main">
          <h1 className="h1">Кабінет</h1>
          <p className="muted">Ви увійшли як учень{me.firstName ? `: ${me.firstName}` : ""}. Вам доступні таймлайни і тести.</p>
          <form method="post" action="/api/auth/logout"><button className="btn">Вийти</button></form>
        </main>
      </div>
    );
  }

  const students = await db
    .select({ id: schema.users.id, name: schema.users.firstName, label: schema.teacherStudent.label, since: schema.teacherStudent.createdAt })
    .from(schema.teacherStudent)
    .innerJoin(schema.users, eq(schema.users.id, schema.teacherStudent.studentId))
    .where(eq(schema.teacherStudent.teacherId, me.id))
    .orderBy(desc(schema.teacherStudent.createdAt));
  const openInvites = await db
    .select()
    .from(schema.invites)
    .where(and(eq(schema.invites.teacherId, me.id), isNull(schema.invites.usedBy)))
    .orderBy(desc(schema.invites.createdAt));
  const used = students.length + openInvites.length;

  const teachers =
    me.role === "admin"
      ? await db.select().from(schema.users).where(eq(schema.users.role, "teacher")).orderBy(desc(schema.users.createdAt))
      : [];

  return (
    <div className="layout" style={{ gridTemplateColumns: "1fr" }}>
      <main className="main cab">
        <div className="cab-head">
          <div>
            <h1 className="h1">Кабінет</h1>
            <p className="muted">
              {me.firstName} {me.lastName} {me.telegramUsername ? `· @${me.telegramUsername}` : ""} · {me.role === "admin" ? "адміністратор" : "вчитель"}
            </p>
          </div>
          <form method="post" action="/api/auth/logout"><button className="btn">Вийти</button></form>
        </div>

        <section className="cab-sec">
          <div className="cab-sec-h">
            <h2>Мої учні</h2>
            <span className="muted">{used} / {me.studentLimit}</span>
          </div>
          <form action={createInvite} className="row-form">
            <input name="label" placeholder="Ім'я учня (необов'язково)" maxLength={80} />
            <button className="btn primary" type="submit" disabled={used >= me.studentLimit}>Створити код доступу</button>
          </form>
          {openInvites.length > 0 && (
            <div className="list">
              {openInvites.map((i) => (
                <div className="row" key={i.code}>
                  <code className="code">{i.code}</code>
                  <span className="t">{i.label ?? "без імені"} · створено {fmt(i.createdAt)}</span>
                  <form action={deleteInvite}><input type="hidden" name="code" value={i.code} /><button className="btn">Видалити</button></form>
                </div>
              ))}
              <p className="muted small">Код одноразовий. Учень вводить його на сторінці входу і одразу бачить таймлайни і тести.</p>
            </div>
          )}
          {students.length === 0 ? (
            <p className="muted">Учнів поки немає. Створіть код і передайте його учню.</p>
          ) : (
            <div className="list">
              {students.map((s) => (
                <div className="row" key={s.id}>
                  <span className="t">{s.label ?? s.name ?? "Учень"}</span>
                  <span className="muted small">з {fmt(s.since)}</span>
                  <form action={removeStudent}><input type="hidden" name="studentId" value={s.id} /><button className="btn">Відв&apos;язати</button></form>
                </div>
              ))}
            </div>
          )}
        </section>

        {me.role === "admin" && (
          <section className="cab-sec">
            <div className="cab-sec-h"><h2>Вчителі</h2><span className="muted">{teachers.length}</span></div>
            {teachers.length === 0 ? (
              <p className="muted">Ще ніхто не входив. Учитель з&apos;явиться тут після першого входу через Telegram, і його треба буде активувати.</p>
            ) : (
              <div className="list">
                {teachers.map((t) => (
                  <div className="row" key={t.id}>
                    <span className="t">
                      {t.firstName} {t.lastName} {t.telegramUsername ? `· @${t.telegramUsername}` : ""}
                      <span className="muted small"> · id {t.telegramId} · {fmt(t.createdAt)}</span>
                    </span>
                    <form action={setStudentLimit} className="inline">
                      <input type="hidden" name="id" value={t.id} />
                      <input name="limit" type="number" defaultValue={t.studentLimit} min={0} max={500} style={{ width: 70 }} />
                      <button className="btn" type="submit">ліміт</button>
                    </form>
                    <form action={setTeacherActive}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="active" value={t.active ? "0" : "1"} />
                      <button className={`btn${t.active ? "" : " primary"}`} type="submit">{t.active ? "Вимкнути доступ" : "Активувати"}</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
