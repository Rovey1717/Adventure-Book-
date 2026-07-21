import { createId } from "@/domain/shared/ids";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import {
  asChildId,
  type AdventureNodeId,
  type ChildId,
  type WorldNodeId,
} from "@/intelligence/types/ids";
import type {
  ChildNode,
  CreateChildNodeInput,
  ProgressHistoryEntry,
} from "@/intelligence/types/child";

function now() {
  return new Date().toISOString();
}

function defaultChild(input: CreateChildNodeInput): ChildNode {
  const timestamp = now();
  return {
    id: asChildId(input.id ?? createId("child")),
    name: input.name,
    birthdate: input.birthdate ?? null,
    currentAge: input.currentAge,
    languages: input.languages ?? ["en"],
    learningLanguages: input.learningLanguages ?? [],
    spanishEnabled: input.spanishEnabled ?? false,
    favoriteCategories: input.favoriteCategories ?? [],
    completedNodeIds: input.completedNodeIds ?? [],
    completedAdventureIds: input.completedAdventureIds ?? [],
    masteredLearningObjectives: input.masteredLearningObjectives ?? [],
    needsPracticeObjectives: input.needsPracticeObjectives ?? [],
    favoriteActivities: input.favoriteActivities ?? [],
    completedQuizzes: input.completedQuizzes ?? [],
    learningPreferences: input.learningPreferences ?? [],
    currentLevel: input.currentLevel ?? 1,
    streaks: input.streaks ?? {
      discoveryDays: 0,
      lastDiscoveryDate: null,
    },
    earnedBadges: input.earnedBadges ?? [],
    collections: input.collections ?? [],
    goals: input.goals ?? [],
    parentGoals: input.parentGoals ?? [],
    questionHistory: input.questionHistory ?? [],
    recommendationHistory: input.recommendationHistory ?? [],
    progressHistory: input.progressHistory ?? [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Child Engine — per-child state as references into other graphs.
 */
export class ChildEngine {
  constructor(private readonly graphs: GraphRepository) {}

  async getById(id: ChildId | string): Promise<ChildNode | null> {
    return this.graphs.child.getById(id);
  }

  async list(): Promise<ChildNode[]> {
    return this.graphs.child.list();
  }

  async create(input: CreateChildNodeInput): Promise<ChildNode> {
    return this.graphs.child.upsert(defaultChild(input));
  }

  async update(
    id: ChildId | string,
    patch: Partial<Omit<ChildNode, "id" | "createdAt">>,
  ): Promise<ChildNode> {
    const existing = await this.graphs.child.getById(id);
    if (!existing) {
      throw new Error(`Child not found: ${id}`);
    }
    return this.graphs.child.upsert({
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now(),
    });
  }

  async recordDiscovery(
    childId: ChildId | string,
    worldNodeId: WorldNodeId,
  ): Promise<ChildNode> {
    const child = await this.graphs.child.getById(childId);
    if (!child) throw new Error(`Child not found: ${childId}`);

    const completedNodeIds = child.completedNodeIds.includes(worldNodeId)
      ? child.completedNodeIds
      : [...child.completedNodeIds, worldNodeId];

    const today = now().slice(0, 10);
    const last = child.streaks.lastDiscoveryDate?.slice(0, 10) ?? null;
    let discoveryDays = child.streaks.discoveryDays;
    if (last !== today) {
      discoveryDays += 1;
    }

    const entry: ProgressHistoryEntry = {
      at: now(),
      event: "discovery",
      worldNodeId,
    };

    return this.update(childId, {
      completedNodeIds,
      streaks: {
        discoveryDays,
        lastDiscoveryDate: now(),
      },
      progressHistory: [...child.progressHistory, entry],
    });
  }

  async recordAdventureCompleted(
    childId: ChildId | string,
    adventureId: AdventureNodeId,
  ): Promise<ChildNode> {
    const child = await this.graphs.child.getById(childId);
    if (!child) throw new Error(`Child not found: ${childId}`);
    if (child.completedAdventureIds.includes(adventureId)) return child;

    return this.update(childId, {
      completedAdventureIds: [...child.completedAdventureIds, adventureId],
      progressHistory: [
        ...child.progressHistory,
        { at: now(), event: "adventure_completed", adventureId },
      ],
    });
  }
}
