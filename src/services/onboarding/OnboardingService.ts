import { onboardingRepository } from "@/data/onboarding/OnboardingRepository";
import { mapOnboardingDraftToChild } from "@/domain/onboarding/mapToChild";
import type { OnboardingDraft } from "@/domain/onboarding/types";
import { estimateAttentionSpan } from "@/domain/family/FamilyAIProfile";
import { learningModeForAge } from "@/domain/learning/mode";
import { familyAIProfileService } from "@/services/family/FamilyAIProfileService";
import {
  DEMO_INTELLIGENCE_CHILD_ID,
  getIntelligenceLayer,
} from "@/intelligence/createIntelligenceLayer";
import { asChildId } from "@/intelligence/types/ids";
import type { ChildNode } from "@/intelligence/types/child";
import type { FamilyAIProfile } from "@/domain/family/FamilyAIProfile";

/**
 * Builds the initial Family AI profile from warm onboarding answers.
 * Writes Child Graph + FamilyAIProfile (SSOT) together.
 */
export class OnboardingService {
  getDraft(): OnboardingDraft {
    return onboardingRepository.getDraft();
  }

  patchDraft(patch: Partial<OnboardingDraft>): OnboardingDraft {
    return onboardingRepository.patchDraft(patch);
  }

  hasCompleted(): boolean {
    return familyAIProfileService.hasCompletedOnboarding();
  }

  /**
   * Creates / updates the Child Graph node and FamilyAIProfile SSOT.
   */
  async createFamilyAIProfile(
    draft: OnboardingDraft = onboardingRepository.getDraft(),
  ): Promise<ChildNode> {
    const layer = await getIntelligenceLayer();
    const input = mapOnboardingDraftToChild(draft);
    const childId = asChildId(DEMO_INTELLIGENCE_CHILD_ID);
    const existing = await layer.graph.child.getById(childId);

    const child = existing
      ? await layer.graph.child.update(childId, {
          name: input.name,
          birthdate: input.birthdate ?? null,
          currentAge: input.currentAge,
          currentLevel: input.currentLevel,
          languages: input.languages ?? ["en"],
          learningLanguages: input.learningLanguages ?? [],
          spanishEnabled: input.spanishEnabled ?? false,
          favoriteCategories: input.favoriteCategories ?? [],
          coExplorers: input.coExplorers ?? [],
          learningPreferences: input.learningPreferences ?? [],
          parentGoals: input.parentGoals ?? [],
          goals: input.goals ?? [],
        })
      : await layer.graph.child.create({
          ...input,
          id: childId,
        });

    const learningMode = learningModeForAge(child.currentAge);

    familyAIProfileService.update({
      childId: child.id,
      childName: child.name,
      birthdate: child.birthdate,
      currentAge: child.currentAge,
      learningMode,
      learningModeOverride: false,
      interests: child.favoriteCategories,
      languages: child.languages,
      learningLanguages: child.learningLanguages,
      spanishEnabled: child.spanishEnabled,
      parentGoals: child.parentGoals.map((goal) => goal.title),
      learningStyle: child.learningPreferences,
      attentionSpan: estimateAttentionSpan(child.currentAge, learningMode),
      coExplorers: child.coExplorers,
      currentLevel: child.currentLevel,
      masteredConcepts: child.masteredLearningObjectives.map(String),
      needsPractice: child.needsPracticeObjectives.map(String),
      questionHistory: child.questionHistory,
      favoriteAdventures: child.favoriteActivities,
      onboardingComplete: true,
      createdAt: child.createdAt,
    });

    onboardingRepository.reset();
    return child;
  }

  getProfile(): FamilyAIProfile {
    return familyAIProfileService.get();
  }
}

export const onboardingService = new OnboardingService();
