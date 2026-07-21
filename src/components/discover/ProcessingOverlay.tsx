import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  visible: boolean;
  message?: string;
};

const SPARKLES = ["✨", "🔍", "🌟"];

export function ProcessingOverlay({
  visible,
  message = "Looking closely…",
}: Props) {
  const bob = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    bob.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 480, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 480, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    spin.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 420, easing: Easing.inOut(Easing.sin) }),
        withTiming(8, { duration: 420, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [bob, spin, visible]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bob.value },
      { rotate: `${spin.value}deg` },
    ],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <LinearGradient
        colors={["rgba(182,224,255,0.5)", "rgba(197,168,240,0.42)"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        entering={FadeIn.duration(220)}
        style={[styles.card, shadows.float]}
      >
        <Animated.Text style={[styles.emoji, bobStyle]}>🔎</Animated.Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.sparkleRow}>
          {SPARKLES.map((glyph, i) => (
            <Text key={i} style={styles.sparkle}>
              {glyph}
            </Text>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xxl,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: "center",
    gap: 12,
    minWidth: 220,
    borderWidth: 2,
    borderColor: colors.pastelBlue,
  },
  emoji: {
    fontSize: 44,
  },
  message: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
    textAlign: "center",
  },
  sparkleRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  sparkle: {
    fontSize: 16,
  },
});
