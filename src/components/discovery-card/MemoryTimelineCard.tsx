import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { DiscoveryMemoryTimelineEntry } from "@/intelligence/types/discoveryMemoryTimeline";

type Props = {
  entry: DiscoveryMemoryTimelineEntry;
  emoji?: string;
  index?: number;
};

function isRenderableUri(uri: string | null): uri is string {
  if (!uri) return false;
  return (
    uri.startsWith("file:") ||
    uri.startsWith("content:") ||
    uri.startsWith("http") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library:")
  );
}

/**
 * One scrapbook moment on the Discovery Card Memory Timeline.
 */
export function MemoryTimelineCard({ entry, emoji = "📷", index = 0 }: Props) {
  const showPhoto = isRenderableUri(entry.photoUri);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(340).springify()}
      style={styles.card}
    >
      <View style={styles.rail}>
        <View style={styles.dot} />
        <View style={styles.line} />
      </View>

      <View style={[styles.body, shadows.soft]}>
        {entry.childAge != null ? (
          <View style={styles.agePill}>
            <Text style={styles.age}>Age {entry.childAge}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <View style={styles.media}>
            {showPhoto ? (
              <Image
                source={{ uri: entry.photoUri! }}
                style={styles.photo}
                accessibilityLabel={`Photo from ${entry.title}`}
              />
            ) : (
              <View style={styles.photoFallback}>
                <Text style={styles.photoFallbackEmoji}>
                  {entry.hasVideo ? "🎥" : emoji}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.copy}>
            <Text style={styles.title} numberOfLines={2}>
              {entry.isFirst ? `${emoji} ${entry.title}` : entry.title}
            </Text>
            <Text style={styles.date}>{entry.dateLabel}</Text>

            <View style={styles.badges}>
              {entry.hasVoiceMemo ? (
                <View style={[styles.chip, styles.chipVoice]}>
                  <Text style={styles.chipText}>🎤 Voice</Text>
                </View>
              ) : null}
              {entry.hasVideo ? (
                <View style={[styles.chip, styles.chipVideo]}>
                  <Text style={styles.chipText}>🎥 Video</Text>
                </View>
              ) : null}
              {entry.adventureBadge ? (
                <View style={[styles.chip, styles.chipAdventure]}>
                  <Text style={styles.chipText}>
                    🏆 {entry.adventureBadge}
                  </Text>
                </View>
              ) : null}
              {entry.favorite ? (
                <View style={[styles.chip, styles.chipFavorite]}>
                  <Text style={styles.chipText}>♥ Favorite</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
  },
  rail: {
    width: 18,
    alignItems: "center",
    paddingTop: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.coral,
    borderWidth: 2.5,
    borderColor: colors.surfaceRaised,
    ...shadows.soft,
  },
  line: {
    flex: 1,
    width: 3,
    marginTop: 4,
    borderRadius: 2,
    backgroundColor: colors.peachDeep,
    opacity: 0.5,
    minHeight: 48,
  },
  body: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    padding: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.stroke,
    marginBottom: 6,
  },
  agePill: {
    alignSelf: "flex-start",
    backgroundColor: colors.pastelPurple,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  age: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.lavenderInk,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  media: {
    width: 76,
    height: 76,
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: radii.lg,
    backgroundColor: colors.peach,
  },
  photoFallback: {
    width: 76,
    height: 76,
    borderRadius: radii.lg,
    backgroundColor: colors.pastelOrange,
    alignItems: "center",
    justifyContent: "center",
  },
  photoFallbackEmoji: {
    fontSize: 30,
  },
  copy: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    lineHeight: 22,
    color: colors.navy,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navySoft,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipVoice: {
    backgroundColor: colors.pastelPurple,
  },
  chipVideo: {
    backgroundColor: colors.pastelBlue,
  },
  chipAdventure: {
    backgroundColor: colors.pastelYellow,
  },
  chipFavorite: {
    backgroundColor: colors.pastelPink,
  },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.navy,
  },
});
