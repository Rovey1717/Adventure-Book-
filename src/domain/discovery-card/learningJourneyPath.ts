/**
 * Reusable Learning Journey — every Discovery Card owns one.
 *
 * Endless Duolingo-style path: digital lessons ↔ real-world missions.
 * Family AI picks the one next lesson. Completing unlocks the next.
 * The journey never ends — age-gated + connection lessons grow with the child.
 */

import type { LearningModeFeatures } from "@/domain/learning/mode";
import type { LessonXpKind } from "@/domain/progression/explorerXp";

export type LearningJourneyRealm = "digital" | "real_world" | "connection";

export type LearningJourneyStepId =
  | "discover"
  | "learn_name"
  | "hear_pronunciation"
  | "quiz_colors"
  | "match_picture"
  | "learn_parts"
  | "find_another"
  | "count_three"
  | "learn_why"
  | "connection_mission"
  | "smell_touch"
  | "find_three"
  | "quiz_picture"
  | "quiz_sound"
  | "quiz_true_false"
  | "come_back"
  | "draw"
  | "conversation"
  | "plant_seed"
  | "watch_grow"
  | "mastery"
  | "future_life_cycle"
  | "future_systems"
  | "future_science"
  | "future_field";

export type LearningJourneyStepStatus =
  | "locked"
  | "available"
  | "completed"
  | "mastered"
  | "coming_soon";

export type LearningJourneyActivityKind =
  | "discover"
  | "name"
  | "sound"
  | "match"
  | "lesson"
  | "seek"
  | "quiz_picture"
  | "quiz_colors"
  | "quiz_sound"
  | "quiz_true_false"
  | "quiz_memory"
  | "quiz_sort"
  | "quiz_sequence"
  | "quiz_drag"
  | "draw"
  | "conversation"
  | "challenge"
  | "mastery"
  | "future"
  | "count"
  | "senses"
  | "connection"
  | "grow";

export type LearningJourneyStepDef = {
  id: LearningJourneyStepId;
  title: string;
  subtitle: string;
  activityKind: LearningJourneyActivityKind;
  realm: LearningJourneyRealm;
  minAge?: number;
  parentCoachTitle?: string;
  parentCoachSubtitle?: string;
  xpKind: LessonXpKind;
};

export type LearningJourneyStep = Omit<
  LearningJourneyStepDef,
  "title" | "subtitle"
> & {
  title: string;
  subtitle: string;
  status: LearningJourneyStepStatus;
  order: number;
  ageLocked: boolean;
  /** Filled when realm is connection and neighbors exist. */
  connectionName?: string;
  connectionEmoji?: string;
  connectionNodeId?: string;
};

export type LearningJourneyNeighbor = {
  id: string;
  name: string;
  emoji: string;
};

export type LearningJourneyProgressInput = {
  discoveryTitle: string;
  childAge: number;
  discovered: boolean;
  completedSteps?: Partial<Record<LearningJourneyStepId, boolean>>;
  heardPronunciation?: boolean;
  watchedVideo?: boolean;
  completedMatch?: boolean;
  learnedParts?: boolean;
  learnedWhy?: boolean;
  foundThree?: boolean;
  completedPictureQuiz?: boolean;
  completedColorsQuiz?: boolean;
  completedSoundQuiz?: boolean;
  completedTrueFalseQuiz?: boolean;
  completedQuiz?: boolean;
  completedDraw?: boolean;
  completedCoachPrompts?: boolean;
  taughtSomeone?: boolean;
  completedChallenge?: boolean;
  masteryScore?: number;
  futureCompletions?: Partial<Record<LearningJourneyStepId, boolean>>;
  /** Graph neighbors — expand the journey into the wider world. */
  neighbors?: LearningJourneyNeighbor[];
  features: Pick<
    LearningModeFeatures,
    | "quizzes"
    | "conversationPrompts"
    | "matching"
    | "challenges"
    | "projects"
    | "research"
  >;
};

/**
 * Canonical endless path — digital and real-world interleaved.
 * Titles use `{name}` and optional `{connection}` for neighbor missions.
 */
