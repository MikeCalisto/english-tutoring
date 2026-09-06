import { notFound } from "next/navigation";
import { getTimeline, getTimelines } from "@/content";
import { Rail, type RailGroup } from "@/components/shell/Rail";
import { TimelineCard } from "@/components/timeline/Timeline";

export function generateStaticParams() {
  return getTimelines().map((t) => ({ id: t.id }));
}

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = getTimelines();
  const t = getTimeline(id);
  if (!t) notFound();
  const single = all.filter((x) => x.tenses.length === 1);
  const conflicts = all.filter((x) => x.tenses.length > 1);
  const groups: RailGroup[] = [
    { id: "present", label: "Часи", items: single.map((x) => ({ id: x.id, label: x.title, href: `/timelines/${x.id}` })) },
    { id: "past", label: "Конфлікти часів", items: conflicts.map((x) => ({ id: x.id, label: x.title, href: `/timelines/${x.id}` })) },
  ];
  const idx = all.findIndex((x) => x.id === id);
  return (
    <div className="layout">
      <Rail groups={groups} />
      <main className="main">
        <TimelineCard t={t} footer={`Timelines · ${idx + 1} / ${all.length}`} />
      </main>
    </div>
  );
}
