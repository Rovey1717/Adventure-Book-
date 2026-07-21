/**
 * Family AI answers one question only:
 * "What is the next meaningful thing for this child to experience?"
 *
 * Never random. Every pick is grounded in profile + context and carries a reason.
 */

import type { LearningModeFeatures, LearningModeId } from "@/domain/learning/mode";

export type ReasonedRecommendation = {
  /** Short label shown in UI */
  title: string;
  /** What to do / what to find */
  detail: string;
  /** Human-readable explanation of why this was selected */
  reason: string;
  /** Machine codes for analytics / debugging */
  reasonCodes: string[];
  score: number;
};

export type NextMeaningfulExperience = {
  question: "What is the next meaningful thing for this child to experience?";
  childName: string;
  age: number;
  learningMode: LearningModeId;
  /** Anchor discovery this answer was computed from (if any) */
  currentDiscovery: string | null;
  recommendedDiscovery: ReasonedRecommendation;
  recommendedLearningActivity: ReasonedRecommendation;
  recommendedAdventure: ReasonedRecommendation;
  recommendedConversation: ReasonedRecommendation;
  recommendedRealWorldExperience: ReasonedRecommendation;
};

export type NextMeaningfulExperienceInput = {
  childName: string;
  age: number;
  learningMode: LearningModeId;
  interests: string[];
  /** Ranked interest scores when available */
  interestScores?: Array<{ category: string; score: number }>;
  previousDiscoveries: string[];
  previousMemories: string[];
  parentGoals: string[];
  currentDiscovery?: string | null;
  currentAdventure?: string | null;
  /** From profile — collection gaps */
  collectionRemaining?: Array<{
    collectionTitle: string;
    remaining: string[];
  }>;
  /** From profile — future discovery suggestions already scored */
  potentialFutureDiscoveries?: Array<{
    name: string;
    reason: string;
    source: string;
    score: number;
  }>;
  /** Unlocked / in-progress adventures for the current discovery */
  adventureOptions?: Array<{
    title: string;
    status: "unlocked" | "in_progress" | "completed";
    objectName: string;
  }>;
  learningModeFeatures?: LearningModeFeatures;
};
