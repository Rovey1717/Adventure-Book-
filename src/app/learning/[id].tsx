import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CelebrationBurst } from "@/components/discovery/CelebrationBurst";
import { LearningCard } from "@/components/learning-card";
import { colors, fonts, radii } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

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
    return (
      <View style={styles.loading}>
        <Text style={styles.meta}>Preparing your learning adventure…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.skyTop, colors.cream, colors.skyBottom]}
        style={StyleSheet.absoluteFill}
      />

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
              <Pressable
                onPress={() => router.replace("/(tabs)")}
                hitSlop={12}
                accessibilityLabel="Back to Discover"
              >
                <Text style={styles.back}>Back</Text>
              </Pressable>
              <Text style={styles.headerLabel}>Learning Card</Text>
              <View style={styles.backSpacer} />
            </View>
          }
          footer={
            <Pressable
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
              <Text style={styles.doneText}>Finish Learning Card</Text>
            </Pressable>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
    padding: 24,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkMuted,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  back: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.moss,
    width: 64,
  },
  backSpacer: { width: 64 },
  headerLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.inkSoft,
  },
  done: {
    backgroundColor: colors.orange,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  doneText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
});
