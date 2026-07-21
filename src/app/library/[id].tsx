import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AdventureBanner,
  ContinueExploring,
  ConversationPromptsSection,
  DiscoveryHero,
  DiscoveryMemoryStatsBar,
  FactSection,
  FamilyMemoryCard,
  LearningStages,
  MemoryTimeline,
  QuizSection,
  QuickActionGrid,
  RelatedDiscoveries,
  VideoCard,
  WhyThisIsNext,
  quickActionsForMode,
  type QuickActionId,
} from "@/components/discovery-card";
import { MagicalBackground, PlayfulPressable } from "@/components/ui";
import { colors, fonts, radii, shadows, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import { getLearningProfile } from "@/domain/parent/profile";
import { useLearningMode } from "@/hooks/useLearningMode";
import {
  DEMO_INTELLIGENCE_CHILD_ID,
  getIntelligenceLayer,
} from "@/intelligence/createIntelligenceLayer";
import type { DiscoveryMemoryTimeline } from "@/intelligence/types/discoveryMemoryTimeline";

type SectionKey = "watch" | "facts" | "quiz" | "activities" | "adventure";

/**
 * Discovery Card generated from a Learning Graph node.
 * Related / Continue Exploring / Next Adventure all come from graph traversal.
 *
 * Memory Timeline queries the Memory Graph — the card stores no memory data.
 */
export default function LibraryDiscoveryCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    library,
    learningGraph,
    memories,
    adventureBoard,
    toggleFavorite,
    startAdventure,
  } = useApp();
  const { features, definition, profile } = useLearningMode();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({});
  const [soundHint, setSoundHint] = useState<string | null>(null);
  const [, bump] = useState(0);
  const [memoryTimeline, setMemoryTimeline] =
    useState<DiscoveryMemoryTimeline | null>(null);

  const entry = useMemo(
    () => (id ? library.getEntry(id) : null),
    [id, library],
  );

  const graphNode = useMemo(
    () => (id ? learningGraph.getNode(id) : null),
    [id, learningGraph],
  );

  const category = useMemo(() => {
    if (!entry) return null;
    return (
      library.getCategories().find((item) => item.id === entry.categoryId) ??
      null
    );
  }, [entry, library]);

  const memory = useMemo(() => {
    if (!entry) return null;
    return (
      memories.find(
        (item) =>
          item.objectName.toLowerCase() === entry.title.toLowerCase(),
      ) ?? null
    );
  }, [entry, memories]);

  const related = useMemo(
    () => (id ? learningGraph.relatedDiscoveries(id, 4) : []),
    [id, learningGraph],
  );

  const continueItems = useMemo(
    () => (id ? learningGraph.continueExploring(id, 4) : []),
    [id, learningGraph],
  );

  const recommendation = useMemo(() => {
    if (!id) return null;
    return learningGraph.recommendFrom(id);
  }, [id, learningGraph, memories, bump]);

  const progress = useMemo(
    () => (id ? learningGraph.progressFor(id) : null),
    [id, learningGraph, bump, memories],
  );

  const relatedAdventure = useMemo(() => {
    if (!memory) return null;
    return (
      adventureBoard.continueAdventure.find(
        (item) => item.memoryId === memory.id,
      ) ??
      adventureBoard.newAdventures.find((item) => item.memoryId === memory.id) ??
      adventureBoard.recentlyUnlocked.find(
        (item) => item.memoryId === memory.id,
      ) ??
      null
    );
  }, [adventureBoard, memory]);

  useEffect(() => {
    let cancelled = false;
    if (!entry) {
      setMemoryTimeline(null);
      return;
    }

    void (async () => {
      const { familyAI } = await getIntelligenceLayer();
      const timeline = await familyAI.discoveryMemoryTimeline({
        childId: DEMO_INTELLIGENCE_CHILD_ID,
        discoveryTitle: entry.title,
      });
      if (!cancelled) setMemoryTimeline(timeline);
    })();

    return () => {
      cancelled = true;
    };
  }, [entry, memories]);

  const onSectionLayout =
    (key: SectionKey) => (event: LayoutChangeEvent) => {
      sectionY.current[key] = event.nativeEvent.layout.y;
    };

  const scrollTo = (key: SectionKey) => {
    const y = sectionY.current[key];
    if (typeof y === "number") {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  };

  const openNode = (nodeId: string) => {
    router.push(`/library/${nodeId}`);
  };

  const onQuickAction = (actionId: QuickActionId) => {
    switch (actionId) {
      case "watch":
        scrollTo("watch");
        break;
      case "sounds":
      case "languages":
        setSoundHint(
          actionId === "sounds"
            ? `Playing ${entry?.title ?? "discovery"} sounds…`
            : `${entry?.title ?? "Word"} · ${entry?.pronunciation ?? ""}`,
        );
        break;
      case "facts":
        scrollTo("facts");
        break;
      case "quiz":
        scrollTo("quiz");
        break;
      case "activities":
        scrollTo("activities");
        break;
    }
  };

  const onStartAdventure = async () => {
    if (!memory) return;
    if (relatedAdventure) {
      if (relatedAdventure.status === "unlocked") {
        await startAdventure(relatedAdventure.id);
      }
      router.push(`/adventure/${relatedAdventure.id}`);
      return;
    }
    router.push("/(tabs)/adventures");
  };

  if (!entry) {
    return (
      <MagicalBackground variant="cream">
        <View style={styles.centered}>
          <Text style={styles.missingEmoji}>🔍</Text>
          <Text style={styles.missingTitle}>Discovery not found</Text>
          <PlayfulPressable style={styles.backPill} onPress={() => router.back()}>
            <Text style={styles.backPillText}>Go back</Text>
          </PlayfulPressable>
        </View>
      </MagicalBackground>
    );
  }

  const emoji =
    graphNode?.emoji ??
    emojiForLibraryEntry(entry.title, entry.categoryId);
  const categoryLabel =
    graphNode?.category === "plants"
      ? "Plants"
      : graphNode?.category === "concepts"
        ? "Science"
        : category?.title ?? "Garden";
  const discovered = !!memory;
  const metaDate = memory
    ? new Date(memory.discoveredAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : learningGraph.world.ecosystemTitle();

  const masteryLabel = progress
    ? `Mastery ${progress.masteryScore}%`
    : null;

  return (
    <MagicalBackground variant="cream" decorated={false}>
      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 36,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <PlayfulPressable
            style={styles.circleButton}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <Text style={styles.circleButtonText}>‹</Text>
          </PlayfulPressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{entry.title}</Text>
            <Text style={styles.headerSubtitle}>Discovery Card</Text>
          </View>
          <PlayfulPressable
            style={styles.circleButton}
            onPress={() => {
              if (!memory) {
                Alert.alert(
                  "Save a memory first",
                  "Favorite lives in Adventure Book after you discover this in the real world.",
                );
                return;
              }
              void toggleFavorite(memory.id);
            }}
            accessibilityLabel="Favorite"
          >
            <Text style={styles.circleButtonText}>
              {memory?.isFavorite ? "♥" : "♡"}
            </Text>
          </PlayfulPressable>
        </View>

        <DiscoveryHero
          title={entry.title}
          categoryLabel={categoryLabel}
          emoji={emoji}
          meta={metaDate}
          isFavorite={!!memory?.isFavorite}
          onPlaySound={() =>
            setSoundHint(`${entry.title} · ${entry.pronunciation}`)
          }
        />

        {memoryTimeline ? (
          <DiscoveryMemoryStatsBar stats={memoryTimeline.stats} />
        ) : null}

        {graphNode?.description ? (
          <Text style={styles.description}>{graphNode.description}</Text>
        ) : null}

        {progress ? (
          <View style={styles.masteryRow}>
            <Text style={styles.masteryText}>
              Video {progress.watchedVideo ? "✅" : "○"} ·{" "}
              {features.quizzes
                ? "Quiz"
                : features.conversationPrompts
                  ? "Coach"
                  : "Learn"}{" "}
              {progress.completedQuiz ? "✅" : "○"} · Adventure{" "}
              {progress.completedAdventure ? "✅" : "○"} · Mastery{" "}
              {progress.masteryScore}%
            </Text>
          </View>
        ) : null}

        {soundHint ? <Text style={styles.soundHint}>{soundHint}</Text> : null}

        <QuickActionGrid
          actions={quickActionsForMode(features)}
          onPress={onQuickAction}
        />

        <View onLayout={onSectionLayout("adventure")}>
          <AdventureBanner
            objectName={entry.title}
            unlocked={discovered}
            onStart={() => {
              void onStartAdventure();
            }}
          />
        </View>

        <RelatedDiscoveries items={related} onSelect={openNode} />

        <WhyThisIsNext
          recommendation={recommendation}
          masteryLabel={
            recommendation?.fromNodeId === id ? masteryLabel : null
          }
          onOpen={openNode}
        />

        <LearningStages
          objectName={entry.title}
          childName={
            learningGraph.child.getProfile().name || getLearningProfile().name
          }
        />

        {entry.hasVideo ? (
          <View onLayout={onSectionLayout("watch")}>
            <VideoCard
              objectName={entry.title}
              childName={learningGraph.child.getProfile().name}
              onPlay={() => {
                if (id) {
                  learningGraph.markWatchedVideo(id);
                  bump((value) => value + 1);
                }
                Alert.alert(
                  "Video coming soon",
                  `A real-world ${entry.title.toLowerCase()} video will play here.`,
                );
              }}
            />
          </View>
        ) : null}

        {memory ? <FamilyMemoryCard memory={memory} /> : null}

        <View onLayout={onSectionLayout("facts")}>
          <FactSection facts={entry.facts} vocabulary={entry.vocabulary} />
        </View>

        {features.quizzes && entry.hasQuiz ? (
          <View onLayout={onSectionLayout("quiz")}>
            <QuizSection
              objectName={entry.title}
              questions={entry.quiz}
              onComplete={() => {
                if (id) {
                  learningGraph.markQuizCompleted(id);
                  bump((value) => value + 1);
                }
              }}
            />
          </View>
        ) : null}

        {features.conversationPrompts &&
        features.parentPromptCount > 0 ? (
          <View onLayout={onSectionLayout("quiz")}>
            <ConversationPromptsSection
              objectName={entry.title}
              childName={profile.name}
              promptCount={features.parentPromptCount}
            />
          </View>
        ) : null}

        <View
          style={styles.activitiesNote}
          onLayout={onSectionLayout("activities")}
        >
          <Text style={styles.activitiesTitle}>
            {features.projects ? "🛠️ Projects" : "🎯 Activities"}
          </Text>
          <Text style={styles.activitiesBody}>
            {definition.tone.libraryHint}. Unlock more after a real-world{" "}
            {entry.title} discovery.
          </Text>
        </View>

        {memoryTimeline ? (
          <MemoryTimeline timeline={memoryTimeline} emoji={emoji} />
        ) : null}

        <ContinueExploring items={continueItems} onSelect={openNode} />

        <Text style={styles.footnote}>
          Connected through the Garden Learning Graph. Memories and Adventures
          still come from Discover — not from browsing alone.
        </Text>
      </ScrollView>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 16,
  },
  content: {
    paddingHorizontal: space.screen,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.pastelBlue,
    ...shadows.soft,
  },
  circleButtonText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.navy,
    lineHeight: 24,
  },
  headerCopy: {
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.navy,
  },
  headerSubtitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.lavenderInk,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.navySoft,
    textAlign: "center",
    marginTop: -6,
  },
  masteryRow: {
    backgroundColor: colors.pastelBlue,
    borderRadius: radii.xl,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: colors.skyBlue,
  },
  masteryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.navy,
    textAlign: "center",
  },
  soundHint: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.lavenderInk,
    textAlign: "center",
    marginTop: -6,
  },
  activitiesNote: {
    backgroundColor: colors.pastelYellow,
    borderRadius: radii.xl,
    padding: 18,
    gap: 6,
    borderWidth: 2,
    borderColor: colors.sunshine,
  },
  activitiesTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.navy,
  },
  activitiesBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.navySoft,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 4,
  },
  missingEmoji: {
    fontSize: 48,
  },
  missingTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.navy,
    textAlign: "center",
  },
  backPill: {
    backgroundColor: colors.skyBlue,
    borderRadius: radii.pill,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: "center",
    ...shadows.soft,
  },
  backPillText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
});
