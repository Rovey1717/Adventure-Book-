import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MagicalBackground, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, space } from "@/constants/theme";

const MANAGEMENT_SECTIONS = [
  { title: "Profiles", meta: "Family members and ages", emoji: "👨‍👩‍👧" },
  { title: "Learning Goals", meta: "What each child is working toward", emoji: "🎯" },
  {
    title: "Languages",
    meta: "Spanish only when you enable it — never random",
    emoji: "🗣️",
  },
  { title: "Notifications", meta: "Reminders and weekly summaries", emoji: "🔔" },
  { title: "Export Adventure Book", meta: "Share memories with family", emoji: "📤" },
  { title: "Subscription", meta: "Plan and billing", emoji: "💳" },
  { title: "Settings", meta: "Privacy, storage, and preferences", emoji: "⚙️" },
];

/**
 * Parent domain — family management only.
 * Does not host Discover, memories, adventures, journey stats, or encyclopedia.
 */
export default function ParentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <MagicalBackground variant="cream" decorated={false}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: space.screen,
          gap: 14,
        }}
      >
        <Text style={styles.title}>👪 Parent</Text>
        <Text style={styles.subtitle}>
          Family management — separate from memories, learning, and knowledge.
        </Text>

        <PlayfulPressable
          onPress={() => router.push("/(tabs)/library")}
          accessibilityRole="button"
          accessibilityLabel="Browse Library"
        >
          <SoftCard tint="blue" style={styles.row}>
            <View style={styles.rowInner}>
              <Text style={styles.rowEmoji}>📚</Text>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>Browse Library</Text>
                <Text style={styles.rowMeta}>
                  Universal encyclopedia — never mixed with Adventure Book
                  memories
                </Text>
              </View>
            </View>
          </SoftCard>
        </PlayfulPressable>

        {MANAGEMENT_SECTIONS.map((section) => (
          <SoftCard key={section.title} tint="white" style={styles.rowMuted}>
            <View style={styles.rowInner}>
              <Text style={styles.rowEmojiMuted}>{section.emoji}</Text>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitleMuted}>{section.title}</Text>
                <Text style={styles.rowMeta}>{section.meta} · Coming soon</Text>
              </View>
            </View>
          </SoftCard>
        ))}
      </ScrollView>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  row: {},
  rowMuted: {
    opacity: 0.85,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    minHeight: 48,
  },
  rowEmoji: {
    fontSize: 28,
  },
  rowEmojiMuted: {
    fontSize: 24,
    opacity: 0.8,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  rowTitleMuted: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.inkMuted,
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 18,
  },
});
