import { StyleSheet, Text, View } from "react-native";
import { PlayfulPressable } from "@/components/ui/PlayfulPressable";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import { CAPTURE_MODES, type CaptureMode } from "@/components/discover/captureModes";

type Props = {
  mode: CaptureMode;
  onChange: (mode: CaptureMode) => void;
  disabled?: boolean;
};

const MODE_TINT: Record<CaptureMode, string> = {
  photo: colors.skyBlue,
  video: colors.coralDeep,
  voice: colors.lavenderDeep,
};

const MODE_EMOJI: Record<CaptureMode, string> = {
  photo: "📸",
  video: "🎥",
  voice: "🎙️",
};

export function CaptureModeBar({ mode, onChange, disabled }: Props) {
  return (
    <View style={styles.row}>
      {CAPTURE_MODES.map((item) => {
        const active = item.id === mode;
        const tint = MODE_TINT[item.id];
        return (
          <PlayfulPressable
            key={item.id}
            disabled={disabled}
            onPress={() => onChange(item.id)}
            style={[
              styles.chip,
              active && styles.chipActive,
              active && { backgroundColor: tint, shadowColor: tint },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
          >
            <Text style={styles.emoji}>{MODE_EMOJI[item.id]}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </PlayfulPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  chipActive: {
    ...shadows.glow,
    borderColor: "rgba(255,255,255,0.9)",
  },
  emoji: {
    fontSize: 15,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  labelActive: {
    color: colors.surfaceRaised,
  },
});
