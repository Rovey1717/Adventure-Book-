import { createId } from "@/domain/shared/ids";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import {
  asLearningNodeId,
  type LearningNodeId,
  type WorldNodeId,
} from "@/intelligence/types/ids";
import type {
  AgeLearningVariant,
  CreateLearningNodeInput,
  LearningNode,
} from "@/intelligence/types/learning";

function now() {
  return new Date().toISOString();
}

/**
 * Learning Engine — how a World Node can be taught across ages & modalities.
 */
export class LearningEngine {
  constructor(private readonly graphs: GraphRepository) {}

  async getById(id: LearningNodeId | string): Promise<LearningNode | null> {
    return this.graphs.learning.getById(id);
  }

  async listForWorldNode(worldNodeId: WorldNodeId | string): Promise<LearningNode[]> {
    return this.graphs.learning.findWhere(
      (node) => node.worldNodeId === worldNodeId,
    );
  }

  async upsert(input: CreateLearningNodeInput): Promise<LearningNode> {
    const timestamp = now();
    const existing = input.id
      ? await this.graphs.learning.getById(input.id)
      : null;
    const node: LearningNode = {
      ...input,
      id: asLearningNodeId(input.id ?? createId("learn")),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    return this.graphs.learning.upsert(node);
  }

  /**
   * Pick the best Learning Node / age variant for a child's age.
   * Respects minimumAge / maximumAge on the node when present.
   */
  async resolveForAge(
    worldNodeId: WorldNodeId | string,
    age: number,
  ): Promise<{ node: LearningNode; variant: AgeLearningVariant | null } | null> {
    const nodes = await this.listForWorldNode(worldNodeId);
    if (nodes.length === 0) return null;

    const scored = nodes.map((node) => {
      const inNodeAge =
        age >= (node.minimumAge ?? 0) && age <= (node.maximumAge ?? 99);
      const variant =
        node.ageVariants.find(
          (v) => age >= v.ageRange.min && age <= v.ageRange.max,
        ) ?? null;
      let score = variant ? 100 - Math.abs(variant.difficulty - age) : 10;
      if (!inNodeAge) score -= 40;
      if (variant && age >= variant.ageRange.min && age <= variant.ageRange.max) {
        score += 20;
      }
      return { node, variant, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    return best ? { node: best.node, variant: best.variant } : null;
  }
}
