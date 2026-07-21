import { StyleSheet, Text, View } from "react-native";
import { PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import type { FamilyAiNextLesson } from "@/domain/discovery-card/familyAiNextLesson";
import { xpForLessonKind } from "@/domain/progression/explorerXp";

type Props = {
  next: FamilyAiNextLesson;
  discoveryEmoji: string;
  preferIconsOverText?: boolean;
  onContinue: () => void;
};

/**
 * ONE obvious next lesson — Family AI chooses; child just plays.
 */
export function ContinueLearningHero({
  next,
  discoveryEmoji,
  preferIconsOverText = false,
  onContinue,
}: Props) {
  const { step, reason, invitation } = next;
  const xp = xpForLessonKind(step.xpKind);
  const realmLabel =
    step.realm === "real_world"
      ? "Real-world mission"
      : step.realm === "connection"
        ? "World connection"
        : "Tiny lesson";
  const realmEmoji =
    step.realm === "real_world"
      ? "🌍"
      : step.realm === "connection"
        ? "🔗"
        : "📖";

  return (
    <SoftCard tint="lavender" shimmer>
      <View style={styles.card}>
        <Text style={styles.emoji}>
          {step.connectionEmoji ?? discoveryEmoji}
        </Text>
        {!preferIconsOverText ? (
          <Text style={styles.eyebrow}>Family AI · Next up</Text>
        ) : null}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {realmEmoji} {realmLabel} · +{xp} XP
          </Text>
        </View>
        <Text style={styles.title}>{step.title}</Text>
        {!preferIconsOverText ? (
          <>
            <Text style={styles.body}>{step.subtitle}</Text>
            <Text style={styles.reason}>{reason}</Text>
          </>
        ) : null}
        <PlayfulPressable
          style={styles.cta}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel={invitation}
        >
          <Text style={styles.ctaText}>⭐ {invitation}</Text>
        </PlayfulPressable>
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 22,
    gap: 10,
    alignItems: "center",
  },
  emoji: {
    fontSize: 48,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.lavenderDeep,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: colors.pastelPurple,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.lavenderInk,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 26,
    lineHeight: 32,
    color: colors.navy,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: "center",
  },
  reason: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: colors.lavenderDeep,
    textAlign: "center",
  },
  cta: {
    marginTop: 8,
    backgroundColor: colors.coral,
    borderRadius: radii.pill,
    paddingVertical: 16,
    paddingHorizontal: 28,
    minWidth: "80%",
    alignItems: "center",
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.cameraInk,
  },
});
