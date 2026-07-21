/**
 * Three learning modes — typical age bands, editable anytime in Parent.
 *
 * Features also follow a gradual developmental curve by age
 * (see developmentalFeatures.ts) so the shift from parent prompts →
 * independent work feels natural. Parents can override the mode at any time.
 */

export type LearningModeId =
  | "parent_guided"
  | "guided_explorer"
  | "independent_explorer";

export type LearningModeFeatures = {
  /** Multiple-choice quizzes */
  quizzes: boolean;
  /** Parent-led talk prompts (no scoring) */
  conversationPrompts: boolean;
  /** Matching / pairing activities */
  matching: boolean;
  /** Short reading moments */
  reading: boolean;
  /** Collection progress & sets */
  collections: boolean;
  /** Short challenges (point, count, find) */
  challenges: boolean;
  /** Multi-step projects */
  projects: boolean;
  /** Create a short story about the discovery */
  storyCreation: boolean;
  /** Research & investigation */
  research: boolean;
  /** Critical-thinking challenges */
  criticalThinking: boolean;
  /** Open AI-style conversation turns */
  aiConversations: boolean;
};

export type LearningModeDefinition = {
  id: LearningModeId;
  label: string;
  shortLabel: string;
  ageMin: number;
  ageMax: number;
  /** Who leads the learning moment */
  leader: "parent" | "guided_child" | "independent_child";
  summary: string;
  features: LearningModeFeatures;
  /** Tab / celebrate copy tone */
  tone: {
    celebrateEyebrow: string;
    celebrateCta: string;
    learningCta: string;
    adventuresSubtitle: string;
    journeySubtitle: string;
    libraryHint: string;
    bookStatusHint: string;
  };
};

export const LEARNING_MODES: LearningModeDefinition[] = [
  {
    id: "parent_guided",
    label: "Parent Guided",
    shortLabel: "Parent",
    ageMin: 2,
    ageMax: 4,
    leader: "parent",
    summary:
      "You teach. Family AI coaches you with conversation starters — so you and your child connect. The app never replaces you.",
    features: {
      quizzes: false,
      conversationPrompts: true,
      matching: false,
      reading: false,
      collections: false,
      challenges: false,
      projects: false,
      storyCreation: false,
      research: false,
      criticalThinking: false,
      aiConversations: false,
    },
    tone: {
      celebrateEyebrow: "Saved for your family",
      celebrateCta: "Get conversation starters",
      learningCta: "Open parent coaching",
      adventuresSubtitle: "Short moments you lead — Family AI coaches you",
      journeySubtitle: "Connection you notice side by side",
      libraryHint: "Parent coaching prompts — we never quiz your child for you",
      bookStatusHint: "Conversation starters ready for you",
    },
  },
  {
    id: "guided_explorer",
    label: "Guided Explorer",
    shortLabel: "Guided",
    ageMin: 5,
    ageMax: 7,
    leader: "guided_child",
    summary:
      "Quizzes, matching, reading, and challenges grow in — parent prompts gently fade as independence builds.",
    features: {
      quizzes: true,
      conversationPrompts: false,
      matching: true,
      reading: true,
      collections: true,
      challenges: true,
      projects: false,
      storyCreation: false,
      research: false,
      criticalThinking: false,
      aiConversations: false,
    },
    tone: {
      celebrateEyebrow: "Amazing Discovery!",
      celebrateCta: "Celebrate & learn",
      learningCta: "Open Learning Card",
      adventuresSubtitle: "Quizzes, matching, and collection quests",
      journeySubtitle: "Collections and skills growing with you",
      libraryHint: "Quizzes, facts, and activities for explorers",
      bookStatusHint: "Learning card ready",
    },
  },
  {
    id: "independent_explorer",
    label: "Independent Explorer",
    shortLabel: "Independent",
    ageMin: 8,
    ageMax: 18,
    leader: "independent_child",
    summary:
      "Projects, story creation, research, and critical thinking — built for longer, self-led exploration.",
    features: {
      quizzes: true,
      conversationPrompts: false,
      matching: true,
      reading: true,
      collections: true,
      challenges: true,
      projects: true,
      storyCreation: true,
      research: true,
      criticalThinking: true,
      aiConversations: true,
    },
    tone: {
      celebrateEyebrow: "Discovery logged",
      celebrateCta: "Start a deeper dive",
      learningCta: "Open explorer card",
      adventuresSubtitle: "Projects, research, and bigger challenges",
      journeySubtitle: "Track projects and deep explorations",
      libraryHint: "Research, projects, stories, and AI conversation",
      bookStatusHint: "Project & research ready",
    },
  },
];

/** Typical age bands → learning mode (parents can override anytime). */
export function learningModeForAge(age: number): LearningModeId {
  if (age <= 4) return "parent_guided";
  if (age <= 7) return "guided_explorer";
  return "independent_explorer";
}

export function definitionForMode(
  mode: LearningModeId,
): LearningModeDefinition {
  return (
    LEARNING_MODES.find((item) => item.id === mode) ?? LEARNING_MODES[1]!
  );
}

/** Static mode contract — prefer featuresForChild for runtime UI. */
export function featuresForMode(mode: LearningModeId): LearningModeFeatures {
  return definitionForMode(mode).features;
}

export {
  parentCoachStartersFor,
  conversationPromptsFor,
  type ParentCoachPack,
} from "@/domain/learning/parentCoach";
