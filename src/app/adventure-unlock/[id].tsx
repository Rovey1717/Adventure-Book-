import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MagicalBackground,
  PlayfulPressable,
  PulseGlow,
  SoftCard,
  SparkleRow,
} from "@/components/ui";
import { colors, fonts, radii, shadows, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { getDemoLearningProfile } from "@/domain/parent/profile";
import {
  learningLevelForAge,
  definitionForLevel,
} from "@/intelligence/types/progression";

/**
 * Shown after a Learning Card is completed when an Adventure unlocks.
 *
 * Flow: Celebrate → Adventure Unlock → age-appropriate activity
 * related to that adventure → Adventure Card.
 * Never jumps to unrelated educational content (e.g. random Spanish).
 */
export default function AdventureUnlockScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memories, lastCapture, markUnlockSeen, getAdventuresForMemory } =
    useApp();

  const memory = useMemo(
    () => memories.find((item) => item.id === id) ?? lastCapture?.memory ?? null,
    [id, lastCapture?.memory, memories],
  );

  const unlock = memory?.learningCard?.unlockCandidate;
  const profile = getDemoLearningProfile();
  const level = definitionForLevel(learningLevelForAge(profile.age));
  const discoveryName = memory?.objectName ?? "discovery";

  const nextActivity = useMemo(() => {
    switch (level.level) {
      case 1:
        return {
          title: `Point & name`,
          prompt: `What color is the ${discoveryName}? Can you point to it?`,
        };
      case 2:
        return {
          title: `Community helper`,
          prompt: `Who uses a ${discoveryName}? Match what helpers need.`,
        };
      case 3:
        return {
          title: `How it works`,
          prompt: `Why do we need a ${discoveryName}?`,
        };
      case 4:
        return {
          title: `Investigate`,
          prompt: `How does a ${discoveryName} work?`,
        };
      case 5:
        return {
          title: `Community research`,
          prompt: `How does your local community use a ${discoveryName}?`,
        };
    }
  }, [discoveryName, level.level]);

  const goToAdventure = async () => {
    if (memory) await markUnlockSeen(memory.id);
    const adventures = memory
      ? await getAdventuresForMemory(memory.id)
      : [];
    const preferred =
      adventures.find((a) => a.kind !== "language") ?? adventures[0];
    if (preferred) {
      router.replace(`/adventure/${preferred.id}`);
    } else {
      router.replace("/(tabs)/adventures");
    }
  };

  return (
    <MagicalBackground variant="lavender">
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <SparkleRow count={6} />
        <Text style={styles.party}>🎉</Text>
        <Text style={styles.eyebrow}>Adventure Unlocked!</Text>
        <View style={styles.emojiRing}>
          <Text style={styles.emoji}>{unlock?.emoji ?? "✨"}</Text>
        </View>
        <Text style={styles.title}>{unlock?.title ?? "New Adventure"}</Text>
        <Text style={styles.body}>
          {unlock?.subtitle ??
            "Keep discovering in the real world to grow this adventure."}
        </Text>

        <SoftCard tint="lavender" float style={styles.nextCard}>
          <View style={styles.nextBox}>
            <Text style={styles.nextEyebrow}>
              Next for Level {level.level} · {level.label}
            </Text>
            <Text style={styles.nextTitle}>{nextActivity.title}</Text>
            <Text style={styles.nextBody}>{nextActivity.prompt}</Text>
          </View>
        </SoftCard>

        <PulseGlow color={colors.coral}>
          <PlayfulPressable style={styles.primary} onPress={() => void goToAdventure()}>
            <Text style={styles.primaryText}>Start this activity →</Text>
          </PlayfulPressable>
        </PulseGlow>

        <PlayfulPressable
          style={styles.secondary}
          onPress={() => void goToAdventure()}
        >
          <Text style={styles.secondaryText}>View Adventure Card</Text>
        </PlayfulPressable>

        <PlayfulPressable
          style={styles.tertiary}
          bounce={false}
          onPress={() => {
            void (async () => {
              if (memory) await markUnlockSeen(memory.id);
              router.replace("/");
            })();
          }}
        >
          <Text style={styles.tertiaryText}>Maybe Later</Text>
        </PlayfulPressable>
      </View>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  party: { fontSize: 40 },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    letterSpacing: 0.4,
    color: colors.lavenderInk,
  },
  emojiRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.pastelYellow,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
    borderWidth: 4,
    borderColor: colors.surfaceRaised,
    ...shadows.float,
  },
  emoji: { fontSize: 56 },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: colors.navy,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 4,
  },
  nextCard: {
    alignSelf: "stretch",
    marginVertical: 8,
  },
  nextBox: {
    padding: 18,
    gap: 6,
  },
  nextEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.grassDeep,
  },
  nextTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  nextBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  primary: {
    alignSelf: "stretch",
    backgroundColor: colors.coral,
    borderRadius: radii.xl,
    paddingVertical: 18,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
    ...shadows.float,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.surfaceRaised,
  },
  secondary: {
    alignSelf: "stretch",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    paddingVertical: 18,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: colors.lavender,
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.lavenderInk,
  },
  tertiary: {
    alignSelf: "stretch",
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
  },
  tertiaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.inkSoft,
  },
});
