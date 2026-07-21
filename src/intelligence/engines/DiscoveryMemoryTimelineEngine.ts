import type { GraphEngine } from "@/intelligence/engines/GraphEngine";
import { ageAtTimestamp } from "@/intelligence/engines/LivingDiscoveryCardEngine";
import type {
  DiscoveryMemoryStats,
  DiscoveryMemoryTimeline,
  DiscoveryMemoryTimelineEntry,
} from "@/intelligence/types/discoveryMemoryTimeline";
import type { ChildId } from "@/intelligence/types/ids";
import type { MemoryNode } from "@/intelligence/types/memory";

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function relativePastLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "recently";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function pluralDiscoveryLabel(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "this discovery";
  if (/s$/i.test(trimmed)) return trimmed;
  return `${trimmed}s`;
}

/**
 * Discovery Memory Timeline Engine — Memory Graph → Discovery Card view model.
 * UI renders the result; business logic stays here.
 */
export class DiscoveryMemoryTimelineEngine {
  constructor(private readonly graph: GraphEngine) {}

  async forDiscovery(input: {
    childId: ChildId | string;
    discoveryTitle: string;
    worldNodeId?: string;
  }): Promise<DiscoveryMemoryTimeline> {
    const title = input.discoveryTitle.trim() || "this discovery";
    const emptyMessage = `You haven't made any memories with ${pluralDiscoveryLabel(title)} yet.\n\nLet's go find one!`;

    const child = await this.graph.child.getById(input.childId);
    let world = input.worldNodeId
      ? await this.graph.world.getById(input.worldNodeId)
      : null;
    if (!world) {
      world = await this.graph.world.resolveByDiscoveryName(title);
    }

    if (!world || !child) {
      return {
        discoveryTitle: title,
        worldNodeId: world?.id ?? null,
        stats: emptyStats(),
        headline: null,
        entries: [],
        isEmpty: true,
        emptyMessage,
      };
    }

    const raw = await this.graph.memory.listForWorldNode(world.id);
    const memories = raw
      .filter((m) => m.childId === child.id)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    if (memories.length === 0) {
      return {
        discoveryTitle: title,
        worldNodeId: world.id,
        stats: emptyStats(),
        headline: null,
        entries: [],
        isEmpty: true,
        emptyMessage,
      };
    }

    const chronological = [...memories].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const firstId = chronological[0]?.id;
    const adventureTitles = await this.resolveAdventureTitles(memories);

    const entries: DiscoveryMemoryTimelineEntry[] = memories.map((memory) => {
      const childAge =
        memory.childAge ?? ageAtTimestamp(child, memory.timestamp);
      const adventureId = memory.adventureId;
      const adventureBadge = adventureId
        ? adventureTitles.get(String(adventureId)) ?? null
        : this.fallbackAdventureBadge(memory, adventureTitles);

      return {
        memoryId: memory.id,
        title: memory.discoveryLabel || title,
        childAge,
        dateLabel: formatMonthYear(memory.timestamp),
        timestamp: memory.timestamp,
        photoUri: memory.photos[0]?.uri ?? null,
        hasVoiceMemo: memory.voiceMemos.length > 0,
        hasVideo: memory.videos.length > 0,
        adventureBadge,
        adventureId,
        isFirst: memory.id === firstId,
        favorite: memory.favorite,
        notes: memory.notes,
      };
    });

    const stats = this.buildStats(memories, chronological[0]?.timestamp ?? null);
    const count = memories.length;
    const headline =
      count === 1
        ? "✨ First Discovery"
        : `❤️ You've discovered ${pluralDiscoveryLabel(title)} ${count} times.`;

    return {
      discoveryTitle: title,
      worldNodeId: world.id,
      stats,
      headline,
      entries,
      isEmpty: false,
      emptyMessage,
    };
  }

  private buildStats(
    memories: MemoryNode[],
    firstSeenAt: string | null,
  ): DiscoveryMemoryStats {
    const adventureIds = new Set<string>();
    let photoCount = 0;
    let videoCount = 0;

    for (const memory of memories) {
      photoCount += memory.photos.length;
      videoCount += memory.videos.length;
      if (memory.adventureId) {
        adventureIds.add(String(memory.adventureId));
      }
      for (const id of Object.keys(memory.adventureProgress)) {
        adventureIds.add(id);
      }
    }

    return {
      memoryCount: memories.length,
      photoCount,
      videoCount,
      adventureCount: adventureIds.size,
      firstSeenAt,
      firstSeenLabel: firstSeenAt ? relativePastLabel(firstSeenAt) : null,
    };
  }

  private async resolveAdventureTitles(
    memories: MemoryNode[],
  ): Promise<Map<string, string>> {
    const ids = new Set<string>();
    for (const memory of memories) {
      if (memory.adventureId) ids.add(String(memory.adventureId));
      for (const id of Object.keys(memory.adventureProgress)) ids.add(id);
    }
    const map = new Map<string, string>();
    for (const id of ids) {
      const adventure = await this.graph.adventure.getById(id);
      if (adventure) map.set(id, adventure.title);
    }
    return map;
  }

  private fallbackAdventureBadge(
    memory: MemoryNode,
    titles: Map<string, string>,
  ): string | null {
    const firstKey = Object.keys(memory.adventureProgress)[0];
    if (!firstKey) return null;
    return titles.get(firstKey) ?? null;
  }
}

function emptyStats(): DiscoveryMemoryStats {
  return {
    memoryCount: 0,
    photoCount: 0,
    videoCount: 0,
    adventureCount: 0,
    firstSeenAt: null,
    firstSeenLabel: null,
  };
}
