import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";

const FUTURE_SECTIONS = [
  "Learning Goals",
  "Languages",
  "Profiles",
  "AI Settings",
  "Subscription",
  "Export Adventure Book",
];

export default function ParentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Parent</Text>
      <Text style={styles.subtitle}>
        Insights and controls for grown-ups.
      </Text>

      <Pressable
        style={styles.row}
        onPress={() => router.push("/library")}
      >
        <Text style={styles.rowTitle}>Library Encyclopedia</Text>
        <Text style={styles.rowMeta}>
          Permanent learning content — never mixed with Adventure Book memories
        </Text>
      </Pressable>

      {FUTURE_SECTIONS.map((section) => (
        <View key={section} style={styles.rowMuted}>
          <Text style={styles.rowTitleMuted}>{section}</Text>
          <Text style={styles.rowMeta}>Coming soon</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: space.screen,
    gap: 12,
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
