import { type ReactNode } from "react";
import {
  Pressable,
  type AccessibilityRole,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { motion } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Soft bounce + grow on press (default true) */
  bounce?: boolean;
  /** Slight tilt while pressed */
  tilt?: boolean;
  accessibilityRole?: AccessibilityRole;
};

/**
 * Pressable with kid-friendly bounce / scale / optional tilt.
 * Preserves all Pressable behavior — visual only.
 */
export function PlayfulPressable({
  children,
  style,
  bounce = true,
  tilt = false,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        if (bounce && !disabled) {
          scale.value = withSpring(1.06, { damping: 12, stiffness: 280 });
        }
        if (tilt && !disabled) {
          rotate.value = withTiming(-2.5, { duration: motion.fast });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (bounce && !disabled) {
          scale.value = withSequence(
            withSpring(0.97, { damping: 14, stiffness: 320 }),
            withSpring(1, { damping: 12, stiffness: 260 }),
          );
        }
        if (tilt && !disabled) {
          rotate.value = withTiming(0, { duration: motion.fast });
        }
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
