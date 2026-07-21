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
  | "conversation_prompts"
  | "match"
  | "reading"
  | "project"
  | "story"
  | "research"
  | "ai_chat"
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

/** Parent Guided — talk prompts instead of quizzes. */
export type LearningConversationPromptsModule = {
  type: "conversation_prompts";
  title: string;
  prompts: string[];
};

export type LearningMatchModule = {
  type: "match";
  prompt: string;
  pairs: Array<{ left: string; right: string }>;
};

export type LearningReadingModule = {
  type: "reading";
  title: string;
  text: string;
};

export type LearningProjectModule = {
  type: "project";
  title: string;
  steps: string[];
};

/** Independent story creation — child authors a short tale about the discovery. */
export type LearningStoryModule = {
  type: "story";
  title: string;
  prompt: string;
  starters: string[];
};

export type LearningResearchModule = {
  type: "research";
  question: string;
  hints: string[];
};

export type LearningAiChatModule = {
  type: "ai_chat";
  title: string;
  starter: string;
  followUps: string[];
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
  | LearningConversationPromptsModule
  | LearningMatchModule
  | LearningReadingModule
  | LearningProjectModule
  | LearningStoryModule
  | LearningResearchModule
  | LearningAiChatModule
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
