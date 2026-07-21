import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import { pickCelebrationCheer } from "@/domain/celebration/messages";

type Props = {
  message: string;
  childName?: string;
  onDone: () => void;
};

/**
 * Playful success toast after Continue Exploring — personalized when possible.
 */
export function SavedToast({ message, childName, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.9);
  const cheerRef = useRef(
    pickCelebrationCheer({
      childName: childName?.trim() || "Explorer",
      seed: `${message}:${Date.now()}`,
    }),
  );

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    opacity.value = withDelay(
      2200,
      withTiming(0, { duration: 280 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [onDone, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(280).springify()}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.toast,
        shadows.float,
        style,
        { top: insets.top + 12 },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.star}>⭐</Text>
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.cheer}>{cheerRef.current}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    alignSelf: "center",
    left: 24,
    right: 24,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    paddingVertical: 16,
    paddingHorizontal: 18,
    zIndex: 30,
    alignItems: "center",
    gap: 2,
    borderWidth: 2.5,
    borderColor: colors.grass,
  },
  star: {
    fontSize: 22,
    marginBottom: 2,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
    textAlign: "center",
  },
  cheer: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.grassDeep,
  },
});
