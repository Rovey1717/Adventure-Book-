import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  return (
    <View style={[styles.card, shadows.soft]}>
      <LinearGradient
        colors={[colors.peach, colors.cream, "#FFFCF7"]}
        locations={[0, 0.55, 1]}
        style={styles.gradient}
      >
        <Pressable
          style={styles.soundButton}
          onPress={onPlaySound}
          accessibilityLabel="Play pronunciation"
          hitSlop={8}
        >
          <Text style={styles.soundIcon}>🔊</Text>
        </Pressable>

        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {categoryLabel}
          {meta ? ` · ${meta}` : ""}
        </Text>

        {onToggleFavorite ? (
          <Pressable
            style={styles.favoriteFab}
            onPress={onToggleFavorite}
            accessibilityLabel={isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? "♥" : "♡"}</Text>
          </Pressable>
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
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
  },
  gradient: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  soundButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  soundIcon: {
    fontSize: 18,
  },
  emoji: {
    fontSize: 88,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.navy,
    textAlign: "center",
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.navySoft,
    marginTop: 4,
    textAlign: "center",
  },
  favoriteFab: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  favoriteIcon: {
    fontSize: 20,
    color: colors.orange,
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
