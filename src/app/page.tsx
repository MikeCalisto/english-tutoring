import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Корінь домену — вхід у платформу: хто вже увійшов, потрапляє до матеріалів, решта на сторінку входу. Лендинги живуть на підсторінках (/pack, /uchni). */
export default async function Home() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  redirect(user.role === "student" && !user.fullAccess ? "/timelines" : "/cards");
}
