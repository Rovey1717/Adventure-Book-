import type { AdventureEngine } from "@/intelligence/engines/AdventureEngine";
import type { ChildEngine } from "@/intelligence/engines/ChildEngine";
import type { LearningEngine } from "@/intelligence/engines/LearningEngine";
import type { WorldEngine } from "@/intelligence/engines/WorldEngine";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import {
  asAdventureNodeId,
  asLearningNodeId,
  asWorldNodeId,
  type WorldNodeId,
} from "@/intelligence/types/ids";
import type {
  RecommendationBundle,
  RecommendationContext,
  RecommendationItem,
} from "@/intelligence/types/recommendations";

type ScorerInput = {
  childCompleted: Set<string>;
  currentWorldNodeId: string | null;
  age: number;
  limit: number;
};

/**
 * Relationship-driven recommendation scorers.
 * Add new scorers without editing a giant switch — register in the array.
 */
type DiscoveryScorer = (
  input: ScorerInput & { worldId: string; edgeType: string; weight: number },
) => number;

const discoveryScorers: DiscoveryScorer[] = [
  ({ edgeType, weight }) => {
    if (edgeType === "LEADS_TO") return 0.9 * (weight || 0.7);
    if (edgeType === "RELATED_TO") return 0.7 * (weight || 0.5);
    if (edgeType === "SIMILAR_TO") return 0.55 * (weight || 0.5);
    if (edgeType === "REQUIRES") return 0.4 * (weight || 0.5);
    return 0.2 * (weight || 0.3);
  },
  ({ childCompleted, worldId }) => (childCompleted.has(worldId) ? -1 : 0.15),
];

/**
 * Recommendation Engine — queries graphs only, never UI state.
 */
export class RecommendationEngine {
  constructor(
    private readonly graphs: GraphRepository,
    private readonly world: WorldEngine,
    private readonly learning: LearningEngine,
    private readonly adventure: AdventureEngine,
    private readonly child: ChildEngine,
  ) {}

  async recommend(context: RecommendationContext): Promise<RecommendationBundle> {
    const limit = context.limit ?? 5;
    const child = await this.child.getById(context.childId);
    const completed = new Set(
      (child?.completedNodeIds ?? []).map((id) => String(id)),
    );
    const age = child?.currentAge ?? 5;
    const currentWorldNodeId =
      context.currentWorldNodeId ??
      (context.currentMemoryId
        ? (await this.graphs.memory.getById(context.currentMemoryId))
            ?.worldNodeId ?? null
        : null);

    const discoveries = await this.recommendDiscoveries({
      childCompleted: completed,
      currentWorldNodeId: currentWorldNodeId ? String(currentWorldNodeId) : null,
      age,
      limit,
    });

    const adventures = await this.recommendAdventures(completed, age, limit);
    const learningCards = await this.recommendLearningCards(
      currentWorldNodeId ? String(currentWorldNodeId) : null,
      age,
      limit,
    );
    const reviewItems = await this.recommendReview(completed, limit);
    const collections = await this.recommendCollections(
      currentWorldNodeId ? String(currentWorldNodeId) : null,
      limit,
    );

    const media = await this.recommendMedia(
      currentWorldNodeId ? String(currentWorldNodeId) : null,
      age,
      limit,
    );

    return {
      discoveries,
      adventures,
      learningCards,
      reviewItems,
      collections,
      stories: media.stories,
      videos: media.videos,
    };
  }

  private async recommendDiscoveries(
    input: ScorerInput,
  ): Promise<RecommendationItem<WorldNodeId>[]> {
    // Never recommend random catalog content. Without a current discovery,
    // FamilyAI.nextMeaningfulExperience() is the grounded path.
    if (!input.currentWorldNodeId) {
      return [];
    }

    const edges = await this.graphs.relationships.findFrom(
      "world",
      input.currentWorldNodeId,
    );

    const scored = new Map<
      string,
      { score: number; reasons: string[]; edgeType: string }
    >();

    for (const edge of edges) {
      if (edge.toGraph !== "world") continue;
      const base = discoveryScorers.reduce(
        (sum, scorer) =>
          sum +
          scorer({
            ...input,
            worldId: edge.toId,
            edgeType: edge.type,
            weight: edge.weight ?? 0.5,
          }),
        0,
      );
      if (base <= 0) continue;
      const prev = scored.get(edge.toId);
      const nextScore = (prev?.score ?? 0) + base;
      scored.set(edge.toId, {
        score: nextScore,
        reasons: [...(prev?.reasons ?? []), edge.type],
        edgeType: edge.type,
      });
    }

    const ranked = [...scored.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, input.limit);

    const items: RecommendationItem<WorldNodeId>[] = [];
    for (const [id, meta] of ranked) {
      const node = await this.world.getById(id);
      if (!node) continue;
      items.push({
        id: asWorldNodeId(id),
        score: meta.score,
        reasonCodes: meta.reasons,
        reason: `${meta.edgeType} → ${node.name}`,
      });
    }
    return items;
  }

