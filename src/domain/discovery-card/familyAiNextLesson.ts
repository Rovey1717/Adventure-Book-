/**
 * Family AI — picks the ONE next lesson on a Discovery Learning Journey.
 *
 * Children almost never choose what comes next. Family AI keeps the loop flowing:
 * digital lesson ↔ real-world mission ↔ celebrate ↔ unlock ↔ continue.
 */

import type {
  LearningJourneyStep,
  LearningJourneyStepStatus,
} from "@/domain/discovery-card/learningJourneyPath";
import { nextLearningJourneyLesson } from "@/domain/discovery-card/learningJourneyPath";

export type FamilyAiNextLesson = {
  step: LearningJourneyStep;
  /** Parent/child facing reason — quiet guidance, never a quiz. */
  reason: string;
  /** Soft invitation copy for the primary CTA. */
  invitation: string;
};

export type FamilyAiNextLessonInput = {
  steps: LearningJourneyStep[];
  discoveryTitle: string;
  childName: string;
  childAge: number;
  /** Recent lesson ids completed on this discovery (newest last). */
  recentCompletedIds?: string[];
  /** Prefer real-world if the child has been digital-heavy. */
  preferRealWorld?: boolean;
};

function realmOf(step: LearningJourneyStep): "digital" | "real_world" | "connection" {
  if (step.realm === "real_world") return "real_world";
  if (step.realm === "connection") return "connection";
  return "digital";
}

function reasonFor(
  step: LearningJourneyStep,
  input: FamilyAiNextLessonInput,
): string {
  const name = input.discoveryTitle;
  const realm = realmOf(step);

  if (step.status === "coming_soon") {
    return `This opens as ${input.childName} grows — around age ${step.minAge ?? 8}.`;
  }

  if (realm === "real_world") {
    return `Time to explore a real ${name} — Adventure Book loves the outdoors.`;
  }
  if (realm === "connection") {
    return `Every discovery expands the world — a new connection is waiting.`;
  }
  if (step.activityKind === "name" || step.activityKind === "sound") {
    return `A tiny lesson to remember the ${name}.`;
  }
  if (step.activityKind.startsWith("quiz") || step.activityKind === "match") {
    return `A quick challenge to lock in what ${input.childName} just learned.`;
  }
  if (step.activityKind === "conversation") {
    return `Share the wonder — teaching someone makes learning stick.`;
  }
  return `Family AI chose this next step for ${input.childName}'s ${name} journey.`;
}

function invitationFor(step: LearningJourneyStep): string {
  const realm = realmOf(step);
  if (realm === "real_world") return "Start mission";
  if (realm === "connection") return "Follow the connection";
  if (step.activityKind.startsWith("quiz") || step.activityKind === "match") {
    return "Play challenge";
  }
  return "Start lesson";
}

/**
 * Family AI next lesson — usually the sequential unlock,
 * with light preference to alternate digital ↔ real-world when multiple are ready.
 */
export function familyAiNextLesson(
  input: FamilyAiNextLessonInput,
): FamilyAiNextLesson | null {
  const available = input.steps.filter((s) => s.status === "available");
  if (available.length === 0) {
    const fallback = nextLearningJourneyLesson(input.steps);
    if (!fallback) return null;
    return {
      step: fallback,
      reason: reasonFor(fallback, input),
      invitation: invitationFor(fallback),
    };
  }

  const recent = input.recentCompletedIds ?? [];
  const lastId = recent[recent.length - 1];
  const lastStep = input.steps.find((s) => s.id === lastId);
  const lastRealm = lastStep ? realmOf(lastStep) : null;

  let pick = available[0];

  // Alternate realms when Family AI has a choice among unlocked steps.
  if (available.length > 1 && lastRealm) {
    const opposite =
      lastRealm === "digital"
        ? available.find((s) => realmOf(s) === "real_world")
        : available.find((s) => realmOf(s) === "digital");
    if (opposite) pick = opposite;
  }

  if (input.preferRealWorld) {
    const mission = available.find((s) => realmOf(s) === "real_world");
    if (mission) pick = mission;
  }

  // Younger children: prefer shorter digital naming lessons first when both ready.
  if (input.childAge <= 3) {
    const gentle = available.find(
      (s) =>
        s.activityKind === "name" ||
        s.activityKind === "sound" ||
        s.activityKind === "discover",
    );
    if (gentle) pick = gentle;
  }

  return {
    step: pick,
    reason: reasonFor(pick, input),
    invitation: invitationFor(pick),
  };
}

export function statusLabel(status: LearningJourneyStepStatus): string {
  switch (status) {
    case "locked":
      return "Locked";
    case "available":
      return "Ready";
    case "completed":
      return "Done";
    case "mastered":
      return "Mastered";
    case "coming_soon":
      return "Growing into";
  }
}
