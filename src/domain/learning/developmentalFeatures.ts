/**
 * Developmental learning features — gradual by age, not hard mode cliffs.
 *
 * As the child develops:
 *   ↓ parent prompts
 *   ↑ quizzes, challenges, reading, projects, story creation, research
 *
 * Learning mode is the typical band (and parent override).
 * When parents override a mode, that mode’s feature profile is used.
 * Otherwise features follow age so the transition feels natural.
 */

import {
  definitionForMode,
  featuresForMode,
  type LearningModeFeatures,
  type LearningModeId,
} from "@/domain/learning/mode";

export type DevelopmentalFeaturePlan = LearningModeFeatures & {
  /**
   * How many parent-coach starters to show (0 = none).
   * Tapers with age inside the parent-prompt window.
   */
  parentPromptCount: number;
};

export type FeaturesForChildInput = {
  age: number;
  mode: LearningModeId;
  /** When true, parent pinned a mode — use that mode’s contract. */
  modeOverride?: boolean;
};

/**
 * Resolve features for this child right now.
 * Natural age progression unless a parent override is active.
 */
export function featuresForChild(
  input: FeaturesForChildInput,
): DevelopmentalFeaturePlan {
  if (input.modeOverride) {
    return planFromModeFeatures(featuresForMode(input.mode), input.mode);
  }
  return developmentalFeaturesForAge(input.age);
}

/**
 * Age curves — soft unlocks so modes blend at the edges.
 *
 * 2–3  Parent prompts only
 * 4    Prompts + first gentle quizzes
 * 5–6  Quizzes / matching / reading / challenges; prompts taper
 * 7    Projects + story creation begin; prompts fade out
 * 8+   Research + critical thinking
 * 9+   Longer AI-style explorer conversations
 */
export function developmentalFeaturesForAge(
  age: number,
): DevelopmentalFeaturePlan {
  const a = clampAge(age);

  const conversationPrompts = a <= 6;
  const parentPromptCount = promptCountForAge(a);

  return {
    conversationPrompts,
    parentPromptCount,
    quizzes: a >= 4,
    matching: a >= 5,
    reading: a >= 5,
    collections: a >= 5,
    challenges: a >= 5,
    projects: a >= 7,
    storyCreation: a >= 7,
    research: a >= 8,
    criticalThinking: a >= 8,
    aiConversations: a >= 9,
  };
}

function planFromModeFeatures(
  features: LearningModeFeatures,
  mode: LearningModeId,
): DevelopmentalFeaturePlan {
  const parentPromptCount = features.conversationPrompts
    ? mode === "parent_guided"
      ? 5
      : 2
    : 0;

  return {
    ...features,
    parentPromptCount,
  };
}

function promptCountForAge(age: number): number {
  if (age <= 3) return 5;
  if (age === 4) return 4;
  if (age === 5) return 2;
  if (age === 6) return 1;
  return 0;
}

function clampAge(age: number): number {
  if (!Number.isFinite(age)) return 5;
  return Math.min(18, Math.max(2, Math.floor(age)));
}

/** Short human label for Parent UI / debugging. */
export function developmentalStageLabel(age: number): string {
  const a = clampAge(age);
  if (a <= 3) return "Parent coaching focus";
  if (a === 4) return "Prompts + first quizzes";
  if (a <= 6) return "Guided explorer blend";
  if (a === 7) return "Projects & stories emerging";
  if (a <= 8) return "Research & deeper challenges";
  return "Independent explorer";
}

export function featuresSummaryLines(
  plan: DevelopmentalFeaturePlan,
): string[] {
  const lines: string[] = [];
  if (plan.conversationPrompts && plan.parentPromptCount > 0) {
    lines.push(`Parent prompts (${plan.parentPromptCount})`);
  }
  if (plan.quizzes) lines.push("Quizzes");
  if (plan.challenges) lines.push("Challenges");
  if (plan.matching) lines.push("Matching");
  if (plan.reading) lines.push("Reading");
  if (plan.projects) lines.push("Projects");
  if (plan.storyCreation) lines.push("Story creation");
  if (plan.research) lines.push("Research");
  if (plan.criticalThinking) lines.push("Critical thinking");
  if (plan.aiConversations) lines.push("Explorer conversations");
  if (plan.collections) lines.push("Collections");
  return lines;
}

/** Typical mode ages — for copy only. */
export function typicalAgeBandForMode(mode: LearningModeId): string {
  const def = definitionForMode(mode);
  if (mode === "independent_explorer") return "Ages 8+";
  return `Ages ${def.ageMin}–${def.ageMax}`;
}
