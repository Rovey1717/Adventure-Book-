import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  objectName: string;
  /** True only when a real-world Memory exists for this object. */
  unlocked: boolean;
  onStart?: () => void;
};

/**
 * Signature adventure CTA.
 * Visible as a start button only after a real-world discovery Memory exists.
 */
export function AdventureBanner({ objectName, unlocked, onStart }: Props) {
  if (!unlocked) {
    return (
      <View style={[styles.lockedCard, shadows.soft]}>
        <Text style={styles.lockedEyebrow}>Adventure waiting</Text>
        <Text style={styles.lockedTitle}>
          Discover this in the real world to unlock your Adventure.
        </Text>
        <Text style={styles.lockedBody}>
          Capture a {objectName} with Discover — browsing Library never unlocks
          Adventures.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, shadows.soft]}>
      <Text style={styles.sparkle}>✦ ✦</Text>
      <Text style={styles.eyebrow}>Signature</Text>
      <Text style={styles.title}>Take the {objectName} Adventure</Text>
      <Text style={styles.features}>
        Celebrate · Watch · Explore · Quiz · Challenge · Talk · Save
      </Text>
      <Pressable
        style={styles.cta}
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={`Start the ${objectName} adventure`}
      >
        <Text style={styles.ctaText}>Start Adventure →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.navy,
    borderRadius: radii.xl,
    padding: 22,
    gap: 10,
    overflow: "hidden",
  },
  sparkle: {
    position: "absolute",
    top: 16,
    right: 18,
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    letterSpacing: 4,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    color: colors.surfaceRaised,
  },
  features: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.62)",
    marginBottom: 6,
  },
  cta: {
    backgroundColor: colors.sunshine,
    borderRadius: radii.pill,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.navy,
  },
  lockedCard: {
    backgroundColor: colors.lavender,
    borderRadius: radii.xl,
    padding: 22,
    gap: 8,
  },
  lockedEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.lavenderInk,
  },
  lockedTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    lineHeight: 26,
    color: colors.navy,
  },
  lockedBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.navySoft,
  },
});
