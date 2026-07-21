import { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Vibration,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, motion, radii, randomPraise } from "@/constants/theme";

type Props = {
  discoveryName: string;
  emoji?: string;
  onFinished: () => void;
  durationMs?: number;
};

const CONFETTI = [
  "🎉",
  "✨",
  "🌟",
  "💛",
  "🧡",
  "🎊",
  "⭐",
  "🌈",
  "🎈",
  "💫",
];
const STAR_COLORS = [
  colors.sunshine,
  colors.coral,
  colors.skyBlue,
  colors.lavender,
  colors.aqua,
  colors.grass,
];

/**
 * Discovery celebration (2–3s): confetti burst, floating stars,
 * glowing background, "You Found It!", reward badge pop.
 * Tap anywhere to skip.
 */
export function CelebrationBurst({
  discoveryName,
  emoji = "✨",
  onFinished,
  durationMs = motion.celebration,
}: Props) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(0.4);
  const badge = useSharedValue(0);
  const glow = useSharedValue(0);
  const message = useSharedValue(0);
  const onFinishedRef = useRef(onFinished);
  const finishedRef = useRef(false);
  const praiseRef = useRef(randomPraise());

  onFinishedRef.current = onFinished;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinishedRef.current();
  };

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.18, { damping: 8, stiffness: 160 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
    badge.value = withDelay(
      380,
      withSpring(1, { damping: 10, stiffness: 180 }),
    );
    glow.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0.55, { duration: 900 }),
      withTiming(0.85, { duration: 700 }),
    );
    message.value = withDelay(
      180,
      withSpring(1, { damping: 11, stiffness: 170 }),
    );

    if (Platform.OS !== "web") {
      try {
        Vibration.vibrate([0, 40, 60, 40]);
      } catch {
        // Haptics optional.
      }
    }

    const timer = setTimeout(finish, durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [durationMs]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badge.value,
    transform: [
      { scale: badge.value },
      { translateY: (1 - badge.value) * 24 },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.55,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: message.value,
    transform: [{ scale: 0.85 + message.value * 0.15 }],
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
        <LinearGradient
          colors={[colors.pastelPink, colors.pastelYellow, colors.pastelBlue]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, glowStyle]}
        />

        {/* Confetti particles */}
        {CONFETTI.map((glyph, index) => (
          <ConfettiPiece
            key={`c-${index}`}
            glyph={glyph}
            index={index}
            screenW={width}
            screenH={height}
          />
        ))}

        {/* Floating stars */}
        {STAR_COLORS.map((color, index) => (
          <FloatingStar
            key={`s-${index}`}
            color={color}
            index={index}
            screenW={width}
          />
        ))}

        <Animated.View style={[styles.hero, heroStyle]}>
          <LinearGradient
            colors={[colors.pastelYellow, colors.pastelOrange]}
            style={styles.heroFill}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={messageStyle}>
          <Text style={styles.found}>You Found It!</Text>
          <Text style={styles.title}>You found a {discoveryName}!</Text>
          <Text style={styles.praise}>{praiseRef.current}</Text>
        </Animated.View>

        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeEmoji}>🏅</Text>
          <Text style={styles.badgeText}>Discovery Star</Text>
        </Animated.View>

        <Text style={styles.skip}>Tap to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

function ConfettiPiece({
  glyph,
  index,
  screenW,
  screenH,
}: {
  glyph: string;
  index: number;
  screenW: number;
  screenH: number;
}) {
  const x = useSharedValue((index / CONFETTI.length) * screenW);
  const y = useSharedValue(-40);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const targetX = (index / CONFETTI.length) * screenW + (index % 2 === 0 ? -20 : 20);
    const targetY = screenH * (0.25 + (index % 5) * 0.08);
    opacity.value = withDelay(index * 40, withTiming(1, { duration: 200 }));
    y.value = withDelay(
      index * 35,
      withTiming(targetY, {
        duration: 1400 + index * 40,
        easing: Easing.out(Easing.cubic),
      }),
    );
    x.value = withDelay(
      index * 35,
      withTiming(targetX, { duration: 1400, easing: Easing.out(Easing.quad) }),
    );
    rot.value = withDelay(
      index * 35,
      withRepeat(
        withTiming(index % 2 === 0 ? 28 : -28, { duration: 600 }),
        -1,
        true,
      ),
    );
  }, [index, opacity, rot, screenH, screenW, x, y]);

  const style = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: x.value,
    top: y.value,
    opacity: opacity.value,
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return <Animated.Text style={[styles.confetti, style]}>{glyph}</Animated.Text>;
}

function FloatingStar({
  color,
  index,
  screenW,
}: {
  color: string;
  index: number;
  screenW: number;
}) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const left = 24 + ((index * 57) % Math.max(80, screenW - 60));

  useEffect(() => {
    opacity.value = withDelay(
      200 + index * 80,
      withTiming(0.9, { duration: 400 }),
    );
    y.value = withDelay(
      200 + index * 80,
      withRepeat(
        withSequence(
          withTiming(-14, {
            duration: 900,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(8, {
            duration: 900,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, [index, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        { left, top: 90 + (index % 3) * 36, backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  rootPress: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.sunshine,
  },
  confetti: {
    fontSize: 26,
    zIndex: 2,
  },
  star: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  hero: {
    width: 132,
    height: 132,
    borderRadius: 66,
    marginBottom: 4,
    ...{
      shadowColor: colors.sunshine,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  heroFill: {
    flex: 1,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surfaceRaised,
  },
  emoji: {
    fontSize: 60,
  },
  found: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: colors.coralDeep,
    textAlign: "center",
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 24,
    lineHeight: 30,
    color: colors.navy,
    textAlign: "center",
    marginTop: 4,
  },
  praise: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.lavenderInk,
    textAlign: "center",
    marginTop: 6,
  },
  badge: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.sunshine,
    minHeight: 48,
    ...{
      shadowColor: colors.sunshine,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  skip: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 18,
  },
});
