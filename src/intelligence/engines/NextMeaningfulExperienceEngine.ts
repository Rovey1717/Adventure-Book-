/**
 * Next Meaningful Experience Engine
 *
 * Answers: "What is the next meaningful thing for this child to experience?"
 * Never recommends random content — every pick is grounded in profile + context.
 */

import {
  featuresForMode,
  type LearningModeFeatures,
  type LearningModeId,
} from "@/domain/learning/mode";
import { featuresForChild } from "@/domain/learning/developmentalFeatures";
import { parentCoachStartersFor } from "@/domain/learning/parentCoach";
import type {
  NextMeaningfulExperience,
  NextMeaningfulExperienceInput,
  ReasonedRecommendation,
} from "@/domain/family/nextMeaningfulExperience";

const INTEREST_SEEKS: Record<string, string[]> = {
  Vehicles: ["Ambulance", "Police Car", "School Bus", "Train"],
  Animals: ["Dog", "Cat", "Bird", "Turtle"],
  Nature: ["Tree", "Flower", "Rainbow", "Rock"],
  Construction: ["Excavator", "Crane", "Dump Truck"],
  Ocean: ["Boat", "Shell", "Fish"],
  Insects: ["Bee", "Butterfly"],
};

export class NextMeaningfulExperienceEngine {
  /**
   * Compute the next meaningful experience from structured Family AI inputs.
   * Returns null only when there is truly no grounded path (should be rare).
   */
  recommend(
    input: NextMeaningfulExperienceInput,
  ): NextMeaningfulExperience {
    const features: LearningModeFeatures =
      input.learningModeFeatures ?? featuresForMode(input.learningMode);
    const discovered = new Set(
      [...input.previousDiscoveries, ...input.previousMemories]
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean),
    );
    if (input.currentDiscovery) {
      discovered.add(input.currentDiscovery.trim().toLowerCase());
    }

    const discovery = pickDiscovery(input, discovered);
    const learning = pickLearningActivity(input, discovery, features);
    const adventure = pickAdventure(input, discovery);
    const conversation = pickConversation(input, discovery, features);
    const realWorld = pickRealWorld(input, discovery);

    return {
      question:
        "What is the next meaningful thing for this child to experience?",
      childName: input.childName,
      age: input.age,
      learningMode: input.learningMode,
      currentDiscovery: input.currentDiscovery?.trim() || null,
      recommendedDiscovery: discovery,
      recommendedLearningActivity: learning,
      recommendedAdventure: adventure,
      recommendedConversation: conversation,
      recommendedRealWorldExperience: realWorld,
    };
  }
}

function pickDiscovery(
  input: NextMeaningfulExperienceInput,
  discovered: Set<string>,
): ReasonedRecommendation {
  // 1) Profile's potential future discoveries (already grounded)
  const futures = [...(input.potentialFutureDiscoveries ?? [])].sort(
    (a, b) => b.score - a.score,
  );
  for (const future of futures) {
    if (discovered.has(future.name.toLowerCase())) continue;
    return {
      title: future.name,
      detail: `Look for a real-world ${future.name}`,
      reason: future.reason,
      reasonCodes: ["profile_future", future.source],
      score: future.score,
    };
  }

  // 2) Collection gaps (Community Helpers remaining, etc.)
  for (const collection of input.collectionRemaining ?? []) {
    const nextName = collection.remaining.find(
      (name) => !discovered.has(name.toLowerCase()),
    );
    if (!nextName) continue;
    return {
      title: nextName,
      detail: `Find a ${nextName} to grow ${collection.collectionTitle}`,
      reason: `${input.childName} is building the ${collection.collectionTitle} collection — ${nextName} is still missing.`,
      reasonCodes: ["collection_gap", collection.collectionTitle],
      score: 4,
    };
  }

  // 3) Related to current discovery (same family / helpers)
  if (input.currentDiscovery) {
    const related = relatedTo(input.currentDiscovery).find(
      (name) => !discovered.has(name.toLowerCase()),
    );
    if (related) {
      return {
        title: related,
        detail: `Discover a ${related} next`,
        reason: `${related} connects meaningfully to ${input.currentDiscovery} — not a random topic.`,
        reasonCodes: ["related_to_current", input.currentDiscovery],
        score: 3.5,
      };
    }
  }

  // 4) Top interest category (from onboarding / discovery boosts)
  const topInterest =
    input.interestScores?.[0]?.category ?? input.interests[0] ?? null;
  if (topInterest) {
    const candidate = (INTEREST_SEEKS[topInterest] ?? []).find(
      (name) => !discovered.has(name.toLowerCase()),
    );
    if (candidate) {
      return {
        title: candidate,
        detail: `Seek a ${candidate} in the real world`,
        reason: `${input.childName} shows growing interest in ${topInterest}.`,
        reasonCodes: ["interest_match", topInterest],
        score: 3,
      };
    }
  }

  // 5) Parent goal — still grounded, never encyclopedia roulette
  const goal = input.parentGoals[0];
  if (goal) {
    const goalDiscovery = discoveryForParentGoal(goal, discovered);
    if (goalDiscovery) {
      return {
        title: goalDiscovery.name,
        detail: goalDiscovery.detail,
        reason: `Parent goal “${goal}” suggests ${goalDiscovery.name} as a meaningful next step.`,
        reasonCodes: ["parent_goal", goal],
        score: 2.5,
      };
    }
  }

  // 6) Age-safe revisit of current discovery (deepen, don't randomize)
  if (input.currentDiscovery) {
    return {
      title: input.currentDiscovery,
      detail: `Notice something new about the ${input.currentDiscovery}`,
      reason: `Revisit ${input.currentDiscovery} to deepen mastery before branching out.`,
      reasonCodes: ["deepen_current"],
      score: 2,
    };
  }

  // Absolute last resort — still explained, never a random catalog pick
  return {
    title: "Something wonderful nearby",
    detail: "Capture whatever your child is curious about right now",
    reason: `No prior discoveries yet — start with ${input.childName}'s live curiosity (age ${input.age}).`,
    reasonCodes: ["first_discovery_curiosity"],
    score: 1,
  };
}

