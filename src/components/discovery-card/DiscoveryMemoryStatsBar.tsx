import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { DiscoveryMemoryStats } from "@/intelligence/types/discoveryMemoryTimeline";

type Props = {
  stats: DiscoveryMemoryStats;
};

type StatItem = {
  icon: string;
  label: string;
  tint: string;
};

/**
 * Summary strip at the top of a Living Discovery Card.
 * Counts come from the Memory Graph query — not stored on the card.
 */
export function DiscoveryMemoryStatsBar({ stats }: Props) {
  if (stats.memoryCount === 0) return null;

  const items: StatItem[] = [
    { icon: "❤️", label: `${stats.memoryCount} Memories`, tint: colors.pastelPink },
    { icon: "📷", label: `${stats.photoCount} Photos`, tint: colors.pastelBlue },
    { icon: "🎥", label: `${stats.videoCount} Videos`, tint: colors.pastelPurple },
    { icon: "🏆", label: `${stats.adventureCount} Adventures`, tint: colors.pastelYellow },
  ];

  if (stats.firstSeenLabel) {
    items.push({
      icon: "⏳",
      label: `First seen ${stats.firstSeenLabel}`,
      tint: colors.pastelGreen,
    });
  }

  return (
    <View style={[styles.wrap, shadows.soft]}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.chip, { backgroundColor: item.tint }]}
        >
          <Text style={styles.chipText}>
            {item.icon} {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.stroke,
  },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.navy,
  },
});
