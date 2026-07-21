import type {
  AdventureNodeId,
  MemoryNodeId,
  WorldNodeId,
} from "@/intelligence/types/ids";

/**
 * Discovery Card Memory Timeline — UI view model.
 * Built by querying the Memory Graph; never persisted on the card.
 */

export type DiscoveryMemoryTimelineEntry = {
  memoryId: MemoryNodeId;
  title: string;
  childAge: number | null;
  dateLabel: string;
  timestamp: string;
  photoUri: string | null;
  hasVoiceMemo: boolean;
  hasVideo: boolean;
  adventureBadge: string | null;
  adventureId: AdventureNodeId | null;
  isFirst: boolean;
  favorite: boolean;
  notes: string | null;
};

export type DiscoveryMemoryStats = {
  memoryCount: number;
  photoCount: number;
  videoCount: number;
  adventureCount: number;
  firstSeenAt: string | null;
  firstSeenLabel: string | null;
};

export type DiscoveryMemoryTimeline = {
  discoveryTitle: string;
  worldNodeId: WorldNodeId | null;
  stats: DiscoveryMemoryStats;
  /** "✨ First Discovery" or "❤️ You've discovered X N times." */
  headline: string | null;
  entries: DiscoveryMemoryTimelineEntry[];
  isEmpty: boolean;
  emptyMessage: string;
};
