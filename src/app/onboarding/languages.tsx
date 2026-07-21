import { useRouter } from "expo-router";
import { OnboardingShell, OptionChips } from "@/components/onboarding";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  HOME_LANGUAGE_OPTIONS,
  type HomeLanguageChoice,
} from "@/domain/onboarding/types";

export default function LanguagesScreen() {
  const router = useRouter();
  const { draft, patchDraft } = useOnboarding();

  return (
    <OnboardingShell
      stepIndex={3}
      title="Languages at home"
      subtitle="We'll match stories and words to how your family speaks."
      primaryLabel="Continue"
      primaryDisabled={!draft.homeLanguage}
      onPrimary={() => router.push("/onboarding/interests")}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="lavender"
    >
      <OptionChips
        multi={false}
        options={HOME_LANGUAGE_OPTIONS}
        selectedIds={draft.homeLanguage ? [draft.homeLanguage] : []}
        onToggle={(id) => {
          const choice = id as HomeLanguageChoice;
          patchDraft({
            homeLanguage: draft.homeLanguage === choice ? null : choice,
          });
        }}
      />
    </OnboardingShell>
  );
}
