import { redirect } from "next/navigation";
import { getTopics } from "@/content";

export default function CardsIndex() {
  const first = getTopics()[0];
  redirect(first ? `/cards/${first.id}` : "/timelines");
}
