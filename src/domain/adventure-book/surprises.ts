/**
 * Family AI surprises — reconnect old memories with gentle wonder.
 */

import type { Memory } from "@/domain/memory/types";

export type BookSurprise = {
  id: string;
  emoji: string;
  title: string;
  body: string;
};

export function surprisesForBook(
  memories: Memory[],
  childName: string,
): BookSurprise[] {
  if (memories.length === 0) return [];

  const sorted = [...memories].sort(
    (a, b) =>
      new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime(),
  );
  const surprises: BookSurprise[] = [];
  const now = Date.now();

  surprises.push({
    id: "count",
    emoji: "✨",
    title: "Your exploration story so far",
    body: `${childName} and family have discovered ${memories.length} wonderful thing${memories.length === 1 ? "" : "s"} together.`,
  });

  for (const memory of sorted) {
    const ageMs = now - new Date(memory.discoveredAt).getTime();
    const days = ageMs / (24 * 60 * 60 * 1000);
    if (days >= 360 && days <= 400) {
      surprises.push({
        id: `year_${memory.id}`,
        emoji: "🎂",
        title: "One year ago today",
        body: `About a year ago you found your ${memory.objectName}. Want to revisit that page together?`,
      });
      break;
    }
  }

  const byCategory = new Map<string, number>();
  for (const memory of memories) {
    byCategory.set(
      memory.category,
      (byCategory.get(memory.category) ?? 0) + 1,
    );
  }
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 3) {
    surprises.push({
      id: "category_love",
      emoji: "💫",
      title: "A constellation is growing",
      body: `You've returned to ${top[0]} discoveries ${top[1]} times — your curiosity sky is lighting up.`,
    });
  }

  const oldest = sorted[sorted.length - 1];
  if (oldest && sorted.length > 1) {
    surprises.push({
      id: "reconnect",
      emoji: "🔗",
      title: "A thread from the beginning",
      body: `Your first saved page was ${oldest.objectName}. Every new discovery connects back to that spark.`,
    });
  }

  return surprises.slice(0, 3);
}
