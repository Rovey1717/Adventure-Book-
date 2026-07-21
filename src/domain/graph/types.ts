/**
 * Learning Graph domain — independent of UI.
 * Garden is the first WorldGraph ecosystem; engines stay ecosystem-agnostic.
 */

export type GraphCategory =
  | "animals"
  | "plants"
  | "nature"
  | "concepts";

export type GraphQuizQuestion = {
  question: string;
  choices: string[];
  answerIndex: number;
};

/** A concept in the world knowledge graph. */
export type GraphNode = {
  id: string;
  name: string;
  category: GraphCategory;
  description: string;
  pronunciation: string;
  vocabulary: string[];
  facts: string[];
  hasVideo: boolean;
  hasSound: boolean;
  quiz: GraphQuizQuestion[];
  emoji: string;
};

/**
 * Directed relationship between concepts.
 * `reason` is parent-facing: why moving from → to is meaningful.
 */
export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
  reason: string;
};

export type WorldGraphSnapshot = {
  ecosystemId: string;
  ecosystemTitle: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type ChildNodeProgress = {
  nodeId: string;
  discovered: boolean;
  watchedVideo: boolean;
  completedQuiz: boolean;
  completedAdventure: boolean;
  /**
   * Interactive Learning Journey lesson ids completed via LessonPlayer.
   * Keys match LearningJourneyStepId.
   */
  completedLessonSteps: string[];
  /** 0–100 */
  masteryScore: number;
};

/** Child-wide explorer progression (across all discoveries). */
export type ChildExplorerState = {
  totalXp: number;
};

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
};

export type NextAdventureRecommendation = {
  nodeId: string;
  name: string;
  emoji: string;
  reason: string;
  fromNodeId: string;
  fromName: string;
};
