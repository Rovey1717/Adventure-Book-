import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import { AdventureEngine } from "@/intelligence/engines/AdventureEngine";
import { ChildEngine } from "@/intelligence/engines/ChildEngine";
import { LearningEngine } from "@/intelligence/engines/LearningEngine";
import { LearningProgressionEngine } from "@/intelligence/engines/LearningProgressionEngine";
import { MemoryEngine } from "@/intelligence/engines/MemoryEngine";
import { RecommendationEngine } from "@/intelligence/engines/RecommendationEngine";
import { WorldEngine } from "@/intelligence/engines/WorldEngine";
import type { CreateRelationshipInput } from "@/intelligence/types/relationships";
import type { WorldNodeId } from "@/intelligence/types/ids";
import type { ChildId } from "@/intelligence/types/ids";
import type { CreateMemoryNodeInput } from "@/intelligence/types/memory";
import type { ProgressionContext } from "@/intelligence/types/progression";
import type { RecommendationContext } from "@/intelligence/types/recommendations";

/**
 * GraphEngine — central intelligence facade.
 *
 * UI and FamilyAI talk to this layer only — never to raw repositories.
 * Discovery of a real-world thing flows: resolve World → Memory → Child → Adventure progress.
 */
export class GraphEngine {
  readonly world: WorldEngine;
  readonly learning: LearningEngine;
  readonly adventure: AdventureEngine;
  readonly child: ChildEngine;
  readonly memory: MemoryEngine;
  readonly recommendations: RecommendationEngine;
  readonly progression: LearningProgressionEngine;

  constructor(readonly repository: GraphRepository) {
    this.world = new WorldEngine(repository);
    this.learning = new LearningEngine(repository);
    this.adventure = new AdventureEngine(repository);
    this.child = new ChildEngine(repository);
    this.memory = new MemoryEngine(repository);
    this.recommendations = new RecommendationEngine(
      repository,
      this.world,
      this.learning,
      this.adventure,
      this.child,
    );
    this.progression = new LearningProgressionEngine(
      repository,
      this.learning,
      this.child,
      this.world,
    );
  }

  relate(input: CreateRelationshipInput) {
    return this.repository.relationships.create(input);
  }

  /**
   * Core write path when a family confirms a discovery name.
   * Always creates a new Memory Graph entry (lifelong timeline grows).
   * Updates Child + Adventure progress afterward.
   */
  async recordDiscovery(input: {
    childId: ChildId | string;
    discoveryLabel: string;
    mediaType?: "photo" | "video" | "voice";
    mediaUri?: string | null;
    /** @deprecated Prefer mediaType + mediaUri */
    media?: CreateMemoryNodeInput["photos"];
    location?: CreateMemoryNodeInput["location"];
    locationLabel?: string | null;
    notes?: string | null;
    favorite?: boolean;
    timestamp?: string;
  }) {
    let world = await this.world.resolveByDiscoveryName(input.discoveryLabel);

    // Unknown discoveries still get a lightweight World stub so the graph can grow.
    if (!world) {
      const slug = input.discoveryLabel
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
      world = await this.world.upsert({
        slug,
        name: input.discoveryLabel.trim(),
        category: "uncategorized",
        subCategory: null,
        description: `Discovered in the real world: ${input.discoveryLabel}`,
        aliases: [input.discoveryLabel.trim()],
        tags: [],
        collections: [],
        learningObjectiveIds: [],
        defaultAdventureIds: [],
        defaultMediaIds: [],
        difficulty: 1,
        estimatedAgeRanges: [{ min: 2, max: 12 }],
      });
    }

    const childBefore = await this.child.getById(input.childId);
    const childAge = childBefore?.currentAge ?? null;
    const timestamp = input.timestamp ?? new Date().toISOString();

    const photos: CreateMemoryNodeInput["photos"] = [
      ...(input.media ?? []),
    ];
    const videos: CreateMemoryNodeInput["videos"] = [];
    const voiceMemos: CreateMemoryNodeInput["voiceMemos"] = [];

    if (input.mediaUri) {
      const mediaItem = {
        uri: input.mediaUri,
        kind: (input.mediaType ?? "photo") as "photo" | "video" | "voice",
        capturedAt: timestamp,
      };
      if (mediaItem.kind === "video") videos.push(mediaItem);
      else if (mediaItem.kind === "voice") voiceMemos.push(mediaItem);
      else photos.push({ ...mediaItem, kind: "photo" });
    }

    // Resolve linked adventure before write so the Memory snapshots adventureId.
    const relatedAdventures = await this.adventure.adventuresForWorldNode(
      world.id,
    );
    const adventureId = relatedAdventures[0]?.id ?? null;

    const memory = await this.memory.create({
      childId: input.childId as ChildId,
      worldNodeId: world.id,
      discoveryLabel: input.discoveryLabel.trim(),
      timestamp,
      childAge,
      photos,
      videos,
      voiceMemos,
      location: input.location ?? null,
      locationLabel: input.locationLabel ?? null,
      notes: input.notes ?? null,
      adventureId,
      favorite: input.favorite ?? false,
    });

    if (adventureId) {
      await this.memory.update(memory.id, {
        adventureProgress: { [String(adventureId)]: 0 },
      });
    }

    await this.repository.relationships.create({
      type: "RELATED_TO",
      fromGraph: "memory",
      fromId: memory.id,
      toGraph: "world",
      toId: world.id,
      weight: 1,
      meta: { link: "memory_of" },
    });

    const child = await this.child.recordDiscovery(input.childId, world.id);
    const adventureProgress = await this.adventure.updateProgressAfterDiscovery(
      input.childId,
      world.id as WorldNodeId,
    );

    const learning = await this.learning.resolveForAge(
      world.id,
      child.currentAge,
    );

    const nextLearning = await this.progression.selectNext(
      this.progression.contextFromChild(child, {
        worldNodeId: world.id,
        discoveryLabel: world.name,
        trigger: "discovery",
      }),
    );

    const refreshed =
      (await this.memory.getById(memory.id)) ?? memory;

    return {
      world,
      memory: refreshed,
      child,
      adventureProgress,
      learning,
      nextLearning,
    };
  }

  recommend(context: RecommendationContext) {
    return this.recommendations.recommend(context);
  }

  selectNextLearning(context: ProgressionContext) {
    return this.progression.selectNext(context);
  }
}
