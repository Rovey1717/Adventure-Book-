/**
 * Explorer Passport — stamps earned from real-world discoveries.
 * Collectible, not a checklist.
 */

import type { Memory } from "@/domain/memory/types";

export type PassportStamp = {
  id: string;
  emoji: string;
  title: string;
  earned: boolean;
  earnedAt: string | null;
  hint: string;
};

const STAMP_DEFS: Array<{
  id: string;
  emoji: string;
  title: string;
  match: (name: string, category: string) => boolean;
  hint: string;
}> = [
  {
    id: "fire_station",
    emoji: "🚒",
    title: "Fire Station",
    match: (n) => n.includes("fire"),
    hint: "Find a fire truck or firefighter",
  },
  {
    id: "ocean",
    emoji: "🌊",
    title: "Ocean",
    match: (n, c) => c === "ocean" || n.includes("ocean") || n.includes("shell"),
    hint: "Discover something from the sea",
  },
  {
    id: "zoo",
    emoji: "🐘",
    title: "Zoo",
    match: (n, c) => c === "animals" && !n.includes("dog") && !n.includes("cat"),
    hint: "Meet a wild animal friend",
  },
  {
    id: "butterfly_garden",
    emoji: "🦋",
    title: "Butterfly Garden",
    match: (n) => n.includes("butterfly") || n.includes("bee"),
    hint: "Spot a pollinator",
  },
  {
    id: "train",
    emoji: "🚂",
    title: "Train Ride",
    match: (n) => n.includes("train"),
    hint: "Find a train",
  },
  {
    id: "river",
    emoji: "🛶",
    title: "River",
    match: (n) => n.includes("boat") || n.includes("river"),
    hint: "Explore water adventures",
  },
  {
    id: "garden",
    emoji: "🌻",
    title: "Garden",
    match: (n, c) => c === "plants" || n.includes("flower") || n.includes("tree"),
    hint: "Discover a plant or flower",
  },
  {
    id: "construction",
    emoji: "🚧",
    title: "Build Site",
    match: (n, c) => c === "construction" || n.includes("excavator"),
    hint: "Find a construction machine",
  },
];

export function passportStamps(memories: Memory[]): PassportStamp[] {
  return STAMP_DEFS.map((def) => {
    const hit = memories.find((memory) =>
      def.match(memory.objectName.toLowerCase(), memory.category),
    );
    return {
      id: def.id,
      emoji: def.emoji,
      title: def.title,
      earned: !!hit,
      earnedAt: hit?.discoveredAt ?? null,
      hint: def.hint,
    };
  });
}
