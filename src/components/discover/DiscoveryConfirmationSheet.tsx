import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import type { Discovery } from "@/domain/discovery/types";

type Props = {
  discovery: Discovery | null;
  onCelebrate: () => void;
  onKeepExploring: () => void;
};

export function DiscoveryConfirmationSheet({
  discovery,
  onCelebrate,
  onKeepExploring,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={discovery != null}
      transparent
      animationType="slide"
      onRequestClose={onKeepExploring}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onKeepExploring} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.handle} />
          <View style={styles.check}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.title}>
            {discovery ? `${discovery.title} Discovered!` : ""}
          </Text>
          <Text style={styles.body}>
            This discovery has been saved.{"\n"}
            Would you like to celebrate it now or continue exploring?
          </Text>

          <Pressable
            onPress={onCelebrate}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Celebrate Now"
          >
            <Text style={styles.primaryText}>Celebrate Now</Text>
          </Pressable>

          <Pressable
            onPress={onKeepExploring}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Keep Exploring"
          >
            <Text style={styles.secondaryText}>Keep Exploring</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(8, 20, 16, 0.4)",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.lg,
    paddingTop: 12,
    gap: 12,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(22,53,44,0.15)",
    marginBottom: 8,
  },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E4F7EE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  checkMark: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.success,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  primary: {
    backgroundColor: colors.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
  secondary: {
    backgroundColor: colors.mossSoft,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 4,
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.mossDeep,
  },
  pressed: {
    opacity: 0.88,
  },
});