  private async recommendAdventures(
    completed: Set<string>,
    age: number,
    limit: number,
  ): Promise<RecommendationItem<ReturnType<typeof asAdventureNodeId>>[]> {
    const adventures = await this.adventure.list();
    const items: RecommendationItem<ReturnType<typeof asAdventureNodeId>>[] = [];

    for (const adventure of adventures) {
      if (
        adventure.recommendedAge &&
        (age < adventure.recommendedAge.min || age > adventure.recommendedAge.max)
      ) {
        continue;
      }
      const hit = adventure.requiredNodeIds.filter((id) =>
        completed.has(id),
      ).length;
      const total = adventure.requiredNodeIds.length || 1;
      const ratio = hit / total;
      if (ratio <= 0 && hit === 0) {
        // Still suggest if LEADS_TO / UNLOCKS edges exist — scored lightly
      }
      const score = ratio > 0 ? 0.5 + ratio * 0.5 : 0.15;
      items.push({
        id: adventure.id,
        score,
        reasonCodes: ratio > 0 ? ["adventure_progress"] : ["adventure_explore"],
        reason:
          ratio > 0
            ? `${hit}/${total} discoveries toward ${adventure.title}`
            : `Start ${adventure.title}`,
      });
    }

    return items.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private async recommendLearningCards(
    worldNodeId: string | null,
    age: number,
    limit: number,
  ): Promise<RecommendationItem<ReturnType<typeof asLearningNodeId>>[]> {
    if (!worldNodeId) return [];
    const resolved = await this.learning.resolveForAge(worldNodeId, age);
    if (!resolved) return [];
    // Only recommend learning tied to the current discovery / world node.
    if (resolved.node.worldNodeId !== worldNodeId) return [];
    if (
      age < (resolved.node.minimumAge ?? 0) ||
      age > (resolved.node.maximumAge ?? 99)
    ) {
      return [];
    }
    return [
      {
        id: resolved.node.id,
        score: 1,
        reasonCodes: ["learning_for_age", "discovery_tied"],
        reason: resolved.variant
          ? `Age ${resolved.variant.ageRange.min}–${resolved.variant.ageRange.max} learning for this discovery`
          : "Learning card for this discovery",
      },
    ].slice(0, limit);
  }

  private async recommendReview(
    completed: Set<string>,
    limit: number,
  ): Promise<RecommendationItem<WorldNodeId>[]> {
    const ids = [...completed].slice(-limit);
    const items: RecommendationItem<WorldNodeId>[] = [];
    for (const id of ids) {
      const node = await this.world.getById(id);
      if (!node) continue;
      items.push({
        id: node.id,
        score: 0.4,
        reasonCodes: ["review_recent"],
        reason: `Review ${node.name}`,
      });
    }
    return items;
  }

  private async recommendCollections(
    worldNodeId: string | null,
    limit: number,
  ): Promise<RecommendationItem<string>[]> {
    if (!worldNodeId) return [];
    const node = await this.world.getById(worldNodeId);
    if (!node) return [];
    return node.collections.slice(0, limit).map((id, index) => ({
      id: String(id),
      score: 1 - index * 0.1,
      reasonCodes: ["world_collection"],
      reason: `Collection ${id}`,
    }));
  }

  private async recommendMedia(
    worldNodeId: string | null,
    age: number,
    limit: number,
  ): Promise<{
    stories: RecommendationItem<string>[];
    videos: RecommendationItem<string>[];
  }> {
    if (!worldNodeId) return { stories: [], videos: [] };
    const resolved = await this.learning.resolveForAge(worldNodeId, age);
    if (!resolved) return { stories: [], videos: [] };
    return {
      stories: resolved.node.stories.slice(0, limit).map((id, i) => ({
        id: String(id),
        score: 1 - i * 0.1,
        reasonCodes: ["learning_story"],
        reason: "Story from learning graph",
      })),
      videos: resolved.node.videos.slice(0, limit).map((id, i) => ({
        id: String(id),
        score: 1 - i * 0.1,
        reasonCodes: ["learning_video"],
        reason: "Video from learning graph",
      })),
    };
  }
}
