/**
 * Compatibility layer — FamilyAIProfile is the single source of truth.
 * These helpers project the structured Family AI profile for existing call sites.
 */

import type { CoExplorerRole } from "@/intelligence/types/child";
import type { LearningModeId } from "@/domain/learning/mode";
import type { FamilyAIProfile } from "@/domain/family/FamilyAIProfile";
import { familyAIProfileService } from "@/services/family/FamilyAIProfileService";

/** @deprecated Prefer FamilyAIProfile via getFamilyAIProfile() */
export type FamilyLearningProfile = {
  childId: string;
  name: string;
  age: number;
  birthdate: string | null;
  spanishEnabled: boolean;
  learningLanguages: string[];
  languages: string[];
  parentGoals: string[];
  favoriteCategories: string[];
  coExplorers: CoExplorerRole[];
  learningMode: LearningModeId;
  learningModeOverride: boolean;
  onboardingComplete: boolean;
};

/** @deprecated Prefer getFamilyAIProfile().childName */
export const DEMO_CHILD_NAME = "Explorer";
/** @deprecated Prefer getFamilyAIProfile().currentAge */
export const DEMO_CHILD_AGE = 5;
/** @deprecated Prefer getFamilyAIProfile().spanishEnabled */
export const DEMO_SPANISH_ENABLED = false;
/** @deprecated Prefer getFamilyAIProfile().parentGoals */
export const DEMO_PARENT_GOALS: string[] = [];

export type DemoLearningProfile = {
  name: string;
  age: number;
  spanishEnabled: boolean;
  learningLanguages: string[];
  parentGoals: string[];
  learningMode: LearningModeId;
  learningModeOverride: boolean;
};

function toLearningProfile(profile: FamilyAIProfile): FamilyLearningProfile {
  return {
    childId: profile.childId,
    name: profile.childName,
    age: profile.currentAge,
    birthdate: profile.birthdate,
    spanishEnabled: profile.spanishEnabled,
    learningLanguages: profile.learningLanguages,
    languages: profile.languages,
    parentGoals: profile.parentGoals,
    favoriteCategories: profile.interests,
    coExplorers: profile.coExplorers,
    learningMode: profile.learningMode,
    learningModeOverride: profile.learningModeOverride,
    onboardingComplete: profile.onboardingComplete,
  };
}

export function getFamilyAIProfile(): FamilyAIProfile {
  return familyAIProfileService.get();
}

export function getLearningProfile(): FamilyLearningProfile {
  return toLearningProfile(familyAIProfileService.get());
}

export function setLearningProfile(
  patch: Partial<FamilyLearningProfile>,
): FamilyLearningProfile {
  familyAIProfileService.update({
    childId: patch.childId,
    childName: patch.name,
    currentAge: patch.age,
    birthdate: patch.birthdate,
    spanishEnabled: patch.spanishEnabled,
    learningLanguages: patch.learningLanguages,
    languages: patch.languages,
    parentGoals: patch.parentGoals,
    interests: patch.favoriteCategories,
    coExplorers: patch.coExplorers,
    learningMode: patch.learningMode,
    learningModeOverride: patch.learningModeOverride,
    onboardingComplete: patch.onboardingComplete,
  });
  return getLearningProfile();
}

export function setLearningMode(
  mode: LearningModeId,
  options: { override?: boolean } = {},
): FamilyLearningProfile {
  familyAIProfileService.setLearningMode(mode, options);
  return getLearningProfile();
}

export function resolveLearningMode(
  profile: FamilyLearningProfile = getLearningProfile(),
): LearningModeId {
  if (profile.learningModeOverride) return profile.learningMode;
  return familyAIProfileService.resolveLearningMode();
}

export function hasCompletedOnboarding(): boolean {
  return familyAIProfileService.hasCompletedOnboarding();
}

export function subscribeLearningProfile(
  listener: (profile: FamilyLearningProfile) => void,
): () => void {
  return familyAIProfileService.subscribe((profile) => {
    listener(toLearningProfile(profile));
  });
}

export function resetLearningProfileForTests(): void {
  familyAIProfileService.resetForTests();
}

export function getDemoLearningProfile(): DemoLearningProfile {
  const profile = familyAIProfileService.get();
  return {
    name: profile.childName,
    age: profile.currentAge,
    spanishEnabled: profile.spanishEnabled,
    learningLanguages: profile.learningLanguages,
    parentGoals: profile.parentGoals,
    learningMode: familyAIProfileService.resolveLearningMode(),
    learningModeOverride: profile.learningModeOverride,
  };
}
