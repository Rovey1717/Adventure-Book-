import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/constants/theme";
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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outer,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        recording
          ? "Stop recording"
          : mode === "photo"
            ? "Take photo"
            : mode === "library"
              ? "Open library"
              : "Start recording"
      }
    >
      <View
        style={[
          styles.inner,
          recording && styles.innerRecording,
          mode === "library" && styles.innerLibrary,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: colors.cameraInk,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.45,
  },
  inner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cameraInk,
  },
  innerRecording: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
  },
  innerLibrary: {
    backgroundColor: colors.orange,
  },
});
