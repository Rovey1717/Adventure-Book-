import { createId } from "@/domain/shared/ids";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import {
  asAdventureNodeId,
  type AdventureNodeId,
  type ChildId,
  type WorldNodeId,
} from "@/intelligence/types/ids";
import type {
  AdventureNode,
  AdventureProgressSnapshot,
  CreateAdventureNodeInput,
} from "@/intelligence/types/adventure";

function now() {
  return new Date().toISOString();
}

/**
 * Adventure Engine — multi-node experiences; progress from Child completed nodes.
 */
export class AdventureEngine {
  constructor(private readonly graphs: GraphRepository) {}

  async getById(id: AdventureNodeId | string): Promise<AdventureNode | null> {
    return this.graphs.adventure.getById(id);
  }

  async list(): Promise<AdventureNode[]> {
    return this.graphs.adventure.list();
  }

  async upsert(input: CreateAdventureNodeInput): Promise<AdventureNode> {
    const timestamp = now();
    const existing = input.id
      ? await this.graphs.adventure.getById(input.id)
      : null;
    const node: AdventureNode = {
      ...input,
      id: asAdventureNodeId(input.id ?? createId("adv")),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    return this.graphs.adventure.upsert(node);
  }

  async adventuresForWorldNode(
    worldNodeId: WorldNodeId | string,
  ): Promise<AdventureNode[]> {
    const all = await this.graphs.adventure.list();
    return all.filter(
      (adventure) =>
        adventure.requiredNodeIds.includes(worldNodeId as WorldNodeId) ||
        adventure.optionalNodeIds.includes(worldNodeId as WorldNodeId),
    );
  }

  async progressForChild(
    adventureId: AdventureNodeId | string,
    childId: ChildId | string,
  ): Promise<AdventureProgressSnapshot | null> {
    const adventure = await this.graphs.adventure.getById(adventureId);
    const child = await this.graphs.child.getById(childId);
    if (!adventure || !child) return null;

    const completed = new Set(child.completedNodeIds.map(String));
    const requiredCompleted = adventure.requiredNodeIds.filter((id) =>
      completed.has(id),
    ).length;
    const optionalCompleted = adventure.optionalNodeIds.filter((id) =>
      completed.has(id),
    ).length;
    const requiredTotal = adventure.requiredNodeIds.length;
    const optionalTotal = adventure.optionalNodeIds.length;
    const progressRatio =
      requiredTotal === 0 ? 1 : requiredCompleted / requiredTotal;

    const unlocked =
      progressRatio >= adventure.progressRules.unlockThreshold ||
      child.completedAdventureIds.some((id) => id === adventure.id);

    const completedAdventure =
      adventure.completionRules.requireAllRequiredNodes
        ? requiredCompleted === requiredTotal && requiredTotal > 0
        : progressRatio >= 1;

    return {
      adventureId: adventure.id,
      childId: String(childId),
      requiredCompleted,
      requiredTotal,
      optionalCompleted,
      optionalTotal,
      progressRatio,
      unlocked,
      completed: completedAdventure,
      missingRequiredNodeIds: adventure.requiredNodeIds.filter(
        (id) => !completed.has(id),
      ),
    };
  }

  /**
   * After a discovery, recompute progress for every adventure that includes the node.
   */
  async updateProgressAfterDiscovery(
    childId: ChildId | string,
    worldNodeId: WorldNodeId | string,
  ): Promise<AdventureProgressSnapshot[]> {
    const related = await this.adventuresForWorldNode(worldNodeId);
    const snapshots: AdventureProgressSnapshot[] = [];
    for (const adventure of related) {
      const snapshot = await this.progressForChild(adventure.id, childId);
      if (snapshot) snapshots.push(snapshot);
    }
    return snapshots;
  }
}
