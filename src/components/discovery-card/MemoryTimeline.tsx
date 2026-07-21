import { StyleSheet, Text, View } from "react-native";
import { MemoryTimelineCard } from "@/components/discovery-card/MemoryTimelineCard";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { DiscoveryMemoryTimeline } from "@/intelligence/types/discoveryMemoryTimeline";

type Props = {
  timeline: DiscoveryMemoryTimeline;
  emoji?: string;
};

/**
 * Memory Timeline section for Living Discovery Cards.
 * Data comes from the Memory Graph — this component only renders.
 */
export function MemoryTimeline({ timeline, emoji = "📷" }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>✨ My Journey</Text>
      <Text style={styles.heading}>Memory Timeline</Text>

      {timeline.headline ? (
        <View style={[styles.headlineBanner, shadows.soft]}>
          <Text style={styles.headlineText}>{timeline.headline}</Text>
        </View>
      ) : null}

      {timeline.isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyBody}>{timeline.emptyMessage}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {timeline.entries.map((entry, index) => (
            <View
              key={entry.memoryId}
              style={
                index === timeline.entries.length - 1
                  ? styles.lastCard
                  : undefined
              }
            >
              <MemoryTimelineCard entry={entry} emoji={emoji} index={index} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginTop: 4,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.lavenderInk,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.navy,
    marginTop: -4,
  },
  headlineBanner: {
    backgroundColor: colors.lavender,
    borderRadius: radii.xl,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headlineText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: colors.lavenderInk,
    textAlign: "center",
  },
  list: {
    gap: 2,
  },
  lastCard: {
    opacity: 1,
  },
  empty: {
    backgroundColor: colors.pastelGreen,
    borderRadius: radii.xxl,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.navy,
    textAlign: "center",
  },
});
