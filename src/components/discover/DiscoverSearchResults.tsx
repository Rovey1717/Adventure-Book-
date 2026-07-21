import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PlayfulPressable } from "@/components/ui/PlayfulPressable";
import { SoftCard } from "@/components/ui/SoftCard";
import { SparkleRow } from "@/components/ui/PulseGlow";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import type { LibraryEntry } from "@/domain/library/types";

type Props = {
  results: LibraryEntry[];
  query: string;
  onSelect: (entry: LibraryEntry) => void;
};

/**
 * Live Learning Graph matches for intentional learning.
 * Selecting a card opens a Discovery Card — no Memory is created.
 */
export function DiscoverSearchResults({ results, query, onSelect }: Props) {
  const { learningGraph } = useApp();

  if (query.trim().length === 0) return null;

  return (
    <SoftCard tint="blue" style={styles.panel}>
      <View style={styles.inner}>
        <Text style={styles.heading}>
          {results.length > 0 ? "🌼 Garden discoveries" : "Hmm, nothing yet!"}
        </Text>
        {results.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🦋</Text>
            <Text style={styles.empty}>
              Try Butterfly, Bee, Flower, or Garden — or capture something new!
            </Text>
            <SparkleRow count={3} />
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {results.map((entry) => {
              const node = learningGraph.getNode(entry.id);
              const emoji =
                node?.emoji ??
                emojiForLibraryEntry(entry.title, entry.categoryId);
              return (
                <PlayfulPressable
                  key={entry.id}
                  style={styles.card}
                  onPress={() => onSelect(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${entry.title} discovery card`}
                >
                  <View style={styles.emojiBubble}>
                    <Text style={styles.emoji}>{emoji}</Text>
                  </View>
                  <View style={styles.copy}>
                    <Text style={styles.title}>{entry.title}</Text>
                    <Text style={styles.fact} numberOfLines={2}>
                      {entry.facts[0]}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </PlayfulPressable>
              );
            })}
          </ScrollView>
        )}
        <Text style={styles.footnote}>
          Graph search only — never creates memories, adventures, or Journey
          progress
        </Text>
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 10,
    maxHeight: 340,
  },
  inner: {
    padding: 14,
    gap: 10,
  },
  heading: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.ink,
    paddingHorizontal: 2,
  },
  emptyWrap: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    textAlign: "center",
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 8,
    paddingBottom: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    ...shadows.soft,
  },
  emojiBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.pastelYellow,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
  },
  fact: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  chevron: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.skyBlue,
    lineHeight: 28,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 2,
  },
});
