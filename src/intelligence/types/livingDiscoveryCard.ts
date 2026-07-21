import type { AdventureProgressSnapshot } from "@/intelligence/types/adventure";
import type {
  AgeLearningVariant,
  LearningNode,
  QuizQuestion,
} from "@/intelligence/types/learning";
import type { MemoryMedia, MemoryNode } from "@/intelligence/types/memory";
import type {
  AdventureNodeId,
  ChildId,
  CollectionId,
  LearningNodeId,
  MediaId,
  MemoryNodeId,
  WorldNodeId,
} from "@/intelligence/types/ids";
import type { WorldNode } from "@/intelligence/types/world";

/**
 * LIVING DISCOVERY CARD — composed view model.
 *
 * Never persisted. Built fresh by querying World · Learning · Memory ·
 * Adventure · Child graphs. UI renders this; it does not own memory data.
 *
 * Two equal dimensions: Knowledge (Learn) + Personal Memories (My Journey).
 */

export type LivingDiscoveryCardTab = "learn" | "my_journey";

/** Age-adapted Learn tab content from the Learning Graph. */
export type LearnSection = {
  worldNodeId: WorldNodeId;
  learningNodeId: LearningNodeId | null;
  title: string;
  description: string;
  emoji: string | null;
  heroMediaIds: MediaId[];
  videos: MediaId[];
  sounds: MediaId[];
  vocabulary: string[];
  pronunciation: string | null;
  funFacts: string[];
  quiz: QuizQuestion[];
  wonderQuestions: string[];
  challenge: string | null;
  relatedDiscoveries: Array<{
    worldNodeId: WorldNodeId;
    name: string;
    emoji: string | null;
  }>;
  relatedAdventures: Array<{
    adventureId: AdventureNodeId;
    title: string;
    progressRatio: number;
    unlocked: boolean;
    completed: boolean;
  }>;
  creatorStories: MediaId[];
  ageRangeLabel: string | null;
  childAge: number;
  /** Raw learning node + variant for advanced UI (optional). */
  learningNode: LearningNode | null;
  ageVariant: AgeLearningVariant | null;
};

/** One real-life interaction with this discovery — a Memory Graph entry. */
export type JourneyMemoryEntry = {
  memoryId: MemoryNodeId;
  date: string;
  childAge: number | null;
  title: string;
  photos: MemoryMedia[];
  videos: MemoryMedia[];
  voiceMemos: MemoryMedia[];
  locationLabel: string | null;
  peoplePresent: string[];
  emotion: string | null;
  parentNotes: string | null;
  questionsAsked: string[];
  activitiesCompleted: string[];
  storyId: string | null;
  adventureProgress: Record<string, number>;
  badgesEarned: string[];
  favorite: boolean;
  /** Scrapbook-friendly summary line for timeline UI. */
  scrapbookLine: string;
};

/** Chronological scrapbook timeline grouped loosely by age. */
export type JourneyTimelineGroup = {
  childAge: number | null;
  label: string;
  entries: JourneyMemoryEntry[];
};

/** How I've Grown — earliest → newest learning progression. */
export type GrowthMilestone = {
  childAge: number | null;
  date: string;
  memoryId: MemoryNodeId | null;
  summary: string;
};

export type HowIveGrown = {
  milestones: GrowthMilestone[];
  earliest: GrowthMilestone | null;
  newest: GrowthMilestone | null;
};

/** Graph-related discoveries that also appear in this child's memories. */
export type RelatedMemoryLink = {
  worldNodeId: WorldNodeId;
  name: string;
  emoji: string | null;
  memoryCount: number;
  latestMemoryAt: string | null;
};

/** Emotionally meaningful family moments surfaced for warmth. */
export type FamilyMoment = {
  kind:
    | "first_discovery"
    | "voice_memo"
    | "photo"
    | "people"
    | "favorite"
    | "note"
    | "location";
  title: string;
  detail: string;
  memoryId: MemoryNodeId;
  date: string;
  childAge: number | null;
};

export type CollectionProgressItem = {
  collectionId: CollectionId;
  label: string;
  discoveredCount: number;
  /** Unknown total until collection catalog is fully modeled — null means unknown. */
  totalKnown: number | null;
};

export type LearningGoalProgress = {
  goal: string;
  status: "active" | "practiced" | "mastered";
};

export type FamilyGoalProgress = {
  id: string;
  title: string;
  completed: boolean;
  relevant: boolean;
};

export type CollectionProgressSection = {
  collections: CollectionProgressItem[];
  adventures: AdventureProgressSnapshot[];
  learningGoals: LearningGoalProgress[];
  familyGoals: FamilyGoalProgress[];
  curiosityStreakDays: number;
};

export type MyJourneySection = {
  timeline: JourneyTimelineGroup[];
  memories: JourneyMemoryEntry[];
  howIveGrown: HowIveGrown;
  relatedMemories: RelatedMemoryLink[];
  familyMoments: FamilyMoment[];
  collectionProgress: CollectionProgressSection;
  memoryCount: number;
  firstDiscoveredAt: string | null;
  lastVisitedAt: string | null;
};

/**
 * Full Living Discovery Card — Knowledge + Personal Memories.
 * Card stores nothing; this is a query result.
 */
export type LivingDiscoveryCard = {
  childId: ChildId;
  worldNodeId: WorldNodeId;
  world: WorldNode;
  childName: string;
  childAge: number;
  learn: LearnSection;
  myJourney: MyJourneySection;
  /** Default tab: journey if memories exist, else learn. */
  defaultTab: LivingDiscoveryCardTab;
  composedAt: string;
};
