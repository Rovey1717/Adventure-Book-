/**
 * Adventure Entry — a collectible storybook page for one memory.
 * Not a photo + date row. Family AI storytelling makes it meaningful.
 */

import {
  collectionForDiscovery,
  collectionProgress,
  ADVENTURE_COLLECTIONS,
} from "@/domain/adventure/collections";
import type { Memory } from "@/domain/memory/types";
import { learningLevelForAge } from "@/intelligence/types/progression";
import { celebrationFirstName } from "@/domain/celebration/messages";

export type AdventureEntry = {
  memoryId: string;
  objectName: string;
  photoUri: string | null;
  category: Memory["category"];
  storyTitle: string;
  storyBody: string;
  familyMoment: string;
  thingsLearned: string[];
  newDiscoveries: string[];
  curiositySeeds: string[];
  discoveryBadge: string;
  adventureBadge: string | null;
  explorerLevel: number;
  childAge: number | null;
  dateLabel: string;
  locationLabel: string | null;
  isFavorite: boolean;
  collectionTitle: string | null;
  collectionProgressLabel: string | null;
  discoveryCount: number;
  celebrations: string[];
};

const SEEDS_BY_OBJECT: Record<string, string[]> = {
  flower: ["Bee", "Honey", "Tree", "Butterfly", "Garden"],
  sunflower: ["Bee", "Seeds", "Sun", "Garden", "Pollination"],
  bee: ["Flower", "Honey", "Hive", "Pollination", "Butterfly"],
  butterfly: ["Caterpillar", "Flower", "Garden", "Nest", "Egg"],
  "fire truck": ["Firefighter", "Fire Station", "Ambulance", "Safety", "Hose"],
  tree: ["Leaf", "Bird", "Nest", "Roots", "Forest"],
  ocean: ["Shell", "Fish", "Wave", "Boat", "Sand"],
  dog: ["Park", "Bone", "Friend", "Walk", "Tail"],
};

