import type { AdventureKind } from "@/domain/adventure/types";
import type { AdventureBlueprint } from "@/domain/adventure/types";
import {
  learningLevelForAge,
  type LearningLevel,
} from "@/intelligence/types/progression";

/**
 * Blueprints generate personalized adventures from a Memory.
 * Selection is driven by Learning Progression Engine rules —
 * never unlock every blueprint (especially Spanish) by default.
 */
export const ADVENTURE_BLUEPRINTS: AdventureBlueprint[] = [
  {
    kind: "sound",
    titleFor: (object) => `Listen to ${object} sounds`,
    points: 15,
  },
  {
    kind: "count",
    titleFor: (object) => `Count ${object} features`,
    points: 15,
  },
  {
    kind: "quiz",
    titleFor: (object) => `${object} adventure quiz`,
    points: 25,
  },
  {
    kind: "draw",
    titleFor: (object) => `Draw a ${object}`,
    points: 20,
  },
  {
    kind: "seek",
    titleFor: (object) => `Find another ${object}`,
    points: 30,
  },
  {
    kind: "habitat",
    titleFor: (object) => `Explore ${object} habitat`,
    points: 20,
  },
  {
    kind: "video",
    titleFor: (object) => `Watch a ${object} video`,
    points: 15,
  },
  {
    kind: "language",
    titleFor: (object) => `Learn ${object} in Spanish`,
    points: 20,
  },
];

const KINDS_BY_LEVEL: Record<LearningLevel, AdventureKind[]> = {
  1: ["sound", "count", "quiz", "seek"],
  2: ["sound", "count", "quiz", "draw", "seek"],
  3: ["quiz", "habitat", "draw", "seek", "video", "count"],
  4: ["quiz", "habitat", "video", "draw", "seek"],
  5: ["quiz", "habitat", "video", "seek", "draw"],
};

export type BlueprintSelectionInput = {
  age: number;
  /** Parent enabled Spanish OR Spanish is a learning goal. */
  spanishEnabled: boolean;
  /** Max adventures to unlock per discovery (keeps unlock intentional). */
  limit?: number;
};

/**
 * Choose age-appropriate adventure blueprints for a discovery.
 * Spanish is included only when explicitly enabled — never randomly.
 */
export function selectBlueprintsForChild(
  input: BlueprintSelectionInput,
): AdventureBlueprint[] {
  const level = learningLevelForAge(input.age);
  const allowed = new Set<AdventureKind>(KINDS_BY_LEVEL[level]);
  if (input.spanishEnabled) {
    allowed.add("language");
  }

  const selected = ADVENTURE_BLUEPRINTS.filter((b) => allowed.has(b.kind));
  const limit = input.limit ?? 4;

  // Prefer discovery-tied play first; language last when present.
  selected.sort((a, b) => {
    if (a.kind === "language") return 1;
    if (b.kind === "language") return -1;
    return 0;
  });

  return selected.slice(0, limit);
}
