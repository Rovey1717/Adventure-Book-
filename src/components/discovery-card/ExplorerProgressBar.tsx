import { StyleSheet, Text, View } from "react-native";
import { AnimatedProgressBar, SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import {
  unlockLabel,
  type ExplorerProgress,
} from "@/domain/progression/explorerXp";

type Props = {
  progress: ExplorerProgress;
  /** Compact strip for Discovery Card header. */
  compact?: boolean;
};

/**
 * Explorer Level + XP — continuous progress across every discovery.
 */
export function ExplorerProgressBar({ progress, compact = false }: Props) {
  const nextHint =
    progress.xpForNextLevel > 0
      ? `${progress.xpForNextLevel} XP to Level ${progress.level + 1}`
      : "Max explorer aura — keep discovering!";

  return (
    <SoftCard tint="aqua">
      <View style={[styles.card, compact && styles.cardCompact]}>
        <View style={styles.row}>
          <Text style={styles.emoji}>{progress.emoji}</Text>
          <View style={styles.copy}>
            <Text style={styles.level}>
              Level {progress.level} · {progress.title}
            </Text>
            {!compact ? (
              <Text style={styles.hint}>{nextHint}</Text>
            ) : (
              <Text style={styles.hint}>{progress.totalXp} XP</Text>
            )}
          </View>
          <Text style={styles.xp}>{progress.totalXp} XP</Text>
        </View>
        <AnimatedProgressBar progress={progress.progressToNext * 100} />
        {progress.justLeveledUp ? (
          <Text style={styles.levelUp}>
            Level up!{" "}
            {progress.unlocks.map(unlockLabel).join(" · ") || "New explorer powers"}
          </Text>
        ) : null}
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 10,
  },
  cardCompact: {
    padding: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emoji: {
    fontSize: 28,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  level: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.navy,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  xp: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.lavenderDeep,
  },
  levelUp: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.grassDeep,
    textAlign: "center",
  },
});
