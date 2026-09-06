import { redirect } from "next/navigation";
import { getTimelines } from "@/content";

export default function TimelinesIndex() {
  const first = getTimelines()[0];
  redirect(first ? `/timelines/${first.id}` : "/cards");
}
