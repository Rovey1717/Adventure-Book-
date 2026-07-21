import { StyleSheet, Text, View } from "react-native";
import {
  PhotoFrame,
  PlayfulPressable,
  SoftCard,
} from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import type { AdventureEntry } from "@/domain/adventure-book/adventureEntry";
import { accentForCategory } from "@/domain/shared/categories";

type Props = {
  entry: AdventureEntry;
  index?: number;
  onPress: () => void;
};

/**
 * Collectible Adventure Entry card — scrapbook page, not a gallery tile.
 */
export function AdventureEntryCard({ entry, index = 0, onPress }: Props) {
  const accent = accentForCategory(entry.category);

  return (
    <PlayfulPressable
      tilt
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open adventure: ${entry.storyTitle}`}
    >
      <SoftCard tint="white" enterDelay={Math.min(index * 80, 400)} shimmer>
        <View style={styles.inner}>
          <PhotoFrame
            uri={entry.photoUri}
            borderColor={accent}
            height={188}
          >
            <View style={[styles.fallback, { backgroundColor: accent }]}>
              <Text style={styles.fallbackGlyph}>
                {entry.objectName.charAt(0)}
              </Text>
            </View>
          </PhotoFrame>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.pastelYellow }]}>
              <Text style={styles.badgeText}>🔎 {entry.discoveryBadge}</Text>
            </View>
            {entry.adventureBadge ? (
              <View style={[styles.badge, { backgroundColor: colors.pastelGreen }]}>
                <Text style={styles.badgeText}>🗺 {entry.adventureBadge}</Text>
              </View>
            ) : null}
            <View style={[styles.badge, { backgroundColor: colors.pastelPurple }]}>
              <Text style={styles.badgeText}>⭐ Level {entry.explorerLevel}</Text>
            </View>
          </View>

          <Text style={styles.storyTitle}>{entry.storyTitle}</Text>
          <Text style={styles.meta}>
            {entry.childAge != null ? `Age ${entry.childAge} · ` : ""}
            {entry.dateLabel}
            {entry.locationLabel ? ` · ${entry.locationLabel}` : ""}
          </Text>
          <Text style={styles.excerpt} numberOfLines={3}>
            {entry.storyBody}
          </Text>
          {entry.collectionTitle ? (
            <Text style={styles.collection}>
              🏆 {entry.collectionTitle}
              {entry.collectionProgressLabel
                ? ` · ${entry.collectionProgressLabel}`
                : ""}
            </Text>
          ) : null}
        </View>
      </SoftCard>
    </PlayfulPressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    padding: 14,
    gap: 10,
  },
  fallback: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackGlyph: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: "rgba(255,255,255,0.92)",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.navy,
  },
  storyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
    lineHeight: 28,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  excerpt: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  collection: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.grassDeep,
  },
});
