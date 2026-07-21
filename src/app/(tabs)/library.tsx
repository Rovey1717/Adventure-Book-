import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MagicalBackground, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii, shadows, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import type { LibraryCategoryId } from "@/domain/library/types";

const CATEGORY_EMOJI: Record<LibraryCategoryId | "all", string> = {
  all: "✨",
  animals: "🐾",
  nature: "🌤️",
  ocean: "🌊",
  food: "🍽️",
  vehicles: "🚗",
  construction: "🚧",
  space: "🪐",
  science: "🔬",
};

const ASSET_META: Record<string, string> = {
  Video: "🎬",
  Sounds: "🔊",
  Quiz: "❓",
  Facts: "📖",
  Pronunciation: "🗣️",
  Vocabulary: "📝",
};

const CARD_TINTS = ["blue", "yellow", "green", "coral", "lavender", "aqua"] as const;

/**
 * Library tab — universal encyclopedia / knowledge home.
 * Never stores personal memories and never unlocks Adventures or Journey progress.
 */
export default function LibraryTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { library } = useApp();
  const categories = library.getCategories();
  const [activeCategory, setActiveCategory] = useState<
    LibraryCategoryId | "all"
  >("all");

  const entries = useMemo(
    () =>
      activeCategory === "all"
        ? library.getEntries()
        : library.getEntries(activeCategory),
    [activeCategory, library],
  );

  return (
    <MagicalBackground variant="cream">
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <Text style={styles.heading}>📚 Library</Text>
          <Text style={styles.subheading}>
            Garden Learning Graph — connected knowledge you can explore. Capture
            in Discover to turn a node into a personal Memory.
          </Text>
        </View>

        <FlatList
          horizontal
          data={[{ id: "all", title: "All" } as const, ...categories]}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const active = item.id === activeCategory;
            const categoryId = item.id as LibraryCategoryId | "all";
            return (
              <PlayfulPressable
                onPress={() => setActiveCategory(categoryId)}
                accessibilityRole="button"
                accessibilityLabel={`Filter library by ${item.title}`}
                style={[
                  styles.chip,
                  active ? styles.chipActive : styles.chipInactive,
                ]}
              >
                <Text style={styles.chipEmoji}>
                  {CATEGORY_EMOJI[categoryId] ?? "✨"}
                </Text>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.title}
                </Text>
              </PlayfulPressable>
            );
          }}
        />

        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 40 },
          ]}
          style={styles.entryList}
          renderItem={({ item, index }) => {
            const assets = [
              item.hasVideo ? "Video" : null,
              item.hasSound ? "Sounds" : null,
              item.hasQuiz ? "Quiz" : null,
              "Facts",
              "Pronunciation",
              "Vocabulary",
            ].filter((asset): asset is string => Boolean(asset));

            return (
              <PlayfulPressable
                tilt
                onPress={() => router.push(`/library/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title} discovery card`}
              >
                <SoftCard
                  tint={CARD_TINTS[index % CARD_TINTS.length]}
                  enterDelay={Math.min(index * 50, 300)}
                  style={styles.card}
                >
                  <View style={styles.cardInner}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardEmojiBadge}>
                        <Text style={styles.cardEmoji}>
                          {emojiForLibraryEntry(item.title, item.categoryId)}
                        </Text>
                      </View>
                      <View style={styles.cardTitles}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardMeta}>{item.pronunciation}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardFact}>{item.facts[0]}</Text>
                    <View style={styles.assetRow}>
                      {assets.map((asset) => (
                        <View key={asset} style={styles.assetPill}>
                          <Text style={styles.assetPillText}>
                            {ASSET_META[asset] ?? "✨"} {asset}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </SoftCard>
              </PlayfulPressable>
            );
          }}
        />
      </View>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.screen,
    marginBottom: 12,
    gap: 6,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  chips: {
    gap: 10,
    paddingHorizontal: space.screen,
    paddingBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: "transparent",
  },
  chipInactive: {
    backgroundColor: colors.surfaceRaised,
  },
  chipActive: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.skyBlue,
    ...shadows.glow,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.inkMuted,
  },
  chipTextActive: {
    color: colors.skyBlue,
  },
  entryList: {
    flex: 1,
  },
  list: {
    gap: 16,
    paddingHorizontal: space.screen,
  },
  card: {},
  cardInner: {
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardEmojiBadge: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: 30,
  },
  cardTitles: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 21,
    color: colors.ink,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  cardFact: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 21,
    marginTop: 4,
  },
  assetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  assetPill: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  assetPillText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkMuted,
  },
});
