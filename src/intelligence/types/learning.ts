import type {
  LearningNodeId,
  MediaId,
  WorldNodeId,
} from "@/intelligence/types/ids";
import type { AgeRange } from "@/intelligence/types/world";

/**
 * LEARNING GRAPH — HOW something can be taught.
 * Each Learning Node references exactly one World Node.
 * Same world concept → many age / modality variants.
 *
 * Every lesson supports: age bounds, difficulty, category, objectives,
 * required knowledge, related world nodes, duration, and languages.
 */

export type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation?: string;
};

export type LearningCategory =
  | "vocabulary"
  | "science"
  | "math"
  | "community"
  | "nature"
  | "language"
  | "engineering"
  | "geography"
  | "history"
  | "creative"
  | "social"
  | "general";

export type AgeLearningVariant = {
  ageRange: AgeRange;
  /** Preferred learning level for this variant (1–5). */
  learningLevel?: 1 | 2 | 3 | 4 | 5;
  vocabulary: string[];
  funFacts: string[];
  quizQuestions: QuizQuestion[];
  wonderQuestions: string[];
  conversationPrompts: string[];
  activities: string[];
  learningGoals: string[];
  /** Structured learning objectives for progression scoring. */
  learningObjectives: string[];
  /** Concepts that should be familiar before this variant. */
  requiredKnowledge: string[];
  estimatedDurationMinutes: number;
  difficulty: number;
  category: LearningCategory;
  languagesSupported: string[];
  /** Optional Spanish pairing for the discovery (only shown when Spanish enabled). */
  spanish?: {
    word: string;
    pronunciation: string;
  };
};

export type LearningNode = {
  id: LearningNodeId;
  worldNodeId: WorldNodeId;
  /** Optional human label, e.g. "Fire Truck · Early Childhood". */
  title: string;
  /** Soft age bounds for the whole node (variants refine further). */
  minimumAge: number;
  maximumAge: number;
  difficulty: number;
  category: LearningCategory;
  learningObjectives: string[];
  requiredKnowledge: string[];
  relatedWorldNodeIds: WorldNodeId[];
  estimatedDurationMinutes: number;
  languagesSupported: string[];
  vocabulary: string[];
  pronunciation: string;
  funFacts: string[];
  quizQuestions: QuizQuestion[];
  wonderQuestions: string[];
  conversationPrompts: string[];
  activities: string[];
  stories: MediaId[];
  videos: MediaId[];
  songs: MediaId[];
  games: MediaId[];
  coloringPages: MediaId[];
  creatorContent: MediaId[];
  /** @deprecated Prefer learningObjectives — kept for seed/legacy callers. */
  learningGoals: string[];
  ageVariants: AgeLearningVariant[];
  createdAt: string;
  updatedAt: string;
};

export type CreateLearningNodeInput = Omit<
  LearningNode,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: string;
};
