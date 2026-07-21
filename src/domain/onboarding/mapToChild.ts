import type {
  ChildGoal,
  CreateChildNodeInput,
  LearningPreference,
} from "@/intelligence/types/child";
import type {
  HomeLanguageChoice,
  InterestId,
  LearningStyleId,
  OnboardingDraft,
  ParentGoalId,
} from "@/domain/onboarding/types";
import {
  INTEREST_OPTIONS,
  PARENT_GOAL_OPTIONS,
} from "@/domain/onboarding/types";
import { learningLevelForAge } from "@/intelligence/types/progression";

function ageFromBirthdate(iso: string, now = new Date()): number {
  const birth = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return 5;
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && now.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return Math.max(0, Math.min(17, age));
}

/** Delegates to canonical progression mapping. */
export function levelFromAge(age: number): number {
  return learningLevelForAge(age);
}

function languagesFromChoice(
  choice: HomeLanguageChoice | null,
): { languages: string[]; learningLanguages: string[]; spanishEnabled: boolean } {
  switch (choice) {
    case "spanish":
      return {
        languages: ["es"],
        learningLanguages: ["es"],
        spanishEnabled: true,
      };
    case "multiple":
      return {
        languages: ["en", "es"],
        learningLanguages: ["es"],
        spanishEnabled: true,
      };
    case "english":
    default:
      return {
        languages: ["en"],
        learningLanguages: [],
        spanishEnabled: false,
      };
  }
}

function categoryLabel(id: InterestId): string {
  return INTEREST_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

function goalTitle(id: ParentGoalId): string {
  return PARENT_GOAL_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

function preferencesFromStyles(
  styles: LearningStyleId[],
): LearningPreference[] {
  const modalityFor: Record<
    LearningStyleId,
    LearningPreference["modality"]
  > = {
    pictures: "visual",
    videos: "visual",
    movement: "kinesthetic",
    stories: "story",
    music: "audio",
    hands_on: "kinesthetic",
  };

  const strengths = new Map<LearningPreference["modality"], number>();
  for (const style of styles) {
    const modality = modalityFor[style];
    strengths.set(modality, (strengths.get(modality) ?? 0) + 1);
  }

  return [...strengths.entries()].map(([modality, strength]) => ({
    modality,
    strength,
  }));
}

function buildParentGoals(
  goalIds: ParentGoalId[],
  nowIso: string,
): ChildGoal[] {
  return goalIds.map((id) => ({
    id: `goal_${id}`,
    title: goalTitle(id),
    createdAt: nowIso,
    completedAt: null,
  }));
}

/**
 * Maps warm onboarding answers → Child Graph create/update input.
 */
export function mapOnboardingDraftToChild(
  draft: OnboardingDraft,
): CreateChildNodeInput {
  const nowIso = new Date().toISOString();
  const birthdate = draft.birthdate;
  const currentAge = birthdate ? ageFromBirthdate(birthdate) : 5;
  const language = languagesFromChoice(draft.homeLanguage);
  const parentGoals = buildParentGoals(draft.parentGoals, nowIso);
  const wantsSpanish =
    language.spanishEnabled || draft.parentGoals.includes("spanish");

  return {
    name: draft.childName.trim() || "Explorer",
    birthdate,
    currentAge,
    currentLevel: levelFromAge(currentAge),
    languages: language.languages,
    learningLanguages: wantsSpanish
      ? Array.from(new Set([...language.learningLanguages, "es"]))
      : language.learningLanguages,
    spanishEnabled: wantsSpanish,
    favoriteCategories: draft.interests.map(categoryLabel),
    learningPreferences: preferencesFromStyles(draft.learningStyles),
    parentGoals,
    goals: parentGoals,
    coExplorers: draft.coExplorers,
  };
}

export function ageFromBirthdateIso(iso: string | null): number {
  if (!iso) return 5;
  return ageFromBirthdate(iso);
}