const CONSTELLATION_LINKS: Record<string, string[]> = {
  flower: ["Bee", "Honey", "Tree", "Bird", "Nest"],
  bee: ["Flower", "Honey", "Tree", "Butterfly"],
  butterfly: ["Flower", "Caterpillar", "Garden", "Egg"],
  "fire truck": ["Firefighter", "Ambulance", "Police Car"],
  tree: ["Bird", "Nest", "Leaf", "Squirrel"],
};

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function article(name: string): string {
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

/**
 * Family AI short story for a discovery memory.
 * Prefer saved memory.story when present.
 */
export function storyForMemory(
  memory: Memory,
  context: {
    childName: string;
    childAge: number;
    coExplorerLabel?: string;
    isFirstOfKind: boolean;
    totalDiscoveries: number;
  },
): { title: string; body: string } {
  if (memory.story?.trim()) {
    return {
      title: memory.notes?.trim() || storyTitleFor(memory, context),
      body: memory.story.trim(),
    };
  }

  const title = storyTitleFor(memory, context);
  const who = context.coExplorerLabel?.trim() || "your family";
  const place = memory.locationLabel?.trim() || "somewhere wonderful";
  const name = memory.objectName;
  const collection = collectionForDiscovery(name);

  const lines = [
    `Today ${context.childName} discovered ${article(name)} ${name} while exploring with ${who}.`,
    `You found it near ${place}.`,
  ];

  if (context.isFirstOfKind) {
    lines.push(`This was the first ${name} saved in Adventure Book — a brand-new constellation star.`);
  } else {
    lines.push(
      `You've met ${name} ${memory.discoveryCount} times now — each visit deepens the story.`,
    );
  }

  if (collection) {
    lines.push(
      `That tiny discovery helped grow the ${collection.title} collection and planted new curiosity seeds.`,
    );
  } else {
    lines.push(
      `That discovery opened a new page in your lifelong exploration journey.`,
    );
  }

  return { title, body: lines.join("\n\n") };
}

function storyTitleFor(
  memory: Memory,
  context: { isFirstOfKind: boolean },
): string {
  const name = memory.objectName;
  if (context.isFirstOfKind) {
    return `The Day You Found Your First ${name}`;
  }
  return `Another Chapter with ${article(name)} ${name}`;
}

export function curiositySeedsFor(objectName: string): string[] {
  const key = objectName.trim().toLowerCase();
  return (
    SEEDS_BY_OBJECT[key] ??
    CONSTELLATION_LINKS[key] ?? ["Related wonders", "Nearby helpers", "Nature friends"]
  ).slice(0, 5);
}

export function constellationNeighbors(objectName: string): string[] {
  const key = objectName.trim().toLowerCase();
  return (CONSTELLATION_LINKS[key] ?? curiositySeedsFor(objectName)).slice(0, 6);
}

export function buildAdventureEntry(
  memory: Memory,
  context: {
    childName: string;
    childAge: number;
    coExplorerLabel?: string;
    allMemories: Memory[];
  },
): AdventureEntry {
  const sameKind = context.allMemories.filter(
    (item) =>
      item.objectName.toLowerCase() === memory.objectName.toLowerCase(),
  );
  const isFirstOfKind =
    sameKind.length <= 1 ||
    sameKind.sort(
      (a, b) =>
        new Date(a.discoveredAt).getTime() -
        new Date(b.discoveredAt).getTime(),
    )[0]?.id === memory.id;

  const story = storyForMemory(memory, {
    childName: context.childName,
    childAge: context.childAge,
    coExplorerLabel: context.coExplorerLabel,
    isFirstOfKind,
    totalDiscoveries: context.allMemories.length,
  });

  const collection = collectionForDiscovery(memory.objectName);
  const discoveredNames = context.allMemories.map((item) => item.objectName);
  const progress = collection
    ? collectionProgress(collection, discoveredNames)
    : null;

  const ageAtDiscovery = estimateAgeAt(
    context.childAge,
    memory.discoveredAt,
  );

  const firstName = celebrationFirstName(context.childName);
  const celebrations: string[] = [];
  if (isFirstOfKind) celebrations.push(`✨ First ${memory.objectName}`);
  if (context.allMemories.length === 1) {
    celebrations.push(`🌟 ${firstName}'s first Adventure Book page`);
  }
  if (context.allMemories.length === 10) {
    celebrations.push(`🏆 ${firstName}'s 10th discovery`);
  }
  if (progress?.unlocked) celebrations.push(`🎖 ${collection!.title} growing`);
  if (memory.adventuresCompleted > 0) {
    celebrations.push(`🗺 Adventure completed, ${firstName}!`);
  }

  const thingsLearned =
    memory.learningCard?.modules
      .flatMap((module) => {
        if (module.type === "fun_fact") return [module.fact];
        if (module.type === "hear_word") return [`Said “${module.word}”`];
        return [];
      })
      .slice(0, 3) ?? [
      `Noticed a real-world ${memory.objectName}`,
      "Saved a forever memory",
    ];

  return {
    memoryId: memory.id,
    objectName: memory.objectName,
    photoUri: memory.photoUri,
    category: memory.category,
    storyTitle: story.title,
    storyBody: story.body,
    familyMoment:
      memory.notes?.trim() ||
      `A shared exploration moment with ${context.coExplorerLabel ?? "family"}`,
    thingsLearned,
    newDiscoveries: [memory.objectName],
    curiositySeeds: curiositySeedsFor(memory.objectName),
    discoveryBadge: isFirstOfKind
      ? `First ${memory.objectName}`
      : `${ordinal(memory.discoveryCount)} sighting`,
    adventureBadge:
      memory.adventuresCompleted > 0
        ? `${memory.adventuresCompleted} adventure${memory.adventuresCompleted === 1 ? "" : "s"}`
        : null,
    explorerLevel: learningLevelForAge(context.childAge),
    childAge: ageAtDiscovery,
    dateLabel: new Date(memory.discoveredAt).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    locationLabel: memory.locationLabel,
    isFavorite: memory.isFavorite,
    collectionTitle: collection?.title ?? null,
    collectionProgressLabel: progress
      ? `${progress.completed} of ${progress.total}`
      : null,
    discoveryCount: memory.discoveryCount,
    celebrations,
  };
}

function estimateAgeAt(currentAge: number, iso: string): number {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return currentAge;
  const yearsAgo = (Date.now() - at) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.round(currentAge - yearsAgo));
}

/** Lifelong timeline grouped by explorer age. */
export function lifelongTimeline(
  memories: Memory[],
  currentAge: number,
): Array<{ age: number; label: string; entries: Memory[] }> {
  const groups = new Map<number, Memory[]>();
  for (const memory of memories) {
    const age = estimateAgeAt(currentAge, memory.discoveredAt);
    const list = groups.get(age) ?? [];
    list.push(memory);
    groups.set(age, list);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([age, entries]) => ({
      age,
      label: `Age ${age}`,
      entries: entries.sort(
        (a, b) =>
          new Date(a.discoveredAt).getTime() -
          new Date(b.discoveredAt).getTime(),
      ),
    }));
}

export function bookCollectionViews(discoveredNames: string[]) {
  const found = new Set(discoveredNames.map((n) => n.toLowerCase()));
  return ADVENTURE_COLLECTIONS.map((collection) => {
    const progress = collectionProgress(collection, discoveredNames);
    return {
      id: collection.id,
      title: collection.title,
      emoji: collection.emoji,
      completed: progress.completed,
      total: progress.total,
      items: collection.discoveryNames.map((name) => ({
        name,
        found: found.has(name.toLowerCase()),
      })),
    };
  });
}
