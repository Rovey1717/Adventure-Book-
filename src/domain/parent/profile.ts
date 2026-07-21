/**
 * MVP child profile until Parent settings land.
 * Learning progression uses age + Spanish gate — never random content.
 */

export const DEMO_CHILD_NAME = "Emma";

/** Demo child age — drives Learning Levels 1–5. */
export const DEMO_CHILD_AGE = 5;

/**
 * Parent-enabled Spanish learning.
 * When false, Spanish adventures and quizzes never appear.
 */
export const DEMO_SPANISH_ENABLED = false;

/** Parent learning goal titles (e.g. "Spanish", "counting"). */
export const DEMO_PARENT_GOALS: string[] = [];

export type DemoLearningProfile = {
  name: string;
  age: number;
  spanishEnabled: boolean;
  learningLanguages: string[];
  parentGoals: string[];
};

export function getDemoLearningProfile(): DemoLearningProfile {
  return {
    name: DEMO_CHILD_NAME,
    age: DEMO_CHILD_AGE,
    spanishEnabled: DEMO_SPANISH_ENABLED,
    learningLanguages: DEMO_SPANISH_ENABLED ? ["es"] : [],
    parentGoals: DEMO_PARENT_GOALS,
  };
}
