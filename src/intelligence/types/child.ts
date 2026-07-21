import type {
  AdventureNodeId,
  ChildId,
  CollectionId,
  LearningObjectiveId,
  WorldNodeId,
} from "@/intelligence/types/ids";

/**
 * CHILD GRAPH — one child. References other graphs by ID only.
 * Never duplicates World / Learning content.
 */

export type LearningPreference = {
  modality: "visual" | "audio" | "kinesthetic" | "social" | "story";
  strength: number;
};

/** Who usually explores with the child — from Family AI onboarding. */
export type CoExplorerRole =
  | "mom"
  | "dad"
  | "grandparent"
  | "sibling"
  | "other";

export type ChildStreaks = {
  discoveryDays: number;
  lastDiscoveryDate: string | null;
};

export type ChildBadge = {
  badgeId: string;
  earnedAt: string;
};

export type ChildGoal = {
  id: string;
  title: string;
  worldNodeIds?: WorldNodeId[];
  adventureIds?: AdventureNodeId[];
  createdAt: string;
  completedAt: string | null;
};

export type RecommendationHistoryEntry = {
  at: string;
  kind: string;
  targetId: string;
  reasonCodes: string[];
};

export type ProgressHistoryEntry = {
  at: string;
  event: string;
  worldNodeId?: WorldNodeId;
  adventureId?: AdventureNodeId;
  memoryId?: string;
};

export type ChildNode = {
  id: ChildId;
  name: string;
  birthdate: string | null;
  currentAge: number;
  /** Home / spoken languages (e.g. ["en"]). */
  languages: string[];
  /**
   * Parent-enabled learning languages (e.g. ["es"]).
   * Spanish content appears ONLY when this includes "es"/"spanish"
   * OR a parentGoal targets Spanish.
   */
  learningLanguages: string[];
  /** Explicit Spanish toggle from parent settings. */
  spanishEnabled: boolean;
  /** Interests from onboarding — feeds recommendations. */
  favoriteCategories: string[];
  /** Family members who usually explore together. */
  coExplorers: CoExplorerRole[];
  completedNodeIds: WorldNodeId[];
  completedAdventureIds: AdventureNodeId[];
  masteredLearningObjectives: LearningObjectiveId[];
  needsPracticeObjectives: LearningObjectiveId[];
  favoriteActivities: string[];
  completedQuizzes: string[];
  learningPreferences: LearningPreference[];
  /** Learning progression level 1–5 (derived from age when unset). */
  currentLevel: number;
  streaks: ChildStreaks;
  earnedBadges: ChildBadge[];
  collections: CollectionId[];
  goals: ChildGoal[];
  parentGoals: ChildGoal[];
  questionHistory: string[];
  recommendationHistory: RecommendationHistoryEntry[];
  progressHistory: ProgressHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type CreateChildNodeInput = Partial<
  Omit<ChildNode, "id" | "createdAt" | "updatedAt">
> & {
  id?: string;
  name: string;
  currentAge: number;
};
