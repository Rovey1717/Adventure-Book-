import type { AdventureKind } from "@/domain/adventure/types";
import type { AdventureBlueprint } from "@/domain/adventure/types";
import {
  learningModeForAge,
  type LearningModeId,
} from "@/domain/learning/mode";
import {
  learningLevelForAge,
  type LearningLevel,
} from "@/intelligence/types/progression";

/**
 * Blueprints generate personalized adventures from a Memory.
 * Selection is driven by learning mode + level — never random Spanish.
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
  1: ["sound", "count", "seek"],
  2: ["sound", "count", "quiz", "draw", "seek"],
  3: ["quiz", "habitat", "draw", "seek", "video", "count"],
  4: ["quiz", "habitat", "video", "draw", "seek"],
  5: ["quiz", "habitat", "video", "seek", "draw"],
};

const KINDS_BY_MODE: Record<LearningModeId, AdventureKind[]> = {
  parent_guided: ["sound", "count", "seek"],
  guided_explorer: ["sound", "count", "quiz", "draw", "seek", "video"],
  independent_explorer: ["quiz", "habitat", "video", "seek", "draw"],
};

export type BlueprintSelectionInput = {
  age: number;
  /** Parent enabled Spanish OR Spanish is a learning goal. */
  spanishEnabled: boolean;
  learningMode?: LearningModeId;
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
  const mode = input.learningMode ?? learningModeForAge(input.age);
  const level = learningLevelForAge(input.age);
  const modeKinds = new Set<AdventureKind>(KINDS_BY_MODE[mode]);
  const levelKinds = new Set<AdventureKind>(KINDS_BY_LEVEL[level]);

  // Intersection keeps mode presentation + level calibration aligned.
  const allowed = new Set<AdventureKind>(
    [...modeKinds].filter((kind) => levelKinds.has(kind) || mode === "parent_guided"),
  );

  // Parent Guided never unlocks quizzes.
  if (mode === "parent_guided") {
    allowed.delete("quiz");
  }

  if (input.spanishEnabled) {
    allowed.add("language");
  }

  const selected = ADVENTURE_BLUEPRINTS.filter((b) => allowed.has(b.kind));
  const limit = input.limit ?? 4;

  selected.sort((a, b) => {
    if (a.kind === "language") return 1;
    if (b.kind === "language") return -1;
    return 0;
  });

  return selected.slice(0, limit);
}
