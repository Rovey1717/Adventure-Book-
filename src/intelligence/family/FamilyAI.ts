import type { GraphEngine } from "@/intelligence/engines/GraphEngine";
import { DiscoveryMemoryTimelineEngine } from "@/intelligence/engines/DiscoveryMemoryTimelineEngine";
import { LivingDiscoveryCardEngine } from "@/intelligence/engines/LivingDiscoveryCardEngine";
import type { DiscoveryMemoryTimeline } from "@/intelligence/types/discoveryMemoryTimeline";
import type { ChildId } from "@/intelligence/types/ids";
import type { LivingDiscoveryCard } from "@/intelligence/types/livingDiscoveryCard";
import type { RecommendationBundle } from "@/intelligence/types/recommendations";

export type PersonalizedExperience = {
  worldNodeId: string | null;
  worldName: string | null;
  learningNodeId: string | null;
  funFact: string | null;
  wonderQuestion: string | null;
  activity: string | null;
  recommendations: RecommendationBundle;
  adventureProgress: Array<{
    adventureId: string;
    title: string;
    progressRatio: number;
    unlocked: boolean;
    completed: boolean;
  }>;
};

/**
 * Family AI — never reads UI state.
 * Always queries GraphEngine → five graphs → personalized experience.
 *
 * Living Discovery Cards are composed here: Learn (Learning Graph) +
 * My Journey (Memory Graph), never stored on the card itself.
 */
export class FamilyAI {
  private readonly livingCards: LivingDiscoveryCardEngine;
  private readonly memoryTimeline: DiscoveryMemoryTimelineEngine;

  constructor(private readonly graph: GraphEngine) {
    this.livingCards = new LivingDiscoveryCardEngine(graph);
    this.memoryTimeline = new DiscoveryMemoryTimelineEngine(graph);
  }

  /**
   * Compose a Living Discovery Card — childhood timeline for one World Node.
   * Knowledge (Learn) + personal memories (My Journey).
   */
  livingDiscoveryCard(input: {
    childId: ChildId | string;
    worldNodeId?: string;
    discoveryLabel?: string;
  }): Promise<LivingDiscoveryCard | null> {
    return this.livingCards.compose(input);
  }

  /**
   * Memory Timeline for a Discovery Card — Memory Graph only.
   * Newest → oldest. Used by the v1 Living Discovery Card UI.
   */
  discoveryMemoryTimeline(input: {
    childId: ChildId | string;
    discoveryTitle: string;
    worldNodeId?: string;
  }): Promise<DiscoveryMemoryTimeline> {
    return this.memoryTimeline.forDiscovery(input);
  }

  /**
   * Build a personalized experience for a child after (or around) a discovery.
   */
  async experienceForDiscovery(input: {
    childId: ChildId | string;
    discoveryLabel?: string;
    worldNodeId?: string;
    memoryId?: string;
  }): Promise<PersonalizedExperience> {
    const child = await this.graph.child.getById(input.childId);
    const age = child?.currentAge ?? 5;

    let worldNodeId = input.worldNodeId ?? null;
    let worldName: string | null = null;

    if (!worldNodeId && input.discoveryLabel) {
      const world = await this.graph.world.resolveByDiscoveryName(
        input.discoveryLabel,
      );
      worldNodeId = world?.id ?? null;
      worldName = world?.name ?? null;
    } else if (worldNodeId) {
      const world = await this.graph.world.getById(worldNodeId);
      worldName = world?.name ?? null;
    }

    const learning = worldNodeId
      ? await this.graph.learning.resolveForAge(worldNodeId, age)
      : null;

    const variant = learning?.variant;
    const node = learning?.node;

    const recommendations = await this.graph.recommend({
      childId: String(input.childId),
      currentWorldNodeId: worldNodeId,
      currentMemoryId: input.memoryId ?? null,
      limit: 5,
    });

    const adventures = worldNodeId
      ? await this.graph.adventure.adventuresForWorldNode(worldNodeId)
      : await this.graph.adventure.list();

    const adventureProgress = [];
    for (const adventure of adventures) {
      const progress = await this.graph.adventure.progressForChild(
        adventure.id,
        input.childId,
      );
      if (!progress) continue;
      adventureProgress.push({
        adventureId: adventure.id,
        title: adventure.title,
        progressRatio: progress.progressRatio,
        unlocked: progress.unlocked,
        completed: progress.completed,
      });
    }

    return {
      worldNodeId,
      worldName,
      learningNodeId: node?.id ?? null,
      funFact: variant?.funFacts[0] ?? node?.funFacts[0] ?? null,
      wonderQuestion:
        variant?.wonderQuestions[0] ?? node?.wonderQuestions[0] ?? null,
      activity: variant?.activities[0] ?? node?.activities[0] ?? null,
      recommendations,
      adventureProgress,
    };
  }
}
