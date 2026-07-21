/**
 * Maps a real-world discovery into structured Family AI Profile updates.
 * Fire Truck → Vehicles interest, vocabulary, Community Helpers, future finds.
 */

import {
  ADVENTURE_COLLECTIONS,
  collectionForDiscovery,
  collectionProgress,
} from "@/domain/adventure/collections";
import type {
  AdventureProgressEntry,
  CollectionProgressEntry,
  FamilyAIProfile,
  FutureDiscoverySuggestion,
  InterestScore,
  LearningHistoryEntry,
  MemoryHistoryEntry,
  VocabularyEntry,
} from "@/domain/family/FamilyAIProfile";
import type { Adventure } from "@/domain/adventure/types";
import type { Memory } from "@/domain/memory/types";
import { categoryForObject } from "@/domain/shared/categories";

export type DiscoveryProfileContext = {
  memory: Memory;
  adventures: Adventure[];
  /** Library / Learning Graph vocabulary for this discovery */
  vocabularyWords?: string[];
  /** Related discovery names (Ambulance, Firefighter, …) */
  relatedNames?: string[];
  /** Interest category label, e.g. "Vehicles" */
  interestCategory?: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  vehicles: "Vehicles",
  animals: "Animals",
  plants: "Nature",
  insects: "Insects",
  food: "Food",
  ocean: "Ocean",
  construction: "Construction",
  nature: "Nature",
  buildings: "Places",
  household: "Home",
  landmarks: "Places",
  other: "Discoveries",
};

export function interestLabelForCategory(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}

/**
 * Pure transform — apply one discovery to the current profile.
 * Everything becomes more intelligent after every discovery.
 */
export function applyDiscoveryToProfile(
  profile: FamilyAIProfile,
  context: DiscoveryProfileContext,
): FamilyAIProfile {
  const { memory, adventures } = context;
  const now = memory.discoveredAt || new Date().toISOString();
  const name = memory.objectName.trim();
  const categoryKey = memory.category || categoryForObject(name);
  const interestCategory =
    context.interestCategory ?? interestLabelForCategory(categoryKey);

  const memoryHistory = upsertMemoryTimeline(profile.memoryHistory, {
    memoryId: memory.id,
    objectName: name,
    category: interestCategory,
    discoveredAt: now,
    locationLabel: memory.locationLabel,
  });

  const interestScores = boostInterest(
    profile.interestScores,
    interestCategory,
    now,
  );
  const interests = interestScores
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((item) => item.category);

  const vocabularyWords =
    context.vocabularyWords && context.vocabularyWords.length > 0
      ? context.vocabularyWords
      : defaultVocabularyFor(name);
  const vocabulary = mergeVocabulary(
    profile.vocabulary,
    vocabularyWords,
    name,
    now,
  );

  const discoveredNames = memoryHistory.map((item) => item.objectName);
  const collections = buildCollections(discoveredNames);
  const collection = collectionForDiscovery(name);

  const adventureProgress = mergeAdventureProgress(
    profile.adventureProgress,
    adventures,
  );
  const favoriteAdventures = rankNames([
    ...adventures.map((item) => item.title),
    ...profile.favoriteAdventures,
  ]);
  const favoriteDiscoveries = rankNames(
    memoryHistory.map((item) => item.objectName),
  );

  const relatedNames = context.relatedNames ?? relatedFallback(name, collection?.id);
  const potentialFutureDiscoveries = buildFutureDiscoveries({
    discoveredNames,
    relatedNames,
    collections,
    interestCategory,
    currentDiscovery: name,
  });

  const learningEvents: LearningHistoryEntry[] = [
    {
      at: now,
      event: "discovery",
      discoveryName: name,
      detail: `Discovered ${name} · ${interestCategory}`,
    },
    {
      at: now,
      event: "interest",
      discoveryName: name,
      detail: `Interest in ${interestCategory} grew`,
    },
    ...vocabularyWords.map(
      (word): LearningHistoryEntry => ({
        at: now,
        event: "vocabulary",
        discoveryName: name,
        detail: `Learned “${word}”`,
      }),
    ),
  ];

  if (adventures.length > 0) {
    learningEvents.push({
      at: now,
      event: "adventure_unlock",
      discoveryName: name,
      detail: `Unlocked ${adventures.length} adventure${adventures.length === 1 ? "" : "s"}`,
    });
  }

  if (collection) {
    const progress = collectionProgress(collection, discoveredNames);
    learningEvents.push({
      at: now,
      event: "collection_progress",
      discoveryName: name,
      detail: `${collection.title} ${progress.completed}/${progress.total}`,
    });
  }

  // First discovery of a concept → needs practice; repeats strengthen mastery signal.
  const discoveryCount = memoryHistory.filter(
    (item) => item.objectName.toLowerCase() === name.toLowerCase(),
  ).length;
  let masteredConcepts = [...profile.masteredConcepts];
  let needsPractice = [...profile.needsPractice];
  if (discoveryCount >= 3) {
    masteredConcepts = unique([name, ...masteredConcepts]);
    needsPractice = needsPractice.filter(
      (item) => item.toLowerCase() !== name.toLowerCase(),
    );
    learningEvents.push({
      at: now,
      event: "mastery",
      discoveryName: name,
      detail: `${name} looking familiar — mastery growing`,
    });
  } else if (!masteredConcepts.some((item) => item.toLowerCase() === name.toLowerCase())) {
    needsPractice = unique([name, ...needsPractice]);
    learningEvents.push({
      at: now,
      event: "practice",
      discoveryName: name,
      detail: `Keep noticing ${name} in the real world`,
    });
  }

  const learningHistory = [...learningEvents, ...profile.learningHistory].slice(
    0,
    80,
  );

  return {
    ...profile,
    interests,
    interestScores,
    favoriteDiscoveries,
    favoriteAdventures,
    vocabulary,
    memoryHistory,
    learningHistory,
    adventureProgress,
    collections,
    potentialFutureDiscoveries,
    masteredConcepts,
    needsPractice,
    updatedAt: new Date().toISOString(),
  };
}

