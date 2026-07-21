import type { AdventureKind } from "@/domain/adventure/types";
import type { AgeLearningVariant, LearningNode, QuizQuestion } from "@/intelligence/types/learning";
import type {
  AdventureNodeId,
  LearningNodeId,
  WorldNodeId,
} from "@/intelligence/types/ids";

/**
 * Age-based learning stages — every activity is calibrated to one level.
 */
export type LearningLevel = 1 | 2 | 3 | 4 | 5;

export type LearningLevelDefinition = {
  level: LearningLevel;
  label: string;
  ageMin: number;
  ageMax: number;
  focus: string[];
  attentionHint: string;
};

export const LEARNING_LEVELS: LearningLevelDefinition[] = [
  {
    level: 1,
    label: "Sensing & Naming",
    ageMin: 2,
    ageMax: 3,
    focus: [
      "vocabulary",
      "naming objects",
      "colors",
      "animal sounds",
      "matching",
      "simple questions",
    ],
    attentionHint: "short attention span",
  },
  {
    level: 2,
    label: "Wondering & Counting",
    ageMin: 4,
    ageMax: 5,
    focus: [
      "counting",
      "shapes",
      "simple science",
      "patterns",
      "community helpers",
      "nature",
    ],
    attentionHint: "guided play",
  },
  {
    level: 3,
    label: "Reading & Reasoning",
    ageMin: 6,
    ageMax: 7,
    focus: [
      "reading",
      "beginning geography",
      "simple engineering",
      "basic ecosystems",
      "simple math",
      "problem solving",
    ],
    attentionHint: "short challenges",
  },
  {
    level: 4,
    label: "Exploring & Explaining",
    ageMin: 8,
    ageMax: 10,
    focus: [
      "critical thinking",
      "experiments",
      "history",
      "advanced science",
      "creative writing",
      "longer challenges",
    ],
    attentionHint: "sustained projects",
  },
  {
    level: 5,
    label: "Deep Exploration",
    ageMin: 11,
    ageMax: 18,
    focus: [
      "deep exploration",
      "research",
      "projects",
      "real-world connections",
      "career exploration",
      "leadership",
    ],
    attentionHint: "self-directed inquiry",
  },
];

export type LearningActivityKind =
  | "quiz"
  | "challenge"
  | "wonder"
  | "vocabulary"
  | "hear_word"
  | "fun_fact"
  | "spanish"
  | "count"
  | "match"
  | "sound"
  | "draw"
  | "seek"
  | "experiment"
  | "research"
  | "project";

/**
 * Inputs for "What is the NEXT BEST thing for THIS child to learn?"
 */
export type ProgressionContext = {
  childAge: number;
  /** Explicit level override; otherwise derived from age. */
  currentLevel?: LearningLevel | number;
  worldNodeId?: WorldNodeId | string | null;
  discoveryLabel?: string | null;
  adventureId?: AdventureNodeId | string | null;
  adventureTitle?: string | null;
  /** Parent-enabled learning languages (e.g. ["es"]). */
  learningLanguages?: string[];
  /** Spoken / home languages. */
  languages?: string[];
  /** Parent goal titles or tags (e.g. "Spanish", "counting"). */
  parentGoals?: string[];
  /** Mastered concept / objective ids or labels. */
  masteredConcepts?: string[];
  /** Quiz / activity ids already completed. */
  completedActivityIds?: string[];
  /** Trigger that prompted selection. */
  trigger?:
    | "discovery"
    | "adventure_unlock"
    | "adventure_continue"
    | "review"
    | "free_play";
};

export type SelectedLearningActivity = {
  kind: LearningActivityKind;
  /** Adventure blueprint kind when applicable. */
  adventureKind: AdventureKind | null;
  title: string;
  prompt: string;
  rationale: string;
  level: LearningLevel;
  levelFocus: string[];
  worldNodeId: string | null;
  discoveryLabel: string | null;
  learningNodeId: LearningNodeId | string | null;
  estimatedDurationMinutes: number;
  languages: string[];
  quiz: QuizQuestion | null;
  spanish: {
    english: string;
    spanish: string;
    pronunciation: string;
  } | null;
  relatedWorldNodeIds: string[];
  learningObjectives: string[];
  score: number;
  reasonCodes: string[];
};

export type ProgressionResult = {
  activity: SelectedLearningActivity;
  level: LearningLevelDefinition;
  learningNode: LearningNode | null;
  variant: AgeLearningVariant | null;
  /** Ordered alternatives after the top pick. */
  alternatives: SelectedLearningActivity[];
  /** Adventure kinds safe to unlock for this context (no random Spanish). */
  adventureKinds: AdventureKind[];
};

export function learningLevelForAge(age: number): LearningLevel {
  if (age <= 3) return 1;
  if (age <= 5) return 2;
  if (age <= 7) return 3;
  if (age <= 10) return 4;
  return 5;
}

export function definitionForLevel(level: LearningLevel): LearningLevelDefinition {
  return LEARNING_LEVELS.find((item) => item.level === level) ?? LEARNING_LEVELS[0]!;
}

/**
 * Spanish is intentional only — never random.
 */
export function isSpanishEnabled(context: ProgressionContext): boolean {
  const langs = [
    ...(context.learningLanguages ?? []),
    ...(context.languages ?? []),
  ].map((l) => l.toLowerCase());
  if (langs.some((l) => l === "es" || l === "spanish" || l.startsWith("es-"))) {
    return true;
  }
  const goals = (context.parentGoals ?? []).map((g) => g.toLowerCase());
  return goals.some(
    (g) =>
      g.includes("spanish") ||
      g.includes("español") ||
      g.includes("espanol") ||
      g === "es",
  );
}
