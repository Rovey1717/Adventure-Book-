import { useSyncExternalStore } from "react";
import type { FamilyAIProfile } from "@/domain/family/FamilyAIProfile";
import {
  definitionForMode,
  type LearningModeDefinition,
  type LearningModeId,
} from "@/domain/learning/mode";
import {
  featuresForChild,
  type DevelopmentalFeaturePlan,
} from "@/domain/learning/developmentalFeatures";
import { familyAIProfileService } from "@/services/family/FamilyAIProfileService";

export type FamilyAIProfileState = {
  profile: FamilyAIProfile;
  mode: LearningModeId;
  definition: LearningModeDefinition;
  features: DevelopmentalFeaturePlan;
  update: typeof familyAIProfileService.update;
  setMode: typeof familyAIProfileService.setLearningMode;
  clearModeOverride: typeof familyAIProfileService.clearLearningModeOverride;
};

/**
 * Subscribe to the Family AI profile — structured personalization SSOT.
 *
 * getSnapshot returns the service's stable profile reference until notify().
 */
export function useFamilyAIProfile(): FamilyAIProfileState {
  const profile = useSyncExternalStore(
    (listener) => familyAIProfileService.subscribe(listener),
    () => familyAIProfileService.get(),
    () => familyAIProfileService.get(),
  );

  const mode = familyAIProfileService.resolveLearningMode();
  const definition = definitionForMode(mode);
  const features = featuresForChild({
    age: profile.currentAge,
    mode,
    modeOverride: profile.learningModeOverride,
  });

  return {
    profile,
    mode,
    definition,
    features,
    update: (patch) => familyAIProfileService.update(patch),
    setMode: (next, options) =>
      familyAIProfileService.setLearningMode(next, options),
    clearModeOverride: () => familyAIProfileService.clearLearningModeOverride(),
  };
}
