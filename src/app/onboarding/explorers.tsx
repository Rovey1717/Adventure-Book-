import { useRouter } from "expo-router";
import { OnboardingShell, OptionChips } from "@/components/onboarding";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  CO_EXPLORER_OPTIONS,
  type CoExplorerRole,
} from "@/domain/onboarding/types";

export default function ExplorersScreen() {
  const router = useRouter();
  const { draft, patchDraft } = useOnboarding();

  const toggle = (id: string) => {
    const role = id as CoExplorerRole;
    const next = draft.coExplorers.includes(role)
      ? draft.coExplorers.filter((item) => item !== role)
      : [...draft.coExplorers, role];
    patchDraft({ coExplorers: next });
  };

  return (
    <OnboardingShell
      stepIndex={2}
      title="Who usually explores together?"
      subtitle="So we can celebrate the whole crew."
      primaryLabel="Continue"
      onPrimary={() => router.push("/onboarding/languages")}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="garden"
    >
      <OptionChips
        options={CO_EXPLORER_OPTIONS}
        selectedIds={draft.coExplorers}
        onToggle={toggle}
      />
    </OnboardingShell>
  );
}