export const LEARNING_JOURNEY_PATH: LearningJourneyStepDef[] = [
  {
    id: "discover",
    title: "Meet a {name}",
    subtitle: "Find it in the real world",
    activityKind: "discover",
    realm: "real_world",
    xpKind: "real_world",
  },
  {
    id: "learn_name",
    title: "Learn the Name",
    subtitle: "See it, hear it, say it",
    activityKind: "name",
    realm: "digital",
    xpKind: "digital",
  },
  {
    id: "hear_pronunciation",
    title: "Hear the Name",
    subtitle: "Listen and say it aloud",
    activityKind: "sound",
    realm: "digital",
    xpKind: "digital",
  },
  {
    id: "quiz_colors",
    title: "{name} Colors",
    subtitle: "What color do you see?",
    activityKind: "quiz_colors",
    realm: "digital",
    xpKind: "digital",
    minAge: 3,
    parentCoachTitle: "Name the Colors",
    parentCoachSubtitle: "Describe what you see together",
  },
  {
    id: "match_picture",
    title: "Match the Picture",
    subtitle: "Tap the matching picture",
    activityKind: "match",
    realm: "digital",
    xpKind: "digital",
  },
  {
    id: "learn_parts",
    title: "{name} Parts",
    subtitle: "Notice what makes it special",
    activityKind: "lesson",
    realm: "digital",
    xpKind: "digital",
    minAge: 4,
  },
  {
    id: "find_another",
    title: "Find Another {name}",
    subtitle: "A real-world treasure hunt",
    activityKind: "seek",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 3,
  },
  {
    id: "count_three",
    title: "Count Three",
    subtitle: "Find and count in the real world",
    activityKind: "count",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 4,
  },
  {
    id: "learn_why",
    title: "Why It Matters",
    subtitle: "How it connects to the living world",
    activityKind: "lesson",
    realm: "digital",
    xpKind: "digital",
    minAge: 4,
  },
  {
    id: "connection_mission",
    title: "{connection} Mission",
    subtitle: "Follow the connection to a related discovery",
    activityKind: "connection",
    realm: "connection",
    xpKind: "connection",
    minAge: 4,
  },
  {
    id: "smell_touch",
    title: "Sense It",
    subtitle: "Gently touch, smell, or listen outside",
    activityKind: "senses",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 4,
  },
  {
    id: "find_three",
    title: "Find a Different Color",
    subtitle: "Compare colors in the real world",
    activityKind: "seek",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 4,
  },
  {
    id: "quiz_picture",
    title: "Picture Challenge",
    subtitle: "Match pictures to names",
    activityKind: "quiz_picture",
    realm: "digital",
    xpKind: "digital",
    minAge: 4,
    parentCoachTitle: "Talk About the Picture",
    parentCoachSubtitle: "You lead — Family AI coaches you",
  },
  {
    id: "quiz_sound",
    title: "Sound Challenge",
    subtitle: "Hear it and know it",
    activityKind: "quiz_sound",
    realm: "digital",
    xpKind: "digital",
    minAge: 5,
  },
  {
    id: "quiz_true_false",
    title: "Memory Challenge",
    subtitle: "Check what you remember",
    activityKind: "quiz_true_false",
    realm: "digital",
    xpKind: "digital",
    minAge: 5,
  },
  {
    id: "come_back",
    title: "Come Back Tomorrow",
    subtitle: "Watch how it changes over time",
    activityKind: "grow",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 5,
  },
  {
    id: "draw",
    title: "Draw Your Favorite",
    subtitle: "Make your own picture of it",
    activityKind: "draw",
    realm: "digital",
    xpKind: "digital",
    minAge: 5,
  },
  {
    id: "conversation",
    title: "Teach Someone",
    subtitle: "Tell a grown-up what you learned",
    activityKind: "conversation",
    realm: "digital",
    xpKind: "digital",
    minAge: 4,
  },
  {
    id: "plant_seed",
    title: "Plant a Seed",
    subtitle: "A growing real-world project",
    activityKind: "grow",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 6,
  },
  {
    id: "watch_grow",
    title: "Watch It Grow",
    subtitle: "Return and notice what changed",
    activityKind: "grow",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 6,
  },
  {
    id: "mastery",
    title: "Master Explorer",
    subtitle: "Keep exploring — mastery deepens over years",
    activityKind: "mastery",
    realm: "connection",
    xpKind: "mastery",
    minAge: 5,
  },
  {
    id: "future_life_cycle",
    title: "Life Cycle of a {name}",
    subtitle: "How it grows and changes",
    activityKind: "future",
    realm: "digital",
    xpKind: "digital",
    minAge: 8,
  },
  {
    id: "future_systems",
    title: "How Systems Connect",
    subtitle: "Where this fits in a bigger picture",
    activityKind: "future",
    realm: "connection",
    xpKind: "connection",
    minAge: 10,
  },
  {
    id: "future_science",
    title: "Science of a {name}",
    subtitle: "Deeper concepts for curious minds",
    activityKind: "future",
    realm: "digital",
    xpKind: "digital",
    minAge: 12,
  },
  {
    id: "future_field",
    title: "Field Study",
    subtitle: "Observe, record, and explain like a scientist",
    activityKind: "future",
    realm: "real_world",
    xpKind: "real_world",
    minAge: 15,
  },
];

function fillName(template: string, name: string, connection?: string): string {
  return template
    .replaceAll("{name}", name)
    .replaceAll("{connection}", connection ?? "Related Wonder");
}

function isQuizStep(id: LearningJourneyStepId): boolean {
  return (
    id === "quiz_picture" ||
    id === "quiz_colors" ||
    id === "quiz_sound" ||
    id === "quiz_true_false"
  );
}