function upsertMemoryTimeline(
  history: MemoryHistoryEntry[],
  entry: MemoryHistoryEntry,
): MemoryHistoryEntry[] {
  return [entry, ...history.filter((item) => item.memoryId !== entry.memoryId)].slice(
    0,
    100,
  );
}

function boostInterest(
  scores: InterestScore[],
  category: string,
  at: string,
): InterestScore[] {
  const existing = scores.find(
    (item) => item.category.toLowerCase() === category.toLowerCase(),
  );
  const next: InterestScore = existing
    ? {
        ...existing,
        score: existing.score + 1,
        discoveryCount: existing.discoveryCount + 1,
        lastDiscoveredAt: at,
      }
    : {
        category,
        score: 1,
        discoveryCount: 1,
        lastDiscoveredAt: at,
      };

  return [next, ...scores.filter((item) => item.category !== next.category)].sort(
    (a, b) => b.score - a.score,
  );
}

function mergeVocabulary(
  existing: VocabularyEntry[],
  words: string[],
  sourceDiscovery: string,
  at: string,
): VocabularyEntry[] {
  const map = new Map(
    existing.map((item) => [item.word.toLowerCase(), item] as const),
  );
  for (const word of words) {
    const key = word.trim().toLowerCase();
    if (!key) continue;
    const prev = map.get(key);
    map.set(key, {
      word: word.trim(),
      sourceDiscovery,
      learnedAt: prev?.learnedAt ?? at,
      strength: (prev?.strength ?? 0) + 1,
    });
  }
  return [...map.values()]
    .sort((a, b) => b.strength - a.strength || a.word.localeCompare(b.word))
    .slice(0, 120);
}

function buildCollections(discoveredNames: string[]): CollectionProgressEntry[] {
  return ADVENTURE_COLLECTIONS.map((collection) => {
    const progress = collectionProgress(collection, discoveredNames);
    const found = new Set(discoveredNames.map((name) => name.toLowerCase()));
    const remaining = collection.discoveryNames.filter(
      (name) => !found.has(name.toLowerCase()),
    );
    return {
      collectionId: collection.id,
      title: collection.title,
      emoji: collection.emoji,
      completed: progress.completed,
      total: progress.total,
      remaining,
    };
  }).filter((item) => item.completed > 0);
}

