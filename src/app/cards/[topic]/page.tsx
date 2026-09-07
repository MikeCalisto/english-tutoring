import { notFound } from "next/navigation";
import { getNav, getTopic, getTopics } from "@/content";
import { Rail } from "@/components/shell/Rail";
import { Deck } from "@/components/cards/Deck";

export function generateStaticParams() {
  return getTopics().map((t) => ({ topic: t.id }));
}

export default async function TopicPage({ params, searchParams }: { params: Promise<{ topic: string }>; searchParams: Promise<{ card?: string }> }) {
  const { topic } = await params;
  const { card } = await searchParams;
  const initial = Math.max(0, (Number(card) || 1) - 1);
  const t = getTopic(topic);
  if (!t) notFound();
  const groups = getNav().map((g) => ({
    id: g.id,
    label: g.label,
    items: g.topics.map((x) => ({ id: x.id, label: x.label, href: `/cards/${x.id}`, available: x.available, count: x.count })),
  }));
  return (
    <div className="layout">
      <Rail groups={groups} />
      <main className="main">
        <Deck topic={t} initial={initial} />
      </main>
    </div>
  );
}
