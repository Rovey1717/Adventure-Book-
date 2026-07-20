import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { emojiForLibraryEntry } from "@/domain/library/emoji";

/**
 * Library discovery card — intentional learning only.
 * Opening this screen never creates an Adventure Book memory.
 */
export default function LibraryDiscoveryCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { library } = useApp();
  const [started, setStarted] = useState(false);

  const entry = useMemo(
    () => (id ? library.getEntry(id) : null),
    [id, library],
  );

  const category = useMemo(() => {
    if (!entry) return null;
    return (
      library.getCategories().find((item) => item.id === entry.categoryId) ??
      null
    );
  }, [entry, library]);

  if (!entry) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.missingTitle}>Discovery not found</Text>
        <Pressable style={styles.primary} onPress={() => router.back()}>
          <Text style={styles.primaryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const accent = category?.accent ?? colors.moss;
  const emoji = emojiForLibraryEntry(entry.title, entry.categoryId);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[accent, colors.skyMid, colors.skyBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>Close</Text>
        </Pressable>

        <Text style={styles.eyebrow}>
          {category?.title ?? "Library"} · Learning
        </Text>

        <View style={styles.hero}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.pronunciation}>{entry.pronunciation}</Text>
        <Text style={styles.lead}>
          Let's explore together — no photo needed.
        </Text>

        {started ? (
          <View style={styles.startedBanner}>
            <Text style={styles.startedText}>
              You're learning about {entry.title}!
            </Text>
          </View>
        ) : null}

        <View style={styles.facts}>
          <Text style={styles.factsHeading}>Fun facts</Text>
          {entry.facts.map((fact) => (
            <View key={fact} style={styles.factRow}>
              <Text style={styles.factBullet}>✦</Text>
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>

        <View style={styles.activities}>
          {entry.hasVideo ? (
            <View style={styles.activityChip}>
              <Text style={styles.activityText}>Video</Text>
            </View>
          ) : null}
          {entry.hasSound ? (
            <View style={styles.activityChip}>
              <Text style={styles.activityText}>Sounds</Text>
            </View>
          ) : null}
          {entry.hasQuiz ? (
            <View style={styles.activityChip}>
              <Text style={styles.activityText}>Quiz</Text>
            </View>
          ) : null}
          <View style={styles.activityChip}>
            <Text style={styles.activityText}>Facts</Text>
          </View>
        </View>

        <Pressable style={styles.primary} onPress={() => setStarted(true)}>
          <Text style={styles.primaryText}>
            {started ? "Keep Exploring Facts" : "Begin Learning"}
          </Text>
        </Pressable>

        <Text style={styles.footnote}>
          This is Library learning. Capturing with the camera creates memories
          in Adventure Book.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyMid,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 16,
  },
  content: {
    paddingHorizontal: space.lg,
    gap: 12,
  },
  back: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.mossDeep,
    marginBottom: 4,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.mossDeep,
  },
  hero: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 46,
    color: colors.ink,
    textAlign: "center",
  },
  pronunciation: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.inkMuted,
    textAlign: "center",
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  startedBanner: {
    backgroundColor: colors.mossSoft,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  startedText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.mossDeep,
    textAlign: "center",
  },
  facts: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  factsHeading: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
  },
  factRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  factBullet: {
    fontFamily: fonts.bodyBold,
    color: colors.orange,
    marginTop: 2,
  },
  factText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  activities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
  activityChip: {
    backgroundColor: colors.mossSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activityText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.mossDeep,
  },
  primary: {
    backgroundColor: colors.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 4,
  },
  missingTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: "center",
  },
});
