import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { CelebrationBurst } from "@/components/discovery/CelebrationBurst";
import { LearningCard } from "@/components/learning-card";
import {
  MagicalBackground,
  PlayfulPressable,
  PulseGlow,
  SoftCard,
  SparkleRow,
} from "@/components/ui";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useLearningMode } from "@/hooks/useLearningMode";

/**
 * Learning Card route — works after Celebrate Now and from Adventure Book.
 *
 * Celebrate Now passes `celebrate=1`. The burst plays once, then we
 * automatically show the Learning Card. A ref guards against the effect
 * re-entering celebration when memories refresh after markLearningViewed.
 */
export default function LearningScreen() {
  const { id, celebrate } = useLocalSearchParams<{
    id: string;
    celebrate?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    memories,
    lastCapture,
    ensureLearningCard,
    markLearningViewed,
    completeLearningCard,
  } = useApp();

  const { definition, features } = useLearningMode();

  const memoryId = typeof id === "string" ? id : id?.[0] ?? "";
  const celebrateParam = typeof celebrate === "string" ? celebrate : celebrate?.[0];

  const memory = useMemo(
    () =>
      memories.find((item) => item.id === memoryId) ??
      (lastCapture?.memory.id === memoryId ? lastCapture.memory : null) ??
      lastCapture?.memory ??
      null,
    [lastCapture?.memory, memories, memoryId],
  );

  const wantsInitialCelebration =
    celebrateParam === "1" || memory?.learningViewStatus === "never_viewed";

  const celebrationFinishedRef = useRef(false);
  const [phase, setPhase] = useState<"celebration" | "card" | "loading">(
    "loading",
  );
  const [cardReady, setCardReady] = useState(false);

  useEffect(() => {
    if (!memoryId) return;
    let cancelled = false;

    void (async () => {
      await ensureLearningCard(memoryId);
      if (cancelled) return;
      setCardReady(true);

      // Never re-enter celebration after the burst has finished.
      if (celebrationFinishedRef.current) {
        setPhase("card");
        return;
      }

      setPhase(wantsInitialCelebration ? "celebration" : "card");
    })();

    return () => {
      cancelled = true;
    };
    // Depend on memoryId only — memory object refresh must not restart celebration.
  }, [ensureLearningCard, memoryId, wantsInitialCelebration]);

  const showLearningCard = useCallback(() => {
    if (celebrationFinishedRef.current) {
      setPhase("card");
      return;
    }
    celebrationFinishedRef.current = true;
    setPhase("card");
    if (memoryId) void markLearningViewed(memoryId);
  }, [markLearningViewed, memoryId]);

  const card = useMemo(() => {
    const latest =
      memories.find((item) => item.id === memoryId) ??
      (lastCapture?.memory.id === memoryId ? lastCapture.memory : null) ??
      memory;
    return latest?.learningCard ?? null;
  }, [lastCapture?.memory, memories, memory, memoryId]);

  const heroEmoji = useMemo(() => {
    const hero = card?.modules.find((m) => m.type === "hero");
    return hero && hero.type === "hero" ? hero.emoji : "✨";
  }, [card]);

  const discoveryName = memory?.objectName ?? "Discovery";

  if (!memoryId || phase === "loading" || !cardReady || !card || !memory) {
    return <PlayfulLoading />;
  }

  return (
    <MagicalBackground variant="cream" decorated={phase !== "celebration"}>
      {phase === "celebration" ? (
        <CelebrationBurst
          discoveryName={discoveryName}
          emoji={heroEmoji}
          onFinished={showLearningCard}
        />
      ) : (
        <LearningCard
          modules={card.modules}
          contentPaddingTop={insets.top + 16}
          contentPaddingBottom={insets.bottom + 28}
          header={
            <View style={styles.headerRow}>
              <PlayfulPressable
                onPress={() => router.replace("/(tabs)")}
                hitSlop={12}
                accessibilityLabel="Back to Discover"
                style={styles.backBtn}
              >
                <Text style={styles.back}>← Back</Text>
              </PlayfulPressable>
              <Text style={styles.headerLabel}>
                {features.conversationPrompts &&
                features.parentPromptCount > 0 &&
                !features.quizzes
                  ? "Parent coaching"
                  : features.projects || features.storyCreation
                    ? "Explorer card"
                    : "Learning Card"}
              </Text>
              <View style={styles.backSpacer} />
            </View>
          }
          footer={
            <PulseGlow color={colors.coral}>
              <PlayfulPressable
                style={styles.done}
                onPress={() => {
                  void (async () => {
                    const unlock = await completeLearningCard(memoryId);
                    if (unlock) {
                      router.replace(`/adventure-unlock/${memoryId}`);
                    } else {
                      router.replace("/(tabs)/adventure-book");
                    }
                  })();
                }}
              >
                <Text style={styles.doneText}>
                  {definition.tone.learningCta} ⭐
                </Text>
              </PlayfulPressable>
            </PulseGlow>
          }
        />
      )}
    </MagicalBackground>
  );
}

function PlayfulLoading() {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 500, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration: 500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [bob]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <MagicalBackground variant="cream">
      <View style={styles.loading}>
        <SoftCard tint="yellow" float>
          <View style={styles.loadingInner}>
            <SparkleRow count={4} />
            <Animated.Text style={[styles.loadingEmoji, style]}>
              🔍
            </Animated.Text>
            <Text style={styles.meta}>Preparing your learning adventure…</Text>
          </View>
        </SoftCard>
      </View>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingInner: {
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  loadingEmoji: {
    fontSize: 48,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.inkMuted,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  backBtn: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  back: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.skyBlue,
    width: 72,
  },
  backSpacer: { width: 72 },
  headerLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.lavenderInk,
  },
  done: {
    backgroundColor: colors.coral,
    borderRadius: radii.xl,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    minHeight: 56,
    justifyContent: "center",
    ...shadows.float,
  },
  doneText: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.surfaceRaised,
  },
});
