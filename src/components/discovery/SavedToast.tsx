import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  message: string;
  onDone: () => void;
};

/**
 * Lightweight success toast after Continue Exploring.
 */
export function SavedToast({ message, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      2200,
      withTiming(0, { duration: 280 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [onDone, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.toast,
        shadows.soft,
        style,
        { top: insets.top + 12 },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>✓ {message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    alignSelf: "center",
    left: 24,
    right: 24,
    backgroundColor: colors.navy,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    zIndex: 30,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.cameraInk,
    textAlign: "center",
  },
});
