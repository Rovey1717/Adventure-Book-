import type { GraphEngine } from "@/intelligence/engines/GraphEngine";
import { DiscoveryMemoryTimelineEngine } from "@/intelligence/engines/DiscoveryMemoryTimelineEngine";
import { LivingDiscoveryCardEngine } from "@/intelligence/engines/LivingDiscoveryCardEngine";
import {
  buildNextMeaningfulExperienceInput,
  NextMeaningfulExperienceEngine,
} from "@/intelligence/engines/NextMeaningfulExperienceEngine";
import type { DiscoveryMemoryTimeline } from "@/intelligence/types/discoveryMemoryTimeline";
import type { ChildId } from "@/intelligence/types/ids";
import type { LivingDiscoveryCard } from "@/intelligence/types/livingDiscoveryCard";
import type { RecommendationBundle } from "@/intelligence/types/recommendations";
import type { FamilyAIProfile } from "@/domain/family/FamilyAIProfile";
import type { NextMeaningfulExperience } from "@/domain/family/nextMeaningfulExperience";
import { familyAIProfileService } from "@/services/family/FamilyAIProfileService";

export type PersonalizedExperience = {
  worldNodeId: string | null;
  worldName: string | null;
  learningNodeId: string | null;
  funFact: string | null;
  wonderQuestion: string | null;
  activity: string | null;
  recommendations: RecommendationBundle;
  /** Always grounded — never random */
  nextMeaningful: NextMeaningfulExperience;
  adventureProgress: Array<{
    adventureId: string;
    title: string;
    progressRatio: number;
    unlocked: boolean;
    completed: boolean;
  }>;
};

/**
 * Family AI — structured personalization, never a chatbot.
 * Always answers: "What is the next meaningful thing for this child to experience?"
 */
export class FamilyAI {
  private readonly livingCards: LivingDiscoveryCardEngine;
  private readonly memoryTimeline: DiscoveryMemoryTimelineEngine;
  private readonly nextExperience = new NextMeaningfulExperienceEngine();

  constructor(private readonly graph: GraphEngine) {
    this.livingCards = new LivingDiscoveryCardEngine(graph);
    this.memoryTimeline = new DiscoveryMemoryTimelineEngine(graph);
  }

  async profile(childId?: ChildId | string): Promise<FamilyAIProfile> {
    const id = childId ?? familyAIProfileService.getChildId();
    const child = await this.graph.child.getById(id);
    if (child) {
      familyAIProfileService.syncFromChildNode(child);
    }
    return familyAIProfileService.get();
  }

  /**
   * Core Family AI question — never random content.
   * Every recommendation includes a reason.
   */
  async nextMeaningfulExperience(input: {
    childId?: ChildId | string;
    currentDiscovery?: string | null;
    currentAdventure?: string | null;
  } = {}): Promise<NextMeaningfulExperience> {
    const profile = await this.profile(input.childId);
    return this.nextExperience.recommend(
      buildNextMeaningfulExperienceInput(profile, {
        currentDiscovery: input.currentDiscovery,
        currentAdventure: input.currentAdventure,
      }),
    );
  }

  livingDiscoveryCard(input: {
    childId: ChildId | string;
    worldNodeId?: string;
    discoveryLabel?: string;
  }): Promise<LivingDiscoveryCard | null> {
    return this.livingCards.compose(input);
  }

  discoveryMemoryTimeline(input: {
    childId: ChildId | string;
    discoveryTitle: string;
    worldNodeId?: string;
  }): Promise<DiscoveryMemoryTimeline> {
    return this.memoryTimeline.forDiscovery(input);
  }

  async experienceForDiscovery(input: {
    childId: ChildId | string;
    discoveryLabel?: string;
    worldNodeId?: string;
    memoryId?: string;
  }): Promise<PersonalizedExperience> {
    const familyProfile = await this.profile(input.childId);
    const age = familyProfile.currentAge;

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

    const nextMeaningful = await this.nextMeaningfulExperience({
      childId: input.childId,
      currentDiscovery: input.discoveryLabel ?? worldName,
      currentAdventure: adventureProgress.find((item) => item.unlocked)?.title,
    });

    return {
      worldNodeId,
      worldName,
      learningNodeId: node?.id ?? null,
      funFact: variant?.funFacts[0] ?? node?.funFacts[0] ?? null,
      wonderQuestion:
        variant?.wonderQuestions[0] ?? node?.wonderQuestions[0] ?? null,
      activity: variant?.activities[0] ?? node?.activities[0] ?? null,
      recommendations,
      nextMeaningful,
      adventureProgress,
    };
  }
}
