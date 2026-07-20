/**
 * Modular Learning Card model.
 * New experience types plug in as modules — UI stays stable.
 */

export type LearningModuleType =
  | "hero"
  | "hear_word"
  | "fun_fact"
  | "quiz"
  | "wonder"
  | "challenge"
  | "progress"
  | "related"
  | "save_status"
  | "future";

export type LearningHeroModule = {
  type: "hero";
  name: string;
  categoryLabel: string;
  emoji: string;
  photoUri: string | null;
};

export type LearningHearWordModule = {
  type: "hear_word";
  word: string;
  pronunciation: string;
};

export type LearningFunFactModule = {
  type: "fun_fact";
  fact: string;
};

export type LearningQuizModule = {
  type: "quiz";
  question: string;
  choices: string[];
  answerIndex: number;
};

export type LearningWonderModule = {
  type: "wonder";
  prompt: string;
};

export type LearningChallengeModule = {
  type: "challenge";
  text: string;
};

export type LearningProgressModule = {
  type: "progress";
  label: string;
  completed: number;
  total: number;
};

export type LearningRelatedModule = {
  type: "related";
  title: string;
  items: Array<{ id: string; name: string; emoji: string }>;
};

export type LearningSaveStatusModule = {
  type: "save_status";
  message: string;
};

/** Reserved slot for future modules (video, story, song, AR, etc.). */
export type LearningFutureModule = {
  type: "future";
  id: string;
  title: string;
  teaser: string;
};

export type LearningModule =
  | LearningHeroModule
  | LearningHearWordModule
  | LearningFunFactModule
  | LearningQuizModule
  | LearningWonderModule
  | LearningChallengeModule
  | LearningProgressModule
  | LearningRelatedModule
  | LearningSaveStatusModule
  | LearningFutureModule;

export type LearningViewStatus = "never_viewed" | "viewed" | "completed";

export type LearningCardSnapshot = {
  generatedAt: string;
  modules: LearningModule[];
  /** Collection / adventure unlock candidate after card completion. */
  unlockCandidate: {
    id: string;
    title: string;
    emoji: string;
    subtitle: string;
  } | null;
};

export type AdventureCollectionDef = {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  /** Discovery names that progress this adventure. */
  discoveryNames: string[];
};
