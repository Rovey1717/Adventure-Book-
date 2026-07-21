import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingShell, OptionChips } from "@/components/onboarding";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  PARENT_GOAL_OPTIONS,
  type ParentGoalId,
} from "@/domain/onboarding/types";

export default function GoalsScreen() {
  const router = useRouter();
  const { draft, patchDraft } = useOnboarding();

  const toggle = (id: string) => {
    const goal = id as ParentGoalId;
    const next = draft.parentGoals.includes(goal)
      ? draft.parentGoals.filter((item) => item !== goal)
      : [...draft.parentGoals, goal];
    patchDraft({ parentGoals: next });
  };

  return (
    <OnboardingShell
      stepIndex={5}
      title="What matters most to you?"
      subtitle="Choose a few parent goals — we'll gently steer learning that way."
      primaryLabel="Continue"
      onPrimary={() => router.push("/onboarding/learning-style")}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="lavender"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <OptionChips
          options={PARENT_GOAL_OPTIONS}
          selectedIds={draft.parentGoals}
          onToggle={toggle}
        />
      </ScrollView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 16,
  },
});