function pickLearningActivity(
  input: NextMeaningfulExperienceInput,
  discovery: ReasonedRecommendation,
  features: ReturnType<typeof featuresForMode>,
): ReasonedRecommendation {
  const anchor = input.currentDiscovery?.trim() || discovery.title;
  const mode = input.learningMode;

  if (features.conversationPrompts && !features.quizzes) {
    const starter =
      parentCoachStartersFor(anchor).starters[0] ??
      `Ask your child what they notice about the ${anchor}.`;
    return {
      title: "Parent coaching",
      detail: starter,
      reason: `Parent Guided — Family AI coaches you how to teach about ${anchor}, never quizzes the child directly.`,
      reasonCodes: ["mode_parent_guided", "parent_coach"],
      score: 4,
    };
  }

  if (features.projects) {
    return {
      title: `${anchor} project`,
      detail: `Observe, sketch three parts, and explain how ${anchor} helps people`,
      reason: `Projects unlock as explorers grow — still tied to ${anchor}.`,
      reasonCodes: ["developmental_projects", "project"],
      score: 4,
    };
  }

  if (features.storyCreation) {
    return {
      title: "Story creation",
      detail: `Create a short story that includes a ${anchor}`,
      reason: `Story creation grows in with independence — anchored to ${anchor}.`,
      reasonCodes: ["developmental_story", "story"],
      score: 3.9,
    };
  }

  if (features.research || features.criticalThinking) {
    return {
      title: "Investigate",
      detail: `How does a ${anchor} help your community?`,
      reason: `Research and critical thinking unlock gradually for deeper work on ${anchor}.`,
      reasonCodes: ["developmental_research", "research"],
      score: 3.8,
    };
  }

  if (features.matching) {
    return {
      title: "Match & name",
      detail: `Match helpers and jobs connected to ${anchor}`,
      reason: `Matching grows in during the guided explorer years for ${anchor}.`,
      reasonCodes: ["developmental_matching", "matching"],
      score: 3.6,
    };
  }

  if (features.quizzes) {
    return {
      title: "Mini quiz",
      detail: `Who uses a ${anchor} and why?`,
      reason: `Quizzes appear gradually as parent prompts taper — still about ${anchor}.`,
      reasonCodes: ["developmental_quiz", "quiz"],
      score: 3.5,
    };
  }

  if (features.challenges) {
    return {
      title: "Challenge",
      detail: `Point to, count, or find something related to ${anchor}`,
      reason: `Challenges unlock as independence grows around ${anchor}.`,
      reasonCodes: ["developmental_challenge", "challenge"],
      score: 3.4,
    };
  }

  if (features.reading) {
    return {
      title: "Read together",
      detail: `Read one short fact about ${anchor}`,
      reason: `Reading unlocks gradually and stays about ${anchor}.`,
      reasonCodes: ["developmental_reading", anchor],
      score: 3.2,
    };
  }

  return {
    title: "Wonder together",
    detail: `What do you notice about the ${anchor}?`,
    reason: `Default wonder activity stays anchored to ${anchor} for ${input.childName}.`,
    reasonCodes: ["wonder", mode],
    score: 2.5,
  };
}

