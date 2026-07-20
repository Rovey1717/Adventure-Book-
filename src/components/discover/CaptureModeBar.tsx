import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { CAPTURE_MODES, type CaptureMode } from "@/components/discover/captureModes";

type Props = {
  mode: CaptureMode;
  onChange: (mode: CaptureMode) => void;
  disabled?: boolean;
};

export function CaptureModeBar({ mode, onChange, disabled }: Props) {
  return (
    <View style={styles.row}>
      {CAPTURE_MODES.map((item) => {
        const active = item.id === mode;
        return (
          <Pressable
            key={item.id}
            disabled={disabled}
            onPress={() => onChange(item.id)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  chipActive: {
    backgroundColor: colors.surfaceRaised,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
  },
  labelActive: {
    color: colors.ink,
  },
});
