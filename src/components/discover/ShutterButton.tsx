import { StyleSheet, View } from "react-native";
import { PlayfulPressable } from "@/components/ui/PlayfulPressable";
import { PulseGlow } from "@/components/ui/PulseGlow";
import { colors, radii } from "@/constants/theme";
import type { CaptureMode } from "@/components/discover/captureModes";

type Props = {
  mode: CaptureMode;
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function ShutterButton({ mode, isRecording, disabled, onPress }: Props) {
  const isVideoOrVoice = mode === "video" || mode === "voice";
  const recording = isRecording && isVideoOrVoice;

  return (
    <PulseGlow
      active={!disabled}
      color={recording ? colors.coralDeep : colors.skyBlue}
    >
      <PlayfulPressable
        onPress={onPress}
        disabled={disabled}
        bounce
        style={[
          styles.outer,
          recording && styles.outerRecording,
          disabled && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          recording
            ? "Stop recording"
            : mode === "photo"
              ? "Take photo"
              : "Start recording"
        }
      >
        <View style={[styles.inner, recording && styles.innerRecording]} />
      </PlayfulPressable>
    </PulseGlow>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 5,
    borderColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  outerRecording: {
    borderColor: colors.coralDeep,
  },
  disabled: {
    opacity: 0.45,
  },
  inner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surfaceRaised,
  },
  innerRecording: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.coralDeep,
  },
});
