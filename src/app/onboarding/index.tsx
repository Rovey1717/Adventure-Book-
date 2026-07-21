import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SoftCard } from "@/components/ui";
import { OnboardingShell } from "@/components/onboarding";
import { colors, fonts } from "@/constants/theme";

/**
 * Welcome — Family AI onboarding starts here (not account creation).
 */
export default function OnboardingWelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingShell
      title="Welcome to Adventure Book"
      subtitle="Let's build your family's learning profile — a few gentle questions so recommendations feel like home."
      footnote="Takes about a minute. Everything can be edited later."
      primaryLabel="Let's begin"
      onPrimary={() => router.push("/onboarding/child-name")}
      variant="sky"
    >
      <SoftCard tint="blue" float style={styles.card}>
        <View style={styles.cardInner}>
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.cardTitle}>Family AI Profile</Text>
          <Text style={styles.cardBody}>
            We only ask what helps personalize discoveries, adventures, and
            learning — never more than you need.
          </Text>
        </View>
      </SoftCard>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
  },
  cardInner: {
    padding: 22,
    gap: 10,
    alignItems: "flex-start",
  },
  emoji: {
    fontSize: 36,
  },
  cardTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.ink,
  },
  cardBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
  },
});
