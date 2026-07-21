/**
 * Reusable Adventure Journey — structured real-world progression per discovery.
 *
 * Same idea as the Learning Journey: sequential unlocks, never finished.
 * Family AI / adventure board fill concrete quests; this path is the skeleton.
 */

export type AdventureJourneyStepId =
  | "find_one"
  | "find_colors"
  | "visit_place"
  | "meet_helper"
  | "find_related"
  | "learn_process"
  | "make_or_plant"
  | "care_for_it"
  | "watch_grow"
  | "complete_adventure";

export type AdventureJourneyStepStatus =
  | "locked"
  | "available"
  | "completed"
  | "mastered";

export type AdventureJourneyStepDef = {
  id: AdventureJourneyStepId;
  title: string;
  subtitle: string;
};

export type AdventureJourneyStep = AdventureJourneyStepDef & {
  status: AdventureJourneyStepStatus;
  order: number;
};

export type AdventureJourneyProgressInput = {
  discoveryTitle: string;
  discovered: boolean;
  foundOne?: boolean;
  foundColors?: boolean;
  visitedPlace?: boolean;
  metHelper?: boolean;
  foundRelated?: boolean;
  learnedProcess?: boolean;
  madeOrPlanted?: boolean;
  caredForIt?: boolean;
  watchedGrow?: boolean;
  adventureCompleted?: boolean;
  /** How many adventures for this discovery are completed (0+). */
  completedAdventureCount?: number;
  /** How many adventures are in progress. */
  inProgressAdventureCount?: number;
};

/**
 * Canonical adventure path — `{name}` filled at build time.
 */
export const ADVENTURE_JOURNEY_PATH: AdventureJourneyStepDef[] = [
  {
    id: "find_one",
    title: "Find One {name}",
    subtitle: "Spot it again in the real world",
  },
  {
    id: "find_colors",
    title: "Find Three Colors",
    subtitle: "Notice variety out in the world",
  },
  {
    id: "visit_place",
    title: "Visit a Place It Lives",
    subtitle: "A garden, park, station, or habitat",
  },
  {
    id: "meet_helper",
    title: "Meet a Helper",
    subtitle: "Who helps care for or work with it?",
  },
  {
    id: "find_related",
    title: "Find Something Related",
    subtitle: "A friend, tool, or neighbor in nature",
  },
  {
    id: "learn_process",
    title: "Learn How It Works",
    subtitle: "A simple real-world process",
  },
  {
    id: "make_or_plant",
    title: "Make or Plant One",
    subtitle: "Create, plant, or build together",
  },
  {
    id: "care_for_it",
    title: "Care for It",
    subtitle: "Water, tend, or check in",
  },
  {
    id: "watch_grow",
    title: "Watch It Grow",
    subtitle: "Come back and notice what changed",
  },
  {
    id: "complete_adventure",
    title: "Complete {name} Adventure",
    subtitle: "Celebrate — then start the next loop",
  },
];

function fillName(template: string, name: string): string {
  return template.replaceAll("{name}", name);
}

function isStepComplete(
  id: AdventureJourneyStepId,
  input: AdventureJourneyProgressInput,
): boolean {
  const completedCount = input.completedAdventureCount ?? 0;
  switch (id) {
    case "find_one":
      return !!input.foundOne || input.discovered;
    case "find_colors":
      return !!input.foundColors || completedCount >= 1;
    case "visit_place":
      return !!input.visitedPlace || completedCount >= 1;
    case "meet_helper":
      return !!input.metHelper || completedCount >= 2;
    case "find_related":
      return !!input.foundRelated || completedCount >= 2;
    case "learn_process":
      return !!input.learnedProcess || completedCount >= 3;
    case "make_or_plant":
      return !!input.madeOrPlanted;
    case "care_for_it":
      return !!input.caredForIt;
    case "watch_grow":
      return !!input.watchedGrow;
    case "complete_adventure":
      return !!input.adventureCompleted || completedCount >= 4;
  }
}

export function buildAdventureJourneyPath(
  input: AdventureJourneyProgressInput,
): AdventureJourneyStep[] {
  const name = input.discoveryTitle;
  let unlocked = true;

  return ADVENTURE_JOURNEY_PATH.map((def, order) => {
    const done = isStepComplete(def.id, input);
    let status: AdventureJourneyStepStatus;
    if (def.id === "complete_adventure" && done) {
      status = "mastered";
    } else if (done) {
      status = "completed";
    } else if (unlocked) {
      status = "available";
    } else {
      status = "locked";
    }
    if (!done) unlocked = false;

    return {
      ...def,
      title: fillName(def.title, name),
      subtitle: fillName(def.subtitle, name),
      status,
      order,
    };
  });
}

export function adventureJourneySummary(steps: AdventureJourneyStep[]): {
  completed: number;
  total: number;
  current: AdventureJourneyStep | null;
  progress: number;
} {
  const completed = steps.filter(
    (s) => s.status === "completed" || s.status === "mastered",
  ).length;
  const current =
    steps.find((s) => s.status === "available") ??
    steps.find((s) => s.status === "mastered") ??
    null;
  return {
    completed,
    total: steps.length,
    current,
    progress: steps.length === 0 ? 0 : completed / steps.length,
  };
}

export function nextAdventureJourneyStep(
  steps: AdventureJourneyStep[],
): AdventureJourneyStep | null {
  return (
    steps.find((s) => s.status === "available") ??
    steps.find((s) => s.status === "mastered") ??
    null
  );
}
