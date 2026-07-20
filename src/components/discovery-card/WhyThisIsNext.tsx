import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { NextAdventureRecommendation } from "@/domain/graph/types";

type Props = {
  recommendation: NextAdventureRecommendation | null;
  /** Optional: progress for the current card node. */
  masteryLabel?: string | null;
  onOpen: (nodeId: string) => void;
};

/**
 * "Why this is next" — graph-edge explanation for the recommended discovery.
 */
export function WhyThisIsNext({
  recommendation,
  masteryLabel,
  onOpen,
}: Props) {
  if (!recommendation) return null;

  return (
    <View style={[styles.card, shadows.soft]}>
      <Text style={styles.eyebrow}>🌼 Next Adventure</Text>
      <Text style={styles.title}>
        Discover a {recommendation.name}
      </Text>
      <Text style={styles.whyLabel}>Why this is next</Text>
      <Text style={styles.reason}>{recommendation.reason}</Text>
      <Text style={styles.from}>
        Connected from {recommendation.fromName}
        {masteryLabel ? ` · ${masteryLabel}` : ""}
      </Text>
      <Pressable
        style={styles.cta}
        onPress={() => onOpen(recommendation.nodeId)}
      >
        <Text style={styles.ctaText}>
          {recommendation.emoji} Explore {recommendation.name}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.pastelGreen,
    borderRadius: radii.xl,
    padding: 20,
    gap: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.6,
    color: colors.mossDeep,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.navy,
  },
  whyLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.moss,
    marginTop: 4,
  },
  reason: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.navy,
    fontStyle: "italic",
  },
  from: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navySoft,
  },
  cta: {
    marginTop: 8,
    backgroundColor: colors.navy,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
});
