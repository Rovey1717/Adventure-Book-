import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";

export default function ParentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent</Text>
      <Text style={styles.subtitle}>
        Insights and controls for grown-ups.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 24,
    gap: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
