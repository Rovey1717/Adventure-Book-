import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, motion } from "@/constants/theme";

type Props = {
  /** Soft glow pulse for primary CTAs */
  active?: boolean;
  color?: string;
  children: React.ReactNode;
};

/**
 * Gentle pulsing glow around a primary action — never flashy.
 */
export function PulseGlow({
  active = true,
  color = colors.skyBlue,
  children,
}: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, {
          duration: motion.slow + 100,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(1, {
          duration: motion.slow + 100,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
  }, [active, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    shadowColor: color,
    shadowOpacity: active ? 0.35 : 0.12,
    shadowRadius: active ? 16 : 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: active ? 6 : 3,
  }));

  return <Animated.View style={[styles.wrap, style]}>{children}</Animated.View>;
}

/**
 * Tiny sparkle row for achievement moments.
 */
export function SparkleRow({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.sparkleRow}>
      {Array.from({ length: count }).map((_, i) => (
        <Sparkle key={i} delay={i * 120} />
      ))}
    </View>
  );
}

function Sparkle({ delay }: { delay: number }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 500 }),
        ),
        -1,
        true,
      ),
    );
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 700, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  const glyphs = ["✨", "⭐", "🌟"];
  return (
    <Animated.Text style={[{ fontSize: 18 }, style]}>
      {glyphs[delay % glyphs.length]}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 999,
  },
  sparkleRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
