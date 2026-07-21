import type { Adventure } from "@/domain/adventure/types";
import type { PendingDiscovery } from "@/domain/discovery/pending";
import type { Discovery } from "@/domain/discovery/types";
import type { JourneySnapshot } from "@/domain/journey/types";
import type { Memory } from "@/domain/memory/types";
import type { MemoryCategory } from "@/domain/shared/categories";
import { interestLabelForCategory } from "@/domain/family/applyDiscoveryToProfile";
import {
  DEMO_INTELLIGENCE_CHILD_ID,
  getIntelligenceLayer,
} from "@/intelligence/createIntelligenceLayer";
import { familyAIProfileService } from "@/services/family/FamilyAIProfileService";
import type { AdventureService } from "@/services/AdventureService";
import type { DiscoveryService } from "@/services/DiscoveryService";
import type { JourneyService } from "@/services/JourneyService";
import type { MemoryService } from "@/services/MemoryService";
import type { RecognitionService } from "@/services/recognition/RecognitionService";
import { libraryRepository } from "@/data/library/LibraryRepository";

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
 * Capture flow (only path that creates progress):
 *   capture → name → Memory (saved immediately) → Learning Adventure (background)
 *   → Decision: Celebrate Now | Continue Exploring
 *
 * Also writes a Memory Graph entry so Living Discovery Cards grow a lifelong timeline.
 *
 * Search / Library is a separate knowledge path and must never call this service
 * for memories, adventures, or journey updates.
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

    // Living Discovery Card: always append a Memory Graph entry (never overwrite).
    const relatedNames = await this.appendMemoryGraphEntry(discovery);

    // Family AI Profile — every discovery makes personalization smarter.
    this.updateFamilyAIProfile(memory, adventures, relatedNames);

    // Mirror growing interests onto the Child Graph for engines.
    await this.syncChildGraphFromProfile();

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

  /**
   * Update structured Family AI knowledge after a real-world discovery.
   * Fire Truck → Vehicles interest, vocabulary, Community Helpers, future finds.
   */
  private updateFamilyAIProfile(
    memory: Memory,
    adventures: Adventure[],
    relatedNames: string[],
  ): void {
    const libraryEntry =
      libraryRepository
        .getEntries()
        .find(
          (item) =>
            item.title.toLowerCase() === memory.objectName.toLowerCase(),
        ) ?? null;

    familyAIProfileService.applyDiscovery({
      memory,
      adventures,
      vocabularyWords: libraryEntry?.vocabulary ?? [],
      relatedNames,
      interestCategory: interestLabelForCategory(memory.category),
    });
  }

  private async syncChildGraphFromProfile(): Promise<void> {
    try {
      const profile = familyAIProfileService.get();
      const { graph } = await getIntelligenceLayer();
      const child = await graph.child.getById(profile.childId);
      if (!child) return;
      await graph.child.update(profile.childId, {
        favoriteCategories: profile.interests,
      });
    } catch {
      // Profile SSOT still holds the truth if Child Graph sync fails.
    }
  }

  private async appendMemoryGraphEntry(
    discovery: Discovery,
  ): Promise<string[]> {
    try {
      const { graph } = await getIntelligenceLayer();
      const recorded = await graph.recordDiscovery({
        childId:
          familyAIProfileService.getChildId() || DEMO_INTELLIGENCE_CHILD_ID,
        discoveryLabel: discovery.objectName,
        mediaType: discovery.mediaType,
        mediaUri: discovery.mediaUri,
        location: discovery.location
          ? {
              latitude: discovery.location.latitude,
              longitude: discovery.location.longitude,
            }
          : null,
        locationLabel: discovery.locationLabel,
        timestamp: discovery.createdAt,
        notes: null,
      });

      const world = recorded.world;
      if (world?.relatedNodeIds?.length) {
        const related = await Promise.all(
          world.relatedNodeIds.slice(0, 6).map((id) => graph.world.getById(id)),
        );
        return related.filter(Boolean).map((node) => node!.name);
      }
      return [];
    } catch {
      // Legacy Adventure Book save still succeeds if intelligence layer fails.
      return [];
    }
  }
}
