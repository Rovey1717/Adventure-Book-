import { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Vibration,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, fonts } from "@/constants/theme";

type Props = {
  discoveryName: string;
  emoji?: string;
  onFinished: () => void;
  durationMs?: number;
};

const CONFETTI = ["🎉", "✨", "🌟", "💛", "🧡", "🎊"];

/**
 * Short celebration burst (2–4s) before the Learning Card.
 * Tap anywhere to skip — immediately calls onFinished.
 *
 * onFinished is read from a ref so parent re-renders (e.g. memory refresh)
 * do not clear/restart the completion timer.
 */
export function CelebrationBurst({
  discoveryName,
  emoji = "✨",
  onFinished,
  durationMs = 2800,
}: Props) {
  const scale = useSharedValue(0.6);
  const pop = useSharedValue(0);
  const onFinishedRef = useRef(onFinished);
  const finishedRef = useRef(false);

  onFinishedRef.current = onFinished;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinishedRef.current();
  };

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.12, { duration: 420, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1, { duration: 280 }),
    );
    pop.value = withDelay(200, withTiming(1, { duration: 500 }));

    if (Platform.OS !== "web") {
      try {
        Vibration.vibrate(40);
      } catch {
        // Haptics optional on all platforms.
      }
    }

    const timer = setTimeout(finish, durationMs);
    return () => clearTimeout(timer);
    // Only restart if duration changes — never when onFinished identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [durationMs]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={styles.rootPress}
      onPress={finish}
      accessibilityRole="button"
      accessibilityLabel="Skip celebration"
    >
      <Animated.View
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(200)}
        style={styles.root}
      >
        <View style={styles.confettiRow}>
          {CONFETTI.map((glyph, index) => (
            <Text key={`${glyph}-${index}`} style={styles.confetti}>
              {glyph}
            </Text>
          ))}
        </View>
        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </Animated.View>
        <Text style={styles.title}>You found a {discoveryName}!</Text>
        <Text style={styles.subtitle}>Let's celebrate this discovery</Text>
        <Text style={styles.skip}>Tap to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rootPress: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 12,
  },
  confettiRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  confetti: {
    fontSize: 28,
  },
  hero: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.pastelYellow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.navy,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.inkMuted,
    textAlign: "center",
  },
  skip: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 16,
  },
});
