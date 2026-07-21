import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContinueLearningHero } from "@/components/discovery-card/ContinueLearningHero";
import { DiscoveryCardAdventuresSection } from "@/components/discovery-card/DiscoveryCardAdventuresSection";
import { DiscoveryCardCollectionsSection } from "@/components/discovery-card/DiscoveryCardCollectionsSection";
import { DiscoveryCardLearningJourneySection } from "@/components/discovery-card/DiscoveryCardLearningJourneySection";
import { DiscoveryCardMyJourneySection } from "@/components/discovery-card/DiscoveryCardMyJourneySection";
import { DiscoveryCardSectionTabs } from "@/components/discovery-card/DiscoveryCardSectionTabs";
import { DiscoveryCardWhatsNextSection } from "@/components/discovery-card/DiscoveryCardWhatsNextSection";
import { DiscoveryHero } from "@/components/discovery-card/DiscoveryHero";
import { ExplorerProgressBar } from "@/components/discovery-card/ExplorerProgressBar";
import { LessonPlayer } from "@/components/discovery-card/LessonPlayer";
import { MagicalBackground, PlayfulPressable } from "@/components/ui";
import { colors, fonts, shadows, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { buildAdventureJourneyPath } from "@/domain/discovery-card/adventureJourneyPath";
import { collectionsForDiscoveryCard } from "@/domain/discovery-card/collectionsForCard";
import { familyAiNextLesson } from "@/domain/discovery-card/familyAiNextLesson";
import {
  buildLearningJourneyPath,
  type LearningJourneyStep,
  type LearningJourneyStepId,
} from "@/domain/discovery-card/learningJourneyPath";
import {
  DISCOVERY_CARD_DEFAULT_SECTION,
  sectionsForIds,
  type DiscoveryCardSectionId,
} from "@/domain/discovery-card/sections";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import type { ExplorerProgress } from "@/domain/progression/explorerXp";
import { progressiveDisclosureForAge } from "@/domain/ui/progressiveDisclosure";
import { useFamilyAIProfile } from "@/hooks/useFamilyAIProfile";
import { useLearningMode } from "@/hooks/useLearningMode";
import {
  DEMO_INTELLIGENCE_CHILD_ID,
  getIntelligenceLayer,
} from "@/intelligence/createIntelligenceLayer";
import {
  buildNextMeaningfulExperienceInput,
  NextMeaningfulExperienceEngine,
} from "@/intelligence/engines/NextMeaningfulExperienceEngine";
import type { DiscoveryMemoryTimeline } from "@/intelligence/types/discoveryMemoryTimeline";

const nextEngine = new NextMeaningfulExperienceEngine();

/**
 * Lifelong Discovery Card — living destination for one discovery.
 * Continue Learning is always the primary next action.
 * UI complexity grows with the child via progressive disclosure.
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
  const { features, profile: learningProfile } = useLearningMode();
  const { profile: familyProfile } = useFamilyAIProfile();

  const [section, setSection] = useState<DiscoveryCardSectionId>(
    DISCOVERY_CARD_DEFAULT_SECTION,
  );
  const [activeLesson, setActiveLesson] = useState<LearningJourneyStep | null>(
    null,
  );
  const [soundHint, setSoundHint] = useState<string | null>(null);
  const [memoryTimeline, setMemoryTimeline] =
    useState<DiscoveryMemoryTimeline | null>(null);
  const [, bump] = useState(0);
  const [explorerProgress, setExplorerProgress] = useState<ExplorerProgress>(
    () => learningGraph.explorerProgress(),
  );
  const [levelUpFlash, setLevelUpFlash] = useState<ExplorerProgress | null>(
    null,
  );

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

  const discoveryMemories = useMemo(() => {
    if (!entry) return [];
    return memories.filter(
      (item) =>
        item.objectName.toLowerCase() === entry.title.toLowerCase(),
    );
  }, [entry, memories]);

  const memory = discoveryMemories[0] ?? null;

  const related = useMemo(
    () => (id ? learningGraph.relatedDiscoveries(id, 4) : []),
    [id, learningGraph],
  );

  const progress = useMemo(
    () => (id ? learningGraph.progressFor(id) : null),
    [id, learningGraph, bump, memories],
  );

  const discoveryAdventures = useMemo(() => {
    if (!entry) return [];
    const all = [
      ...adventureBoard.newAdventures,
      ...adventureBoard.continueAdventure,
      ...adventureBoard.completed,
      ...adventureBoard.recentlyUnlocked,
    ];
    const key = entry.title.toLowerCase();
    const matched = all.filter(
      (item) => item.objectName.toLowerCase() === key,
    );
    const seen = new Set<string>();
    return matched.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [adventureBoard, entry]);

  const relatedAdventure = discoveryAdventures[0] ?? null;

  const collections = useMemo(() => {
    if (!entry) return [];
    const names = memories.map((item) => item.objectName);
    return collectionsForDiscoveryCard(entry.title, names);
  }, [entry, memories]);

  const childAge = learningProfile.age ?? familyProfile.currentAge ?? 5;
  const disclosure = useMemo(
    () => progressiveDisclosureForAge(childAge),
    [childAge],
  );
  const visibleSections = useMemo(
    () => sectionsForIds(disclosure.discoverySections),
    [disclosure.discoverySections],
  );

  const journeySteps = useMemo(() => {
    if (!entry) return [];
    const completedSteps = Object.fromEntries(
      (progress?.completedLessonSteps ?? []).map((stepId) => [stepId, true]),
    ) as Partial<Record<LearningJourneyStepId, boolean>>;
    const neighbors = related.slice(0, 3).map((item) => ({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
    }));
    return buildLearningJourneyPath({
      discoveryTitle: entry.title,
      childAge,
      discovered: !!memory,
      completedSteps,
      watchedVideo: progress?.watchedVideo,
      heardPronunciation: progress?.watchedVideo,
      completedQuiz: progress?.completedQuiz,
      completedPictureQuiz: progress?.completedQuiz,
      completedChallenge: progress?.completedAdventure,
      foundThree:
        !!completedSteps.find_three ||
        !!completedSteps.find_another ||
        (discoveryMemories.length ?? 0) >= 3,
      masteryScore: progress?.masteryScore,
      neighbors,
      features,
    });
  }, [
    entry,
    memory,
    progress,
    features,
    childAge,
    discoveryMemories.length,
    related,
  ]);

  const familyNext = useMemo(
    () =>
      familyAiNextLesson({
        steps: journeySteps,
        discoveryTitle: entry?.title ?? "discovery",
        childName: learningProfile.name,
        childAge,
        recentCompletedIds: progress?.completedLessonSteps,
      }),
    [
      journeySteps,
      entry?.title,
      learningProfile.name,
      childAge,
      progress?.completedLessonSteps,
    ],
  );
  const nextLesson = familyNext?.step ?? null;

  const adventurePath = useMemo(() => {
    if (!entry) return [];
    const completedCount = discoveryAdventures.filter(
      (item) => item.status === "completed",
    ).length;
    const inProgressCount = discoveryAdventures.filter(
      (item) => item.status === "in_progress",
    ).length;
    return buildAdventureJourneyPath({
      discoveryTitle: entry.title,
      discovered: !!memory,
      foundOne: !!memory,
      completedAdventureCount: completedCount,
      inProgressAdventureCount: inProgressCount,
      adventureCompleted: completedCount >= 4,
    });
  }, [entry, memory, discoveryAdventures]);

  const whatsNext = useMemo(() => {
    if (!entry) return null;
    return nextEngine.recommend(
      buildNextMeaningfulExperienceInput(familyProfile, {
        currentDiscovery: entry.title,
      }),
    );
  }, [entry, familyProfile]);

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

  useEffect(() => {
    setSection(DISCOVERY_CARD_DEFAULT_SECTION);
    setActiveLesson(null);
  }, [entry?.id]);

  useEffect(() => {
    if (!disclosure.discoverySections.includes(section)) {
      setSection(
        disclosure.discoverySections[0] ?? DISCOVERY_CARD_DEFAULT_SECTION,
      );
      setActiveLesson(null);
    }
  }, [disclosure.discoverySections, section]);

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

  const openLessonActivity = (step: LearningJourneyStep) => {
    if (step.status === "locked" || step.status === "coming_soon") return;
    // Every tap begins an interactive lesson — never a static info card.
    setSection("continue_learning");
    setActiveLesson(step);
  };

  const completeLesson = (stepId: LearningJourneyStepId) => {
    if (!id) return;
    const step =
      activeLesson?.id === stepId
        ? activeLesson
        : journeySteps.find((item) => item.id === stepId);
    const result = learningGraph.markLessonComplete(
      id,
      stepId,
      step?.xpKind ?? "digital",
    );
    setExplorerProgress(result);
    if (result.justLeveledUp) {
      setLevelUpFlash(result);
    }
    bump((value) => value + 1);
    setActiveLesson(null);
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
  const metaDate = memory
    ? new Date(memory.discoveredAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Lifelong learning home";

  const adventuresCompleted = discoveryAdventures.filter(
    (item) => item.status === "completed",
  ).length;

  return (
    <MagicalBackground variant="cream" decorated={false}>
      <ScrollView
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
            <Text style={styles.headerSubtitle}>Your living discovery</Text>
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

        {soundHint && !activeLesson ? (
          <Text style={styles.soundHint}>{soundHint}</Text>
        ) : null}

        {!activeLesson ? (
          <ExplorerProgressBar
            progress={levelUpFlash ?? explorerProgress}
            compact
          />
        ) : null}

        {familyNext && !activeLesson ? (
          <ContinueLearningHero
            next={familyNext}
            discoveryEmoji={emoji}
            preferIconsOverText={disclosure.preferIconsOverText}
            onContinue={() => {
              setSection("continue_learning");
              openLessonActivity(familyNext.step);
            }}
          />
        ) : null}

        {visibleSections.length > 1 && !activeLesson ? (
          <DiscoveryCardSectionTabs
            active={section}
            sections={visibleSections}
            iconsOnly={disclosure.preferIconsOverText}
            onChange={(next) => {
              setSection(next);
              if (next !== "continue_learning") setActiveLesson(null);
            }}
          />
        ) : null}

        {section === "my_journey" ? (
          <DiscoveryCardMyJourneySection
            discoveryTitle={entry.title}
            timeline={memoryTimeline}
            memories={discoveryMemories}
            adventuresCompleted={adventuresCompleted}
          />
        ) : null}

        {section === "continue_learning" ? (
          <View style={styles.stack}>
            {activeLesson ? (
              <LessonPlayer
                step={activeLesson}
                context={{
                  discoveryTitle: entry.title,
                  emoji,
                  pronunciation: entry.pronunciation,
                  vocabulary: entry.vocabulary,
                  facts: entry.facts,
                  quiz: entry.quiz,
                  childName: learningProfile.name,
                  connectionName: activeLesson.connectionName,
                  connectionEmoji: activeLesson.connectionEmoji,
                }}
                onComplete={completeLesson}
                onBack={() => setActiveLesson(null)}
                onOpenDiscover={() => router.push("/(tabs)")}
              />
            ) : (
              <DiscoveryCardLearningJourneySection
                discoveryTitle={entry.title}
                steps={
                  disclosure.showFullLearningPath
                    ? journeySteps
                    : nextLesson
                      ? [nextLesson]
                      : journeySteps.slice(0, 1)
                }
                onSelectStep={openLessonActivity}
              />
            )}
          </View>
        ) : null}

        {section === "adventures" &&
        disclosure.discoverySections.includes("adventures") ? (
          <DiscoveryCardAdventuresSection
            discoveryTitle={entry.title}
            path={adventurePath}
            adventures={discoveryAdventures}
            discovered={!!memory}
            onStartPrimary={() => {
              void onStartAdventure();
            }}
            onOpenAdventure={(adventureId) =>
              router.push(`/adventure/${adventureId}`)
            }
            onSelectPathStep={() => {
              void onStartAdventure();
            }}
          />
        ) : null}

        {section === "collections" &&
        disclosure.discoverySections.includes("collections") ? (
          <DiscoveryCardCollectionsSection
            discoveryTitle={entry.title}
            collections={collections}
          />
        ) : null}

        {section === "whats_next" &&
        disclosure.discoverySections.includes("whats_next") ? (
          <DiscoveryCardWhatsNextSection
            discoveryTitle={entry.title}
            nextLesson={nextLesson}
            experience={whatsNext}
            onOpenLesson={(step) => {
              setSection("continue_learning");
              openLessonActivity(step);
            }}
          />
        ) : null}
      </ScrollView>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.screen,
    gap: 14,
  },
  stack: {
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
    ...shadows.soft,
  },
  circleButtonText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.navy,
    marginTop: -2,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  soundHint: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.skyBlue,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  missingEmoji: {
    fontSize: 40,
  },
  missingTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
  },
  backPill: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.pastelBlue,
  },
  backPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.navy,
  },
});
