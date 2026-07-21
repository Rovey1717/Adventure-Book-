import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlayfulPressable, PulseGlow } from "@/components/ui";
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
        <Text style={styles.lockedEmoji}>🔒</Text>
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
    <View style={[styles.card, shadows.float]}>
      <LinearGradient
        colors={[colors.coral, colors.sunshine]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.sparkle}>✦ ✦ ✦</Text>
        <View style={styles.eyebrowPill}>
          <Text style={styles.eyebrow}>Signature</Text>
        </View>
        <Text style={styles.title}>Take the {objectName} Adventure</Text>
        <Text style={styles.features}>
          Celebrate · Watch · Explore · Quiz · Challenge · Talk · Save
        </Text>
        <PulseGlow color={colors.sunshineDeep}>
          <PlayfulPressable
            style={styles.cta}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel={`Start the ${objectName} adventure`}
          >
            <Text style={styles.ctaText}>Start Adventure →</Text>
          </PlayfulPressable>
        </PulseGlow>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xxl,
    overflow: "hidden",
  },
  gradient: {
    padding: 22,
    gap: 10,
  },
  sparkle: {
    position: "absolute",
    top: 16,
    right: 18,
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    letterSpacing: 4,
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.surfaceRaised,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    color: colors.surfaceRaised,
  },
  features: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.88)",
    marginBottom: 6,
  },
  cta: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.coralDeep,
  },
  lockedCard: {
    backgroundColor: colors.pastelPurple,
    borderRadius: radii.xxl,
    padding: 22,
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.stroke,
  },
  lockedEmoji: {
    fontSize: 28,
    marginBottom: 2,
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
