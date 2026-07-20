import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";

type Props = {
  visible: boolean;
  message?: string;
};

export function ProcessingOverlay({
  visible,
  message = "Looking closely…",
}: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.orange} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(8, 20, 16, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: "center",
    gap: 14,
    minWidth: 220,
  },
  message: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
    textAlign: "center",
  },
});
