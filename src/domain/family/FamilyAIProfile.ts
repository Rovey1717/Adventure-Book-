/**
 * FamilyAIProfile — structured knowledge for personalization.
 * Not a chatbot. The single source of truth for who this child is
 * and how Adventure Book should teach them.
 *
 * Every discovery updates this profile so recommendations get smarter.
 */

import type {
  CoExplorerRole,
  LearningPreference,
} from "@/intelligence/types/child";
import {
  definitionForMode,
  learningModeForAge,
  type LearningModeId,
} from "@/domain/learning/mode";

/** Estimated attention window — derived from age / learning mode. */
export type AttentionSpanEstimate = {
  /** short ≈ Parent Guided · guided ≈ Guided Explorer · sustained ≈ Independent */
  band: "short" | "guided" | "sustained";
  minutesMin: number;
  minutesMax: number;
  hint: string;
};

/** Interest strength grown by discoveries (e.g. Vehicles after Fire Truck). */
export type InterestScore = {
  category: string;
  score: number;
  discoveryCount: number;
  lastDiscoveredAt: string;
};

export type VocabularyEntry = {
  word: string;
  /** Discovery that introduced the word */
  sourceDiscovery: string;
  learnedAt: string;
  strength: number;
};

export type MemoryHistoryEntry = {
  memoryId: string;
  objectName: string;
  category: string;
  discoveredAt: string;
  locationLabel: string | null;
};

export type AdventureProgressEntry = {
  adventureId: string;
  title: string;
  objectName: string;
  status: "unlocked" | "in_progress" | "completed";
  progressRatio: number;
};

export type CollectionProgressEntry = {
  collectionId: string;
  title: string;
  emoji: string;
  completed: number;
  total: number;
  /** Names still missing from this collection */
  remaining: string[];
};

export type LearningHistoryEntry = {
  at: string;
  event:
    | "discovery"
    | "vocabulary"
    | "interest"
    | "adventure_unlock"
    | "collection_progress"
    | "mastery"
    | "practice";
  discoveryName: string;
  detail: string;
};

/** Suggested next real-world finds — grows more intelligent with each discovery. */
export type FutureDiscoverySuggestion = {
  name: string;
  reason: string;
  /** related | collection | interest */
  source: "related" | "collection" | "interest";
  score: number;
};

/**
 * Structured Family AI knowledge about one child.
 * Engines and UI personalize from this — never invent a free-form chat.
 */
export type FamilyAIProfile = {
  /** Child Graph id */
  childId: string;
  /** Display name */
  childName: string;
  birthdate: string | null;
  currentAge: number;

  learningMode: LearningModeId;
  learningModeOverride: boolean;

  /** Interest categories ranked by discovery activity */
  interests: string[];
  /** Scored interests — Vehicles grows when Fire Truck is found */
  interestScores: InterestScore[];
  /** Discovery names the family returns to most */
  favoriteDiscoveries: string[];
  /** Adventure titles / kinds the child likes */
  favoriteAdventures: string[];

  /** Words learned from discoveries */
  vocabulary: VocabularyEntry[];

  /** Home / spoken languages */
  languages: string[];
  /** Parent-enabled learning languages (e.g. Spanish) */
  learningLanguages: string[];
  spanishEnabled: boolean;

  parentGoals: string[];
  /** How the child learns best (from onboarding modalities) */
  learningStyle: LearningPreference[];
  attentionSpan: AttentionSpanEstimate;

  masteredConcepts: string[];
  needsPractice: string[];
  questionHistory: string[];
  /** Memory Timeline — newest first */
  memoryHistory: MemoryHistoryEntry[];
  /** Chronological learning events from discoveries */
  learningHistory: LearningHistoryEntry[];
  adventureProgress: AdventureProgressEntry[];
  collections: CollectionProgressEntry[];
  /** Potential future discoveries to suggest next */
  potentialFutureDiscoveries: FutureDiscoverySuggestion[];

  coExplorers: CoExplorerRole[];
  /** Learning Levels 1–5 */
  currentLevel: number;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FamilyAIProfilePatch = Partial<
  Omit<FamilyAIProfile, "attentionSpan" | "updatedAt">
> & {
  attentionSpan?: AttentionSpanEstimate;
};

/** Estimate attention from age and (optional) mode. */
export function estimateAttentionSpan(
  age: number,
  mode: LearningModeId = learningModeForAge(age),
): AttentionSpanEstimate {
  const definition = definitionForMode(mode);
  switch (mode) {
    case "parent_guided":
      return {
        band: "short",
        minutesMin: 2,
        minutesMax: 5,
        hint: definition.summary.includes("prompts")
          ? "Short shared moments — keep prompts playful and brief."
          : "Short shared moments with a parent leading.",
      };
    case "guided_explorer":
      return {
        band: "guided",
        minutesMin: 5,
        minutesMax: 10,
        hint: "Guided play — quizzes and matching in short bursts.",
      };
    case "independent_explorer":
      return {
        band: "sustained",
        minutesMin: 10,
        minutesMax: age >= 11 ? 25 : 20,
        hint: "Sustained projects and research with room to go deeper.",
      };
  }
}

export function emptyFamilyAIProfile(
  overrides: Partial<FamilyAIProfile> = {},
): FamilyAIProfile {
  const age = overrides.currentAge ?? 5;
  const mode = overrides.learningMode ?? learningModeForAge(age);
  const now = new Date().toISOString();

  const base: FamilyAIProfile = {
    childId: "child_kase",
    childName: "Explorer",
    birthdate: null,
    currentAge: age,
    learningMode: mode,
    learningModeOverride: false,
    interests: [],
    interestScores: [],
    favoriteDiscoveries: [],
    favoriteAdventures: [],
    vocabulary: [],
    languages: ["en"],
    learningLanguages: [],
    spanishEnabled: false,
    parentGoals: [],
    learningStyle: [],
    attentionSpan: estimateAttentionSpan(age, mode),
    masteredConcepts: [],
    needsPractice: [],
    questionHistory: [],
    memoryHistory: [],
    learningHistory: [],
    adventureProgress: [],
    collections: [],
    potentialFutureDiscoveries: [],
    coExplorers: [],
    currentLevel: 1,
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  };

  const merged = { ...base, ...overrides };
  merged.attentionSpan =
    overrides.attentionSpan ??
    estimateAttentionSpan(merged.currentAge, merged.learningMode);
  return merged;
}