function mergeAdventureProgress(
  existing: AdventureProgressEntry[],
  unlocked: Adventure[],
): AdventureProgressEntry[] {
  const map = new Map(
    existing.map((item) => [item.adventureId, item] as const),
  );
  for (const adventure of unlocked) {
    map.set(adventure.id, {
      adventureId: adventure.id,
      title: adventure.title,
      objectName: adventure.objectName,
      status: adventure.status,
      progressRatio:
        adventure.status === "completed"
          ? 1
          : adventure.status === "in_progress"
            ? 0.5
            : 0,
    });
  }
  return [...map.values()];
}

function buildFutureDiscoveries(input: {
  discoveredNames: string[];
  relatedNames: string[];
  collections: CollectionProgressEntry[];
  interestCategory: string;
  currentDiscovery: string;
}): FutureDiscoverySuggestion[] {
  const found = new Set(
    input.discoveredNames.map((name) => name.toLowerCase()),
  );
  const suggestions: FutureDiscoverySuggestion[] = [];

  for (const name of input.relatedNames) {
    if (found.has(name.toLowerCase())) continue;
    if (name.toLowerCase() === input.currentDiscovery.toLowerCase()) continue;
    suggestions.push({
      name,
      reason: `Related to ${input.currentDiscovery}`,
      source: "related",
      score: 3,
    });
  }

  for (const collection of input.collections) {
    for (const name of collection.remaining.slice(0, 4)) {
      suggestions.push({
        name,
        reason: `Complete ${collection.title}`,
        source: "collection",
        score: 4,
      });
    }
  }

  // Soft interest-based nudges when we know the category.
  for (const name of interestFallbackSuggestions(input.interestCategory)) {
    if (found.has(name.toLowerCase())) continue;
    suggestions.push({
      name,
      reason: `Because they love ${input.interestCategory}`,
      source: "interest",
      score: 2,
    });
  }

  const dedup = new Map<string, FutureDiscoverySuggestion>();
  for (const suggestion of suggestions) {
    const key = suggestion.name.toLowerCase();
    const prev = dedup.get(key);
    if (!prev || suggestion.score > prev.score) {
      dedup.set(key, suggestion);
    }
  }

  return [...dedup.values()]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 10);
}

function relatedFallback(
  name: string,
  collectionId?: string,
): string[] {
  const key = name.toLowerCase();
  if (key.includes("fire")) {
    return ["Ambulance", "Police Car", "Firefighter", "Fire Station"];
  }
  if (collectionId === "community_helpers") {
    return ["Ambulance", "Police Car", "Firefighter", "School Bus", "Mail Truck"];
  }
  if (collectionId === "pollinators") {
    return ["Bee", "Butterfly", "Flower", "Hummingbird"];
  }
  if (collectionId === "construction") {
    return ["Excavator", "Crane", "Dump Truck", "Bulldozer"];
  }
  return [];
}

function interestFallbackSuggestions(category: string): string[] {
  switch (category) {
    case "Vehicles":
      return ["Ambulance", "School Bus", "Train", "Police Car"];
    case "Animals":
      return ["Dog", "Cat", "Bird", "Turtle"];
    case "Nature":
      return ["Tree", "Flower", "Rainbow", "Rock"];
    case "Construction":
      return ["Excavator", "Crane", "Dump Truck"];
    case "Ocean":
      return ["Boat", "Fish", "Shell"];
    default:
      return [];
  }
}

function defaultVocabularyFor(name: string): string[] {
  const key = name.toLowerCase();
  if (key.includes("fire")) return ["siren", "ladder", "rescue"];
  if (key.includes("ambulance")) return ["help", "hospital", "care"];
  if (key.includes("dog")) return ["bark", "paw", "friend"];
  if (key.includes("bee")) return ["buzz", "honey", "pollen"];
  return [name.split(" ")[0]!.toLowerCase()];
}

function rankNames(names: string[], limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const name of names) {
    const key = name.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name)
    .slice(0, limit);
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}
