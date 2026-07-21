/**
 * Family AI onboarding — only questions that improve recommendations.
 * Everything can be edited later in Parent.
 */

export type CoExplorerRole =
  | "mom"
  | "dad"
  | "grandparent"
  | "sibling"
  | "other";

export type HomeLanguageChoice = "english" | "spanish" | "multiple";

export type InterestId =
  | "vehicles"
  | "animals"
  | "dinosaurs"
  | "ocean"
  | "construction"
  | "nature"
  | "space"
  | "sports"
  | "music"
  | "art";

export type ParentGoalId =
  | "curiosity"
  | "kindness"
  | "reading"
  | "stem"
  | "nature"
  | "creativity"
  | "confidence"
  | "spanish"
  | "problem_solving";

export type LearningStyleId =
  | "pictures"
  | "videos"
  | "movement"
  | "stories"
  | "music"
  | "hands_on";

export type OnboardingDraft = {
  childName: string;
  /** ISO date YYYY-MM-DD */
  birthdate: string | null;
  coExplorers: CoExplorerRole[];
  homeLanguage: HomeLanguageChoice | null;
  interests: InterestId[];
  parentGoals: ParentGoalId[];
  learningStyles: LearningStyleId[];
};

export const EMPTY_ONBOARDING_DRAFT: OnboardingDraft = {
  childName: "",
  birthdate: null,
  coExplorers: [],
  homeLanguage: null,
  interests: [],
  parentGoals: [],
  learningStyles: [],
};

export type OnboardingOption<T extends string> = {
  id: T;
  label: string;
  emoji?: string;
};

export const CO_EXPLORER_OPTIONS: OnboardingOption<CoExplorerRole>[] = [
  { id: "mom", label: "Mom", emoji: "💛" },
  { id: "dad", label: "Dad", emoji: "💙" },
  { id: "grandparent", label: "Grandparent", emoji: "💚" },
  { id: "sibling", label: "Sibling", emoji: "🧡" },
  { id: "other", label: "Other", emoji: "✨" },
];

export const HOME_LANGUAGE_OPTIONS: OnboardingOption<HomeLanguageChoice>[] = [
  { id: "english", label: "English", emoji: "🗣️" },
  { id: "spanish", label: "Spanish", emoji: "🇪🇸" },
  { id: "multiple", label: "Multiple", emoji: "🌍" },
];

export const INTEREST_OPTIONS: OnboardingOption<InterestId>[] = [
  { id: "vehicles", label: "Vehicles", emoji: "🚗" },
  { id: "animals", label: "Animals", emoji: "🐶" },
  { id: "dinosaurs", label: "Dinosaurs", emoji: "🦖" },
  { id: "ocean", label: "Ocean", emoji: "🌊" },
  { id: "construction", label: "Construction", emoji: "🚜" },
  { id: "nature", label: "Nature", emoji: "🌸" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "art", label: "Art", emoji: "🎨" },
];

export const PARENT_GOAL_OPTIONS: OnboardingOption<ParentGoalId>[] = [
  { id: "curiosity", label: "Curiosity" },
  { id: "kindness", label: "Kindness" },
  { id: "reading", label: "Reading" },
  { id: "stem", label: "STEM" },
  { id: "nature", label: "Nature" },
  { id: "creativity", label: "Creativity" },
  { id: "confidence", label: "Confidence" },
  { id: "spanish", label: "Spanish" },
  { id: "problem_solving", label: "Problem Solving" },
];

export const LEARNING_STYLE_OPTIONS: OnboardingOption<LearningStyleId>[] = [
  { id: "pictures", label: "Pictures", emoji: "🖼️" },
  { id: "videos", label: "Videos", emoji: "🎬" },
  { id: "movement", label: "Movement", emoji: "🤸" },
  { id: "stories", label: "Stories", emoji: "📖" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "hands_on", label: "Hands-on", emoji: "✋" },
];

/** Question steps after Welcome (Finish is separate). */
export const ONBOARDING_STEPS = [
  { key: "child-name", path: "/onboarding/child-name", label: "Name" },
  { key: "birthdate", path: "/onboarding/birthdate", label: "Birthdate" },
  { key: "explorers", path: "/onboarding/explorers", label: "Explorers" },
  { key: "languages", path: "/onboarding/languages", label: "Languages" },
  { key: "interests", path: "/onboarding/interests", label: "Interests" },
  { key: "goals", path: "/onboarding/goals", label: "Goals" },
  {
    key: "learning-style",
    path: "/onboarding/learning-style",
    label: "Learning",
  },
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]["key"];