function pickAdventure(
  input: NextMeaningfulExperienceInput,
  discovery: ReasonedRecommendation,
): ReasonedRecommendation {
  const options = input.adventureOptions ?? [];
  const inProgress = options.find((item) => item.status === "in_progress");
  if (inProgress) {
    return {
      title: inProgress.title,
      detail: `Continue ${inProgress.title}`,
      reason: `${input.childName} already started this adventure — finishing it is more meaningful than starting something new.`,
      reasonCodes: ["continue_in_progress", inProgress.objectName],
      score: 5,
    };
  }

  const unlocked = options.find(
    (item) =>
      item.status === "unlocked" &&
      (!input.currentDiscovery ||
        item.objectName.toLowerCase() ===
          input.currentDiscovery.toLowerCase()),
  );
  if (unlocked) {
    return {
      title: unlocked.title,
      detail: `Start ${unlocked.title}`,
      reason: `Unlocked from ${unlocked.objectName} — adventures only come from real discoveries.`,
      reasonCodes: ["unlocked_from_discovery", unlocked.objectName],
      score: 4.5,
    };
  }

  const anyUnlocked = options.find((item) => item.status === "unlocked");
  if (anyUnlocked) {
    return {
      title: anyUnlocked.title,
      detail: `Start ${anyUnlocked.title}`,
      reason: `This adventure was unlocked from a real discovery (${anyUnlocked.objectName}).`,
      reasonCodes: ["unlocked_adventure", anyUnlocked.objectName],
      score: 4,
    };
  }

  if (input.currentAdventure) {
    return {
      title: input.currentAdventure,
      detail: `Keep going with ${input.currentAdventure}`,
      reason: `Current adventure context points to ${input.currentAdventure}.`,
      reasonCodes: ["current_adventure"],
      score: 3.5,
    };
  }

  return {
    title: `${discovery.title} Adventure`,
    detail: `Unlock an adventure by capturing a ${discovery.title}`,
    reason: `No adventure is open yet — the next meaningful unlock comes from discovering ${discovery.title}.`,
    reasonCodes: ["adventure_awaits_discovery", discovery.title],
    score: 2.5,
  };
}

function pickConversation(
  input: NextMeaningfulExperienceInput,
  discovery: ReasonedRecommendation,
  features: ReturnType<typeof featuresForMode>,
): ReasonedRecommendation {
  const anchor = input.currentDiscovery?.trim() || discovery.title;
  const coach = parentCoachStartersFor(anchor);
  const prompt =
    coach.starters[0] ??
    `Ask your child what they notice about the ${anchor}.`;

  if (features.aiConversations) {
    return {
      title: "Explorer conversation",
      detail: `Ask: “How does a ${anchor} help people near us?”`,
      reason: `Independent Explorer mode supports deeper AI-style conversations about ${anchor}.`,
      reasonCodes: ["ai_conversation", anchor],
      score: 4,
    };
  }

  if (features.conversationPrompts) {
    return {
      title: "Conversation starters",
      detail: prompt,
      reason: `Parent Guided — coach the parent with starters about ${anchor}; facilitate connection, don’t replace it.`,
      reasonCodes: ["parent_coach", anchor],
      score: 4.5,
    };
  }

  const goal = input.parentGoals.find((item) =>
    /kind|curios|spanish|read|stem|natur|creat|confiden|problem/i.test(item),
  );
  if (goal) {
    return {
      title: "Goal-aligned talk",
      detail: conversationForGoal(goal, anchor),
      reason: `Parent goal “${goal}” shapes this conversation about ${anchor}.`,
      reasonCodes: ["parent_goal_conversation", goal],
      score: 3.8,
    };
  }

  return {
    title: "Wonder question",
    detail: `Why do we need a ${anchor}?`,
    reason: `Conversation stays about ${anchor} — the current (or next) discovery.`,
    reasonCodes: ["wonder_conversation", anchor],
    score: 3,
  };
}

function pickRealWorld(
  input: NextMeaningfulExperienceInput,
  discovery: ReasonedRecommendation,
): ReasonedRecommendation {
  const anchor = input.currentDiscovery?.trim() || discovery.title;

  for (const collection of input.collectionRemaining ?? []) {
    const missing = collection.remaining[0];
    if (!missing) continue;
    return {
      title: `Find a ${missing}`,
      detail: `On your next walk, look for a real ${missing}`,
      reason: `Completing ${collection.collectionTitle} makes the next find meaningful — ${missing} is still missing.`,
      reasonCodes: ["real_world_collection", collection.collectionTitle],
      score: 4.5,
    };
  }

  if (input.currentDiscovery) {
    return {
      title: `Seek another ${input.currentDiscovery}`,
      detail: `Find another ${input.currentDiscovery} or a helper connected to it`,
      reason: `Repeating ${input.currentDiscovery} in the real world builds mastery for ${input.childName}.`,
      reasonCodes: ["real_world_repeat", input.currentDiscovery],
      score: 4,
    };
  }

  return {
    title: `Look for a ${discovery.title}`,
    detail: `Capture a real-world ${discovery.title} when you spot one`,
    reason: discovery.reason,
    reasonCodes: ["real_world_next_discovery", ...discovery.reasonCodes],
    score: discovery.score,
  };
}

