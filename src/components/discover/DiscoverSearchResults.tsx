import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import type { LibraryEntry } from "@/domain/library/types";

type Props = {
  results: LibraryEntry[];
  query: string;
  onSelect: (entry: LibraryEntry) => void;
};

/**
 * Live Library matches for intentional learning.
 * Selecting a card opens learning only — no Memory is created.
 */
export function DiscoverSearchResults({ results, query, onSelect }: Props) {
  if (query.trim().length === 0) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>
        {results.length > 0 ? "Start learning" : "No matches yet"}
      </Text>
      {results.length === 0 ? (
        <Text style={styles.empty}>
          Try another word, or capture something new with the camera below.
        </Text>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {results.map((entry) => (
            <Pressable
              key={entry.id}
              style={styles.card}
              onPress={() => onSelect(entry)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${entry.title} discovery card`}
            >
              <Text style={styles.emoji}>
                {emojiForLibraryEntry(entry.title, entry.categoryId)}
              </Text>
              <View style={styles.copy}>
                <Text style={styles.title}>{entry.title}</Text>
                <Text style={styles.fact} numberOfLines={2}>
                  {entry.facts[0]}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Text style={styles.footnote}>
        Knowledge only — searching never creates memories, adventures, or
        Journey progress
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 10,
    backgroundColor: "rgba(255,249,241,0.96)",
    borderRadius: 22,
    padding: 14,
    maxHeight: 320,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  heading: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.ink,
    paddingHorizontal: 2,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
    paddingVertical: 6,
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
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  emoji: {
    fontSize: 28,
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
    color: colors.moss,
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
