import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "@/constants/theme";
import type { CelebrationProgress } from "@/domain/celebration/messages";

type Props = {
  progress: CelebrationProgress;
  /** Optional second signal (e.g. level + memory) */
  secondary?: CelebrationProgress;
};

/**
 * Reminds the child that every celebration is meaningful progress.
 */
export function CelebrationProgressChip({ progress, secondary }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.chip}>
        <Text style={styles.emoji}>{progress.emoji}</Text>
        <Text style={styles.label}>{progress.label}</Text>
      </View>
      {secondary ? (
        <View style={[styles.chip, styles.chipAlt]}>
          <Text style={styles.emoji}>{secondary.emoji}</Text>
          <Text style={styles.label}>{secondary.label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.sunshine,
    minHeight: 40,
  },
  chipAlt: {
    borderColor: colors.skyBlue,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.navy,
  },
});
