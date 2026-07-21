import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SoftCard } from "@/components/ui";
import { OnboardingShell } from "@/components/onboarding";
import { colors, fonts } from "@/constants/theme";
import { useOnboarding } from "@/context/OnboardingContext";
import { ageFromBirthdateIso } from "@/domain/onboarding/mapToChild";
import {
  CO_EXPLORER_OPTIONS,
  HOME_LANGUAGE_OPTIONS,
  INTEREST_OPTIONS,
  PARENT_GOAL_OPTIONS,
} from "@/domain/onboarding/types";

function summarizeList(
  ids: string[],
  options: { id: string; label: string }[],
  empty: string,
): string {
  if (ids.length === 0) return empty;
  return ids
    .map((id) => options.find((option) => option.id === id)?.label ?? id)
    .join(", ");
}

export default function FinishScreen() {
  const router = useRouter();
  const { draft, createFamilyAIProfile, isSubmitting } = useOnboarding();
  const name = draft.childName.trim() || "your explorer";
  const age = ageFromBirthdateIso(draft.birthdate);

  const onCreate = async () => {
    await createFamilyAIProfile();
    router.replace("/(tabs)");
  };

  return (
    <OnboardingShell
      title="Your Family AI profile is ready"
      subtitle={`We'll personalize Adventure Book for ${name}.`}
      footnote="Change any of this later in the Parent tab."
      primaryLabel={isSubmitting ? "Creating…" : "Create Family AI Profile"}
      primaryDisabled={isSubmitting}
      onPrimary={onCreate}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="celebration"
    >
      <SoftCard tint="yellow" shimmer style={styles.card}>
        <View style={styles.cardInner}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {age} year{age === 1 ? "" : "s"} old
            {draft.homeLanguage
              ? ` · ${
                  HOME_LANGUAGE_OPTIONS.find(
                    (option) => option.id === draft.homeLanguage,
                  )?.label
                }`
              : ""}
          </Text>
          <View style={styles.rows}>
            <SummaryRow
              label="Explores with"
              value={summarizeList(
                draft.coExplorers,
                CO_EXPLORER_OPTIONS,
                "Family",
              )}
            />
            <SummaryRow
              label="Loves"
              value={summarizeList(
                draft.interests,
                INTEREST_OPTIONS,
                "Open to everything",
              )}
            />
            <SummaryRow
              label="Goals"
              value={summarizeList(
                draft.parentGoals,
                PARENT_GOAL_OPTIONS,
                "Curiosity first",
              )}
            />
          </View>
        </View>
      </SoftCard>
    </OnboardingShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
  },
  cardInner: {
    padding: 22,
    gap: 8,
  },
  emoji: {
    fontSize: 34,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  rows: {
    gap: 12,
  },
  row: {
    gap: 2,
  },
  rowLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  rowValue: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
});
