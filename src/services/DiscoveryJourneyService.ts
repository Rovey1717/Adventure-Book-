import type { Adventure } from "@/domain/adventure/types";
import type { PendingDiscovery } from "@/domain/discovery/pending";
import type { Discovery } from "@/domain/discovery/types";
import type { JourneySnapshot } from "@/domain/journey/types";
import type { Memory } from "@/domain/memory/types";
import type { MemoryCategory } from "@/domain/shared/categories";
import type { AdventureService } from "@/services/AdventureService";
import type { DiscoveryService } from "@/services/DiscoveryService";
import type { JourneyService } from "@/services/JourneyService";
import type { MemoryService } from "@/services/MemoryService";
import type { RecognitionService } from "@/services/recognition/RecognitionService";

export type CaptureResult = {
  discovery: Discovery;
  memory: Memory;
  adventures: Adventure[];
  journey: JourneySnapshot;
  discoveryPoints: number;
  badgeTitle: string | null;
};

export type NamedDiscoveryLabel = {
  objectName: string;
  category?: MemoryCategory;
};

/**
 * Orchestrates the Discovery Journey without coupling UI to repositories.
 * Library is intentionally never touched here.
 *
 * MVP photo flow: capture → family names it → save discovery / memory / adventures.
 * RecognitionService is optional and unused in MVP. Plug it in later to suggest
 * names without changing saveNamedDiscovery or the overall flow.
 */
export class DiscoveryJourneyService {
  constructor(
    private readonly discoveries: DiscoveryService,
    private readonly memories: MemoryService,
    private readonly adventures: AdventureService,
    private readonly journey: JourneyService,
    /**
     * Reserved for a future optional enhancement.
     * Do not call during MVP photo capture.
     */
    private readonly recognition: RecognitionService | null = null,
  ) {}

  /** Hold a captured photo until the family names it. No AI. */
  beginPhotoDiscovery(mediaUri: string): PendingDiscovery {
    return {
      mediaUri,
      mediaType: "photo",
      capturedAt: new Date().toISOString(),
      suggestedName: null,
    };
  }

  /**
   * Future hook: run RecognitionService and attach a suggestedName.
   * MVP intentionally does not call this.
   */
  async suggestNameForPending(
    pending: PendingDiscovery,
  ): Promise<PendingDiscovery> {
    if (!this.recognition) return pending;
    const analysis = await this.recognition.analyzePhoto(pending.mediaUri);
    return {
      ...pending,
      suggestedName: analysis.result.name,
    };
  }

  /**
   * Persist a named photo discovery, unlock adventures, refresh journey.
   */
  async saveNamedDiscovery(
    mediaUri: string,
    label: NamedDiscoveryLabel,
  ): Promise<CaptureResult> {
    const discovery = await this.discoveries.createPhotoDiscovery(
      mediaUri,
      label.objectName,
    );
    return this.afterDiscovery(discovery, label.category);
  }

  async captureVideo(mediaUri: string): Promise<CaptureResult> {
    const discovery = await this.discoveries.captureMedia("video", mediaUri);
    return this.afterDiscovery(discovery);
  }

  async captureVoice(mediaUri: string): Promise<CaptureResult> {
    const discovery = await this.discoveries.captureMedia("voice", mediaUri);
    return this.afterDiscovery(discovery);
  }

  private async afterDiscovery(
    discovery: Discovery,
    categoryOverride?: MemoryCategory,
  ): Promise<CaptureResult> {
    const memory = await this.memories.createFromDiscovery(
      discovery,
      categoryOverride,
    );
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