function relatedTo(name: string): string[] {
  const key = name.toLowerCase();
  if (key.includes("fire")) {
    return ["Ambulance", "Police Car", "Firefighter", "Fire Station"];
  }
  if (key.includes("ambulance")) {
    return ["Fire Truck", "Hospital", "Doctor"];
  }
  if (key.includes("bee") || key.includes("butterfly")) {
    return ["Flower", "Bee", "Butterfly", "Hummingbird"];
  }
  if (key.includes("excavator") || key.includes("crane")) {
    return ["Dump Truck", "Bulldozer", "Crane", "Excavator"];
  }
  return [];
}

function discoveryForParentGoal(
  goal: string,
  discovered: Set<string>,
): { name: string; detail: string } | null {
  const g = goal.toLowerCase();
  const pick = (names: string[], detail: string) => {
    const name = names.find((item) => !discovered.has(item.toLowerCase()));
    return name ? { name, detail } : null;
  };
  if (g.includes("natur")) return pick(["Tree", "Flower", "Bee"], "Explore nature nearby");
  if (g.includes("stem") || g.includes("problem"))
    return pick(["Excavator", "Train", "Fire Truck"], "Explore how machines work");
  if (g.includes("kind"))
    return pick(["Ambulance", "Firefighter", "Dog"], "Notice helpers and kindness");
  if (g.includes("spanish"))
    return pick(["Fire Truck", "Dog", "Tree"], "Name a discovery in Spanish together");
  if (g.includes("read"))
    return pick(["Library", "Book", "Sign"], "Find letters and words in the world");
  if (g.includes("curios"))
    return pick(["Rainbow", "Rock", "Butterfly"], "Follow a spark of curiosity");
  return null;
}

function conversationForGoal(goal: string, anchor: string): string {
  const g = goal.toLowerCase();
  if (g.includes("kind")) return `Who does a ${anchor} help? How can we help too?`;
  if (g.includes("spanish")) return `How do we say ${anchor} in Spanish?`;
  if (g.includes("stem") || g.includes("problem"))
    return `What problem does a ${anchor} solve?`;
  if (g.includes("natur")) return `Where does a ${anchor} belong in nature?`;
  if (g.includes("read")) return `What letter does ${anchor} start with?`;
  if (g.includes("creat")) return `If we invented a new ${anchor}, what would it do?`;
  if (g.includes("confiden")) return `Can you teach me one thing about the ${anchor}?`;
  return `What makes the ${anchor} special to you?`;
}

export const nextMeaningfulExperienceEngine =
  new NextMeaningfulExperienceEngine();

/** Convenience for call sites that already have a FamilyAIProfile-shaped object. */
export function buildNextMeaningfulExperienceInput(profile: {
  childName: string;
  currentAge: number;
  learningMode: LearningModeId;
  learningModeOverride?: boolean;
  interests: string[];
  interestScores: Array<{ category: string; score: number }>;
  favoriteDiscoveries: string[];
  memoryHistory: Array<{ objectName: string }>;
  parentGoals: string[];
  collections: Array<{
    title: string;
    remaining: string[];
  }>;
  potentialFutureDiscoveries: Array<{
    name: string;
    reason: string;
    source: string;
    score: number;
  }>;
  adventureProgress: Array<{
    title: string;
    status: "unlocked" | "in_progress" | "completed";
    objectName: string;
  }>;
}, context: {
  currentDiscovery?: string | null;
  currentAdventure?: string | null;
} = {}): NextMeaningfulExperienceInput {
  return {
    childName: profile.childName,
    age: profile.currentAge,
    learningMode: profile.learningMode,
    interests: profile.interests,
    interestScores: profile.interestScores,
    previousDiscoveries: profile.favoriteDiscoveries,
    previousMemories: profile.memoryHistory.map((item) => item.objectName),
    parentGoals: profile.parentGoals,
    currentDiscovery: context.currentDiscovery ?? null,
    currentAdventure: context.currentAdventure ?? null,
    collectionRemaining: profile.collections.map((item) => ({
      collectionTitle: item.title,
      remaining: item.remaining,
    })),
    potentialFutureDiscoveries: profile.potentialFutureDiscoveries,
    adventureOptions: profile.adventureProgress,
    learningModeFeatures: featuresForChild({
      age: profile.currentAge,
      mode: profile.learningMode,
      modeOverride: profile.learningModeOverride ?? false,
    }),
  };
}