function isStepComplete(
  id: LearningJourneyStepId,
  input: LearningJourneyProgressInput,
  useCoach: boolean,
): boolean {
  if (input.completedSteps?.[id]) return true;

  switch (id) {
    case "discover":
      return input.discovered;
    case "learn_name":
    case "find_another":
    case "count_three":
    case "smell_touch":
    case "come_back":
    case "plant_seed":
    case "watch_grow":
    case "connection_mission":
      return false;
    case "hear_pronunciation":
      return !!input.heardPronunciation || !!input.watchedVideo;
    case "match_picture":
      if (!input.features.matching) {
        return isStepComplete("hear_pronunciation", input, useCoach);
      }
      return !!input.completedMatch;
    case "learn_parts":
      return !!input.learnedParts;
    case "learn_why":
      return !!input.learnedWhy;
    case "find_three":
      return !!input.foundThree;
    case "quiz_picture":
      if (useCoach) {
        return !!input.completedCoachPrompts || !!input.completedPictureQuiz;
      }
      return !!input.completedPictureQuiz;
    case "quiz_colors":
      if (useCoach) {
        return !!input.completedCoachPrompts || !!input.completedColorsQuiz;
      }
      return !!input.completedColorsQuiz;
    case "quiz_sound":
      return !!input.completedSoundQuiz;
    case "quiz_true_false":
      return !!input.completedTrueFalseQuiz;
    case "draw":
      return !!input.completedDraw;
    case "conversation":
      return !!input.taughtSomeone || !!input.completedCoachPrompts;
    case "mastery":
      return (input.masteryScore ?? 0) >= 75;
    case "future_life_cycle":
    case "future_systems":
    case "future_science":
    case "future_field":
      return !!input.futureCompletions?.[id];
  }
}

function shouldIncludeStep(
  def: LearningJourneyStepDef,
  input: LearningJourneyProgressInput,
  useCoach: boolean,
): boolean {
  if (isQuizStep(def.id) && !input.features.quizzes && !useCoach) {
    return false;
  }
  if (def.id === "quiz_sound" && !input.features.quizzes) return false;
  if (def.id === "quiz_true_false" && !input.features.quizzes) return false;
  if (def.id === "draw" && !input.features.projects && input.childAge < 5) {
    return false;
  }
  if (
    def.id === "connection_mission" &&
    (!input.neighbors || input.neighbors.length === 0)
  ) {
    return false;
  }
  if (def.activityKind === "future") {
    return true;
  }
  return true;
}

export function buildLearningJourneyPath(
  input: LearningJourneyProgressInput,
): LearningJourneyStep[] {
  const useCoach =
    input.features.conversationPrompts && !input.features.quizzes;
  const name = input.discoveryTitle;
  const neighbor = input.neighbors?.[0];

  const defs = LEARNING_JOURNEY_PATH.filter((def) =>
    shouldIncludeStep(def, input, useCoach),
  );

  let unlocked = true;
  return defs.map((def, order) => {
    const ageLocked = def.minAge != null && input.childAge < def.minAge;
    const done = !ageLocked && isStepComplete(def.id, input, useCoach);

    let status: LearningJourneyStepStatus;
    if (ageLocked) {
      status = "coming_soon";
    } else if (def.id === "mastery" && done) {
      status = "mastered";
    } else if (done) {
      status = "completed";
    } else if (unlocked) {
      status = "available";
    } else {
      status = "locked";
    }

    if (ageLocked) {
      unlocked = false;
    } else if (!done) {
      unlocked = false;
    }

    let title = fillName(def.title, name, neighbor?.name);
    let subtitle = fillName(def.subtitle, name, neighbor?.name);
    let activityKind = def.activityKind;

    if (isQuizStep(def.id) && useCoach && def.parentCoachTitle) {
      title = fillName(def.parentCoachTitle, name);
      subtitle = fillName(def.parentCoachSubtitle ?? def.subtitle, name);
      activityKind = "conversation";
    }

    if (ageLocked && def.minAge != null) {
      subtitle = `Unlocks around age ${def.minAge} · ${subtitle}`;
    }

    return {
      ...def,
      title,
      subtitle,
      activityKind,
      status,
      order,
      ageLocked,
      connectionName: neighbor?.name,
      connectionEmoji: neighbor?.emoji,
      connectionNodeId: neighbor?.id,
    };
  });
}

export function learningJourneySummary(steps: LearningJourneyStep[]): {
  completed: number;
  total: number;
  availableNow: number;
  current: LearningJourneyStep | null;
  progress: number;
} {
  const active = steps.filter((s) => s.status !== "coming_soon");
  const completed = active.filter(
    (s) => s.status === "completed" || s.status === "mastered",
  ).length;
  const current =
    steps.find((s) => s.status === "available") ??
    steps.find((s) => s.status === "mastered") ??
    null;
  const availableNow = active.length;
  const progress = availableNow === 0 ? 0 : completed / availableNow;
  return {
    completed,
    total: steps.length,
    availableNow,
    current,
    progress,
  };
}

export function nextLearningJourneyLesson(
  steps: LearningJourneyStep[],
): LearningJourneyStep | null {
  return (
    steps.find((s) => s.status === "available") ??
    steps.find((s) => s.status === "coming_soon") ??
    steps.find((s) => s.status === "mastered") ??
    null
  );
}
