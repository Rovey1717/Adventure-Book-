import type { OnboardingDraft } from "@/domain/onboarding/types";
import { EMPTY_ONBOARDING_DRAFT } from "@/domain/onboarding/types";

/**
 * In-memory onboarding draft (process singleton).
 * Persistence can move to AsyncStorage / Firebase later.
 */
let draft: OnboardingDraft = { ...EMPTY_ONBOARDING_DRAFT };

export const onboardingRepository = {
  getDraft(): OnboardingDraft {
    return {
      ...draft,
      coExplorers: [...draft.coExplorers],
      interests: [...draft.interests],
      parentGoals: [...draft.parentGoals],
      learningStyles: [...draft.learningStyles],
    };
  },

  setDraft(next: OnboardingDraft): OnboardingDraft {
    draft = {
      ...next,
      coExplorers: [...next.coExplorers],
      interests: [...next.interests],
      parentGoals: [...next.parentGoals],
      learningStyles: [...next.learningStyles],
    };
    return this.getDraft();
  },

  patchDraft(patch: Partial<OnboardingDraft>): OnboardingDraft {
    return this.setDraft({ ...this.getDraft(), ...patch });
  },

  reset(): void {
    draft = { ...EMPTY_ONBOARDING_DRAFT };
  },
};
