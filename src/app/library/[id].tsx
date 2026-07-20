import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
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
  DiscoveryHero,
  FactSection,
  FamilyMemoryCard,
  LearningStages,
  QuizSection,
  QuickActionGrid,
  RelatedDiscoveries,
  VideoCard,
  WhyThisIsNext,
  type QuickActionId,
} from "@/components/discovery-card";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import { DEMO_CHILD_NAME } from "@/domain/parent/profile";

type SectionKey = "watch" | "facts" | "quiz" | "activities" | "adventure";

/**
 * Discovery Card generated from a Learning Graph node.
 * Related / Continue Exploring / Next Adventure all come from graph traversal.
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
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({});
  const [soundHint, setSoundHint] = useState<string | null>(null);
  const [, bump] = useState(0);

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
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.missingTitle}>Discovery not found</Text>
        <Pressable style={styles.backPill} onPress={() => router.back()}>
          <Text style={styles.backPillText}>Go back</Text>
        </Pressable>
      </View>
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
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
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
          <Pressable
            style={styles.circleButton}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <Text style={styles.circleButtonText}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{entry.title}</Text>
            <Text style={styles.headerSubtitle}>Discovery Card</Text>
          </View>
          <Pressable
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
          </Pressable>
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

        {graphNode?.description ? (
          <Text style={styles.description}>{graphNode.description}</Text>
        ) : null}

        {progress ? (
          <View style={styles.masteryRow}>
            <Text style={styles.masteryText}>
              Video {progress.watchedVideo ? "✅" : "○"} · Quiz{" "}
              {progress.completedQuiz ? "✅" : "○"} · Adventure{" "}
              {progress.completedAdventure ? "✅" : "○"} · Mastery{" "}
              {progress.masteryScore}%
            </Text>
          </View>
        ) : null}

        {soundHint ? <Text style={styles.soundHint}>{soundHint}</Text> : null}

        <QuickActionGrid onPress={onQuickAction} />

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
            learningGraph.child.getProfile().name || DEMO_CHILD_NAME
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

        {entry.hasQuiz ? (
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

        <View
          style={styles.activitiesNote}
          onLayout={onSectionLayout("activities")}
        >
          <Text style={styles.activitiesTitle}>🎯 Activities</Text>
          <Text style={styles.activitiesBody}>
            Draw, count, listen, and explore more after you unlock the{" "}
            {entry.title} Adventure from a real-world discovery.
          </Text>
        </View>

        <ContinueExploring items={continueItems} onSelect={openNode} />

        <Text style={styles.footnote}>
          Connected through the Garden Learning Graph. Memories and Adventures
          still come from Discover — not from browsing alone.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  centered: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.stroke,
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
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navySoft,
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
    borderRadius: radii.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  masteryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
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
  missingTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.navy,
    textAlign: "center",
  },
  backPill: {
    backgroundColor: colors.navy,
    borderRadius: radii.pill,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  backPillText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
});
