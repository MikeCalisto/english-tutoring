import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { logLogin, newId, startSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Вход ученика по одноразовому коду учителя. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const code = String(form.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const back = (p: string) => NextResponse.redirect(new URL(p, req.nextUrl.origin), 303);
  if (!code) return back("/login?error=code");

  const [inv] = await db.select().from(schema.invites).where(eq(schema.invites.code, code)).limit(1);
  if (!inv || inv.usedBy || (inv.expiresAt && inv.expiresAt < new Date())) {
    await logLogin(null, "code", false, `code ${code}`);
    return back("/login?error=code");
  }

  const [student] = await db
    .insert(schema.users)
    .values({ id: newId(), role: "student", active: true, firstName: name || inv.label || "Учень" })
    .returning();
  await db.insert(schema.teacherStudent).values({ teacherId: inv.teacherId, studentId: student.id, label: inv.label ?? name ?? null });
  await db.update(schema.invites).set({ usedBy: student.id, usedAt: new Date() }).where(eq(schema.invites.code, code));

  await startSession(student);
  await logLogin(student.id, "code", true);
  return back("/timelines");
}
