import { getMindmap } from "@/content";
import { MindMap } from "@/components/mindmap/MindMap";

/** Майндмеп усіх часів: одна карта, яку можна тягнути й масштабувати. */
export default function MindmapPage() {
  const m = getMindmap();
  return (
    <main className="mm-page" data-tour="card">
      <MindMap title={m.title} tenses={m.tenses} />
    </main>
  );
}
