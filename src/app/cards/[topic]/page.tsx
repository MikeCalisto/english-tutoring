import { notFound } from "next/navigation";
import { getNav, getTopic, getTopics } from "@/content";
import { Rail } from "@/components/shell/Rail";
import { Deck } from "@/components/cards/Deck";

export function generateStaticParams() {
  return getTopics().map((t) => ({ topic: t.id }));
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = getTopic(topic);
  if (!t) notFound();
  const groups = getNav().map((g) => ({
    id: g.id,
    label: g.label,
    items: g.topics.map((x) => ({ id: x.id, label: x.label, href: `/cards/${x.id}`, available: x.available })),
  }));
  return (
    <div className="layout">
      <Rail groups={groups} />
      <main className="main">
        <Deck topic={t} />
      </main>
    </div>
  );
}
