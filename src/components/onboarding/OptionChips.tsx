import { StyleSheet, Text, View } from "react-native";
import { PlayfulPressable } from "@/components/ui";
import { colors, fonts, radii, shadows } from "@/constants/theme";

export type ChipOption = {
  id: string;
  label: string;
  emoji?: string;
};

type Props = {
  options: ChipOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  /** Reserved for callers; selection logic lives in the parent. */
  multi?: boolean;
};

/**
 * Soft selection chips for Family AI onboarding.
 */
export function OptionChips({
  options,
  selectedIds,
  onToggle,
}: Props) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = selectedIds.includes(option.id);
        return (
          <PlayfulPressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onToggle(option.id)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
          >
            {option.emoji ? (
              <Text style={styles.emoji}>{option.emoji}</Text>
            ) : null}
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </PlayfulPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: colors.surfaceRaised,
  },
  chipIdle: {
    borderColor: colors.stroke,
  },
  chipActive: {
    borderColor: colors.skyBlue,
    backgroundColor: colors.pastelBlue,
    ...shadows.glow,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.inkMuted,
  },
  labelActive: {
    color: colors.ink,
  },
});
