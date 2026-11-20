"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";

/** Позначає, що користувач пройшов або пропустив навчання. Повторний виклик нічого не змінює. */
export async function finishTour() {
  const me = await getCurrentUser();
  if (!me || me.tourDoneAt) return;
  await db.update(schema.users).set({ tourDoneAt: new Date() }).where(eq(schema.users.id, me.id));
}
