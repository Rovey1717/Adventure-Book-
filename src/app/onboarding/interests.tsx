import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingShell, OptionChips } from "@/components/onboarding";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  INTEREST_OPTIONS,
  type InterestId,
} from "@/domain/onboarding/types";

export default function InterestsScreen() {
  const router = useRouter();
  const { draft, patchDraft } = useOnboarding();
  const name = draft.childName.trim() || "your child";

  const toggle = (id: string) => {
    const interest = id as InterestId;
    const next = draft.interests.includes(interest)
      ? draft.interests.filter((item) => item !== interest)
      : [...draft.interests, interest];
    patchDraft({ interests: next });
  };

  return (
    <OnboardingShell
      stepIndex={4}
      title={`What does ${name} love?`}
      subtitle="Pick a few favorites — we'll suggest more of what lights them up."
      primaryLabel="Continue"
      onPrimary={() => router.push("/onboarding/goals")}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="sky"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <OptionChips
          options={INTEREST_OPTIONS}
          selectedIds={draft.interests}
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
