import type { Adventure } from "@/domain/adventure/types";
import type { Discovery } from "@/domain/discovery/types";
import type { JourneySnapshot } from "@/domain/journey/types";
import type { Memory } from "@/domain/memory/types";
import type { AdventureService } from "@/services/AdventureService";
import type { DiscoveryService } from "@/services/DiscoveryService";
import type { JourneyService } from "@/services/JourneyService";
import type { MemoryService } from "@/services/MemoryService";

export type CaptureResult = {
  discovery: Discovery;
  memory: Memory;
  adventures: Adventure[];
  journey: JourneySnapshot;
  discoveryPoints: number;
  badgeTitle: string | null;
};

/**
 * Orchestrates the Discovery Journey without coupling UI to repositories.
 * Library is intentionally never touched here.
 */
export class DiscoveryJourneyService {
  constructor(
    private readonly discoveries: DiscoveryService,
    private readonly memories: MemoryService,
    private readonly adventures: AdventureService,
    private readonly journey: JourneyService,
  ) {}

  async capturePhoto(mediaUri: string): Promise<CaptureResult> {
    const discovery = await this.discoveries.capturePhoto(mediaUri);
    return this.afterDiscovery(discovery);
  }

  async captureVideo(mediaUri: string): Promise<CaptureResult> {
    const discovery = await this.discoveries.captureMedia("video", mediaUri);
    return this.afterDiscovery(discovery);
  }

  async captureVoice(mediaUri: string): Promise<CaptureResult> {
    const discovery = await this.discoveries.captureMedia("voice", mediaUri);
    return this.afterDiscovery(discovery);
  }

  private async afterDiscovery(discovery: Discovery): Promise<CaptureResult> {
    const memory = await this.memories.createFromDiscovery(discovery);
    const adventures = await this.adventures.unlockFromMemory(memory);
    const completedCount = adventures.filter(
      (item) => item.status === "completed",
    ).length;
    await this.memories.setAdventuresCompleted(memory.id, completedCount);
    const journey = await this.journey.getSnapshot();

    const discoveryPoints = 50 + adventures.length * 5;
    const badgeTitle =
      journey.badges.length > 0
        ? journey.badges[journey.badges.length - 1]?.title ?? null
        : null;

    return {
      discovery,
      memory,
      adventures,
      journey,
      discoveryPoints,
      badgeTitle,
    };
  }
}
