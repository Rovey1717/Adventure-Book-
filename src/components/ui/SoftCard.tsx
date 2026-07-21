import { useEffect, type ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, radii, shadows } from "@/constants/theme";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Soft pastel gradient wash behind content */
  tint?: "white" | "blue" | "yellow" | "green" | "coral" | "lavender" | "aqua";
  /** Gentle floating bob */
  float?: boolean;
  /** Occasional shimmer highlight */
  shimmer?: boolean;
  /** Staggered enter animation index */
  enterDelay?: number;
};

const TINTS: Record<NonNullable<Props["tint"]>, readonly [string, string]> = {
  white: [colors.surfaceRaised, colors.cream],
  blue: [colors.pastelBlue, colors.surfaceRaised],
  yellow: [colors.pastelYellow, colors.surfaceRaised],
  green: [colors.pastelGreen, colors.surfaceRaised],
  coral: [colors.pastelOrange, colors.surfaceRaised],
  lavender: [colors.pastelPurple, colors.surfaceRaised],
  aqua: ["#D5FBF5", colors.surfaceRaised],
};

/**
 * Soft floating card — layered shadow, rounded corners, optional bob/shimmer.
 */
export function SoftCard({
  children,
  style,
  tint = "white",
  float = false,
  shimmer = false,
  enterDelay = 0,
}: Props) {
  const y = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (float) {
      y.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(4, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    }
    if (shimmer) {
      shine.value = withDelay(
        1200,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 900 }),
            withTiming(0, { duration: 900 }),
            withTiming(0, { duration: 4200 }),
          ),
          -1,
          false,
        ),
      );
    }
  }, [float, shimmer, shine, y]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float ? y.value : 0 }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shine.value * 0.35,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(enterDelay).duration(360).springify()}
      style={[styles.card, shadows.float, floatStyle, style]}
    >
      <LinearGradient colors={[...TINTS[tint]]} style={styles.fill}>
        {children}
      </LinearGradient>
      {shimmer ? (
        <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceRaised,
  },
  fill: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  shimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFFFFF",
  },
});
