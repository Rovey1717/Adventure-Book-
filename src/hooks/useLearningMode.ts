import { useMemo, useSyncExternalStore } from "react";
import {
  definitionForMode,
  type LearningModeDefinition,
  type LearningModeId,
} from "@/domain/learning/mode";
import {
  featuresForChild,
  type DevelopmentalFeaturePlan,
} from "@/domain/learning/developmentalFeatures";
import type { FamilyLearningProfile } from "@/domain/parent/profile";
import { familyAIProfileService } from "@/services/family/FamilyAIProfileService";

export type LearningModeState = {
  mode: LearningModeId;
  definition: LearningModeDefinition;
  features: DevelopmentalFeaturePlan;
  profile: FamilyLearningProfile;
  setMode: (mode: LearningModeId, options?: { override?: boolean }) => void;
};

/**
 * Current learning mode + developmental features for the whole app.
 *
 * Snapshot MUST be referentially stable when the store is unchanged —
 * otherwise useSyncExternalStore infinite-loops (Maximum update depth).
 */
export function useLearningMode(): LearningModeState {
  const familyProfile = useSyncExternalStore(
    (listener) => familyAIProfileService.subscribe(listener),
    () => familyAIProfileService.get(),
    () => familyAIProfileService.get(),
  );

  const mode = familyAIProfileService.resolveLearningMode();
  const definition = definitionForMode(mode);
  const features = featuresForChild({
    age: familyProfile.currentAge,
    mode,
    modeOverride: familyProfile.learningModeOverride,
  });

  const profile = useMemo<FamilyLearningProfile>(
    () => ({
      childId: familyProfile.childId,
      name: familyProfile.childName,
      age: familyProfile.currentAge,
      birthdate: familyProfile.birthdate,
      spanishEnabled: familyProfile.spanishEnabled,
      learningLanguages: familyProfile.learningLanguages,
      languages: familyProfile.languages,
      parentGoals: familyProfile.parentGoals,
      favoriteCategories: familyProfile.interests,
      coExplorers: familyProfile.coExplorers,
      learningMode: mode,
      learningModeOverride: familyProfile.learningModeOverride,
      onboardingComplete: familyProfile.onboardingComplete,
    }),
    [familyProfile, mode],
  );

  return {
    mode,
    definition,
    features,
    profile,
    setMode: (next, options) => {
      familyAIProfileService.setLearningMode(next, options);
    },
  };
}
