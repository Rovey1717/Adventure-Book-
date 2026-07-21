import { useRouter } from "expo-router";
import { OnboardingShell, OptionChips } from "@/components/onboarding";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  LEARNING_STYLE_OPTIONS,
  type LearningStyleId,
} from "@/domain/onboarding/types";

export default function LearningStyleScreen() {
  const router = useRouter();
  const { draft, patchDraft } = useOnboarding();
  const name = draft.childName.trim() || "your child";

  const toggle = (id: string) => {
    const style = id as LearningStyleId;
    const next = draft.learningStyles.includes(style)
      ? draft.learningStyles.filter((item) => item !== style)
      : [...draft.learningStyles, style];
    patchDraft({ learningStyles: next });
  };

  return (
    <OnboardingShell
      stepIndex={6}
      title={`How does ${name} learn best?`}
      subtitle="We'll favor the formats that click for them."
      primaryLabel="Continue"
      onPrimary={() => router.push("/onboarding/finish")}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="garden"
    >
      <OptionChips
        options={LEARNING_STYLE_OPTIONS}
        selectedIds={draft.learningStyles}
        onToggle={toggle}
      />
    </OnboardingShell>
  );
}
