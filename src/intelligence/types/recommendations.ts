import type {
  AdventureNodeId,
  LearningNodeId,
  WorldNodeId,
} from "@/intelligence/types/ids";

/**
 * Recommendation payloads returned by the Recommendation Engine.
 * Always derived from graph relationships + child context — never UI state.
 */

export type RecommendationItem<T extends string = string> = {
  id: T;
  score: number;
  reasonCodes: string[];
  /** Short machine reason; UI may localize later. */
  reason: string;
};

export type RecommendationBundle = {
  discoveries: RecommendationItem<WorldNodeId>[];
  adventures: RecommendationItem<AdventureNodeId>[];
  learningCards: RecommendationItem<LearningNodeId>[];
  reviewItems: RecommendationItem<WorldNodeId>[];
  collections: RecommendationItem<string>[];
  stories: RecommendationItem<string>[];
  videos: RecommendationItem<string>[];
};

export type RecommendationContext = {
  childId: string;
  currentMemoryId?: string | null;
  currentWorldNodeId?: string | null;
  limit?: number;
};
