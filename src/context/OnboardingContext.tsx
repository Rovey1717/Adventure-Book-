import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OnboardingDraft } from "@/domain/onboarding/types";
import { onboardingService } from "@/services/onboarding/OnboardingService";
import type { ChildNode } from "@/intelligence/types/child";

type OnboardingContextValue = {
  draft: OnboardingDraft;
  patchDraft: (patch: Partial<OnboardingDraft>) => void;
  createFamilyAIProfile: () => Promise<ChildNode>;
  isSubmitting: boolean;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(() =>
    onboardingService.getDraft(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patchDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    const next = onboardingService.patchDraft(patch);
    setDraft(next);
  }, []);

  const createFamilyAIProfile = useCallback(async () => {
    setIsSubmitting(true);
    try {
      return await onboardingService.createFamilyAIProfile(draft);
    } finally {
      setIsSubmitting(false);
    }
  }, [draft]);

  const value = useMemo(
    () => ({
      draft,
      patchDraft,
      createFamilyAIProfile,
      isSubmitting,
    }),
    [createFamilyAIProfile, draft, isSubmitting, patchDraft],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
