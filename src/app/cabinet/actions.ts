"use server";

import { and, count, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { newCode, requireUser } from "@/lib/auth";

/** Учитель создаёт код приглашения, если не исчерпан лимит учеников. */
export async function createInvite(formData: FormData) {
  const me = await requireUser(["teacher", "admin"]);
  if (!me) return;
  const label = String(formData.get("label") ?? "").trim().slice(0, 80) || null;
  const [{ n: students }] = await db.select({ n: count() }).from(schema.teacherStudent).where(eq(schema.teacherStudent.teacherId, me.id));
  const [{ n: open }] = await db
    .select({ n: count() })
    .from(schema.invites)
    .where(and(eq(schema.invites.teacherId, me.id), isNull(schema.invites.usedBy)));
  if (Number(students) + Number(open) >= me.studentLimit) return;
  await db.insert(schema.invites).values({ code: newCode(), teacherId: me.id, label });
  revalidatePath("/cabinet");
}

export async function deleteInvite(formData: FormData) {
  const me = await requireUser(["teacher", "admin"]);
  if (!me) return;
  const code = String(formData.get("code") ?? "");
  await db.delete(schema.invites).where(and(eq(schema.invites.code, code), eq(schema.invites.teacherId, me.id)));
  revalidatePath("/cabinet");
}

export async function removeStudent(formData: FormData) {
  const me = await requireUser(["teacher", "admin"]);
  if (!me) return;
  const studentId = String(formData.get("studentId") ?? "");
  await db.delete(schema.teacherStudent).where(and(eq(schema.teacherStudent.teacherId, me.id), eq(schema.teacherStudent.studentId, studentId)));
  revalidatePath("/cabinet");
}

/** Админ включает или выключает доступ учителю. */
export async function setTeacherActive(formData: FormData) {
  const me = await requireUser(["admin"]);
  if (!me) return;
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "1";
  await db.update(schema.users).set({ active }).where(and(eq(schema.users.id, id), eq(schema.users.role, "teacher")));
  revalidatePath("/cabinet");
}

export async function setStudentLimit(formData: FormData) {
  const me = await requireUser(["admin"]);
  if (!me) return;
  const id = String(formData.get("id") ?? "");
  const limit = Math.max(0, Math.min(500, Number(formData.get("limit") ?? 10) || 10));
  await db.update(schema.users).set({ studentLimit: limit }).where(eq(schema.users.id, id));
  revalidatePath("/cabinet");
}
