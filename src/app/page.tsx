import { Landing } from "@/components/landing/Landing";
import { getCurrentUser } from "@/lib/auth";
import { getTimeline, getTopic } from "@/content";

export const dynamic = "force-dynamic";

/** Публічний лендинг на корені домену. Платформа живе на /cards, /timelines, /tasks, /tests і закрита логіном. */
export default async function Home() {
  const user = await getCurrentUser().catch(() => null);
  const topic = getTopic("present-simple");
  const demoCard = topic ? { ...topic.cards[0], group: topic.group } : null;
  const demoTimeline = getTimeline("past-continuous-past-simple");
  return <Landing loggedIn={Boolean(user)} demoCard={demoCard} demoTimeline={demoTimeline} />;
}
