import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import type { LibraryCategoryId } from "@/domain/library/types";

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
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Library</Text>
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
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => {
          const active = item.id === activeCategory;
          return (
            <Pressable
              onPress={() =>
                setActiveCategory(item.id as LibraryCategoryId | "all")
              }
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.title}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/library/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title} discovery card`}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>
                {emojiForLibraryEntry(item.title, item.categoryId)}
              </Text>
              <View style={styles.cardTitles}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.pronunciation}</Text>
              </View>
            </View>
            <Text style={styles.cardFact}>{item.facts[0]}</Text>
            <Text style={styles.assets}>
              {[
                item.hasVideo ? "Video" : null,
                item.hasSound ? "Sounds" : null,
                item.hasQuiz ? "Quiz" : null,
                "Facts",
                "Pronunciation",
                "Vocabulary",
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
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
    gap: 8,
    paddingHorizontal: space.screen,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.mossSoft,
  },
  chipActive: {
    backgroundColor: colors.moss,
  },
  chipText: {
    fontFamily: fonts.bodySemi,
    color: colors.mossDeep,
  },
  chipTextActive: {
    color: colors.surfaceRaised,
  },
  list: {
    gap: 12,
    paddingHorizontal: space.screen,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardTitles: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.ink,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  cardFact: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
    marginTop: 4,
  },
  assets: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.moss,
    marginTop: 8,
  },
});
