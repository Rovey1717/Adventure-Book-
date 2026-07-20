import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";

const MANAGEMENT_SECTIONS = [
  { title: "Profiles", meta: "Family members and ages" },
  { title: "Learning Goals", meta: "What each child is working toward" },
  { title: "Languages", meta: "Spoken language and learning languages" },
  { title: "Notifications", meta: "Reminders and weekly summaries" },
  { title: "Export Adventure Book", meta: "Share memories with family" },
  { title: "Subscription", meta: "Plan and billing" },
  { title: "Settings", meta: "Privacy, storage, and preferences" },
];

/**
 * Parent domain — family management only.
 * Does not host Discover, memories, adventures, journey stats, or encyclopedia.
 */
export default function ParentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: space.screen,
        gap: 12,
      }}
    >
      <Text style={styles.title}>Parent</Text>
      <Text style={styles.subtitle}>
        Family management — separate from memories, learning, and knowledge.
      </Text>

      <Pressable
        style={styles.row}
        onPress={() => router.push("/(tabs)/library")}
      >
        <Text style={styles.rowTitle}>Browse Library</Text>
        <Text style={styles.rowMeta}>
          Universal encyclopedia — never mixed with Adventure Book memories
        </Text>
      </Pressable>

      {MANAGEMENT_SECTIONS.map((section) => (
        <View key={section.title} style={styles.rowMuted}>
          <Text style={styles.rowTitleMuted}>{section.title}</Text>
          <Text style={styles.rowMeta}>{section.meta} · Coming soon</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
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
  row: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
    gap: 4,
  },
  rowMuted: {
    backgroundColor: colors.mossSoft,
    borderRadius: 16,
    padding: 14,
    gap: 4,
    opacity: 0.85,
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
