import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { PlayfulPressable } from "@/components/ui";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  title: string;
  categoryLabel: string;
  emoji: string;
  meta?: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPlaySound?: () => void;
};

export function DiscoveryHero({
  title,
  categoryLabel,
  emoji,
  meta,
  isFavorite = false,
  onToggleFavorite,
  onPlaySound,
}: Props) {
  const bob = useSharedValue(0);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [bob]);

  useEffect(() => {
    heartScale.value = withSequence(
      withSpring(1.35, { damping: 8, stiffness: 320 }),
      withSpring(1, { damping: 10, stiffness: 260 }),
    );
  }, [heartScale, isFavorite]);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <View style={[styles.card, shadows.float]}>
      <LinearGradient
        colors={[colors.pastelPink, colors.pastelYellow, colors.cream]}
        locations={[0, 0.55, 1]}
        style={styles.gradient}
      >
        <View style={styles.sparkleTop} pointerEvents="none">
          <Text style={styles.sparkle}>✦</Text>
          <Text style={[styles.sparkle, styles.sparkleSmall]}>⋆</Text>
        </View>

        <PlayfulPressable
          style={styles.soundButton}
          onPress={onPlaySound}
          accessibilityLabel="Play pronunciation"
          hitSlop={8}
        >
          <Text style={styles.soundIcon}>🔊</Text>
        </PlayfulPressable>

        <Animated.Text style={[styles.emoji, emojiStyle]}>
          {emoji}
        </Animated.Text>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaPill}>
          <Text style={styles.meta}>
            {categoryLabel}
            {meta ? ` · ${meta}` : ""}
          </Text>
        </View>

        {onToggleFavorite ? (
          <PlayfulPressable
            style={styles.favoriteFab}
            onPress={onToggleFavorite}
            accessibilityLabel={isFavorite ? "Unfavorite" : "Favorite"}
            bounce
          >
            <Animated.Text style={[styles.favoriteIcon, heartStyle]}>
              {isFavorite ? "♥" : "♡"}
            </Animated.Text>
          </PlayfulPressable>
        ) : null}

        <View style={styles.mascot} pointerEvents="none">
          <Text style={styles.mascotEmoji}>🦊</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xxl,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: colors.stroke,
  },
  gradient: {
    minHeight: 268,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 34,
  },
  sparkleTop: {
    position: "absolute",
    top: 14,
    left: "42%",
    alignItems: "center",
  },
  sparkle: {
    fontSize: 16,
    color: colors.sunshineDeep,
  },
  sparkleSmall: {
    fontSize: 12,
    marginTop: -2,
    color: colors.coral,
  },
  soundButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  soundIcon: {
    fontSize: 20,
  },
  emoji: {
    fontSize: 92,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.navy,
    textAlign: "center",
  },
  metaPill: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.navySoft,
    textAlign: "center",
  },
  favoriteFab: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  favoriteIcon: {
    fontSize: 22,
    color: colors.coral,
  },
  mascot: {
    position: "absolute",
    right: 18,
    bottom: 10,
  },
  mascotEmoji: {
    fontSize: 36,
  },
});
