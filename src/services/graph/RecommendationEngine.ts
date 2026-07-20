import type { NextAdventureRecommendation } from "@/domain/graph/types";
import type { ChildKnowledgeGraph } from "@/services/graph/ChildKnowledgeGraph";
import type { WorldGraph } from "@/services/graph/WorldGraph";

/**
 * Recommends ONE next discovery/adventure from graph neighbors.
 * Never uses hardcoded lists — only edge traversal + child mastery.
 */
export class RecommendationEngine {
  constructor(
    private readonly world: WorldGraph,
    private readonly child: ChildKnowledgeGraph,
  ) {}

  recommendNext(): NextAdventureRecommendation | null {
    const discovered = this.child.discoveredNodeIds();
    if (discovered.length === 0) {
      return this.seedRecommendation();
    }
    return this.bestCandidate(discovered);
  }

  /** Prefer next steps from a specific node (Discovery Card context). */
  recommendFrom(nodeId: string): NextAdventureRecommendation | null {
    const fromNode = this.world.getNode(nodeId);
    if (!fromNode) return this.recommendNext();

    const neighbors = this.world.related(nodeId, 12);
    const profile = this.child.getProfile();
    type Candidate = NextAdventureRecommendation & { score: number };
    const candidates: Candidate[] = [];

    for (const neighbor of neighbors) {
      const toProgress = this.child.getProgress(neighbor.node.id);
      if (toProgress.discovered && toProgress.masteryScore >= 75) continue;

      let score = 20;
      if (!toProgress.discovered) score += 20;
      if (neighbor.direction === "out") score += 8;
      if (profile.age <= 5 && neighbor.node.category !== "concepts") score += 6;

      candidates.push({
        nodeId: neighbor.node.id,
        name: neighbor.node.name,
        emoji: neighbor.node.emoji,
        reason: neighbor.edge.reason,
        fromNodeId: nodeId,
        fromName: fromNode.name,
        score,
      });
    }

    if (candidates.length === 0) return this.recommendNext();
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    return {
      nodeId: best.nodeId,
      name: best.name,
      emoji: best.emoji,
      reason: best.reason,
      fromNodeId: best.fromNodeId,
      fromName: best.fromName,
    };
  }

  private seedRecommendation(): NextAdventureRecommendation | null {
    const seed = this.world.getNode("garden") ?? this.world.allNodes()[0];
    if (!seed) return null;
    return {
      nodeId: seed.id,
      name: seed.name,
      emoji: seed.emoji,
      reason: "Start exploring the Garden — everything connects from here.",
      fromNodeId: seed.id,
      fromName: seed.name,
    };
  }

  private bestCandidate(
    discovered: string[],
  ): NextAdventureRecommendation | null {
    const profile = this.child.getProfile();
    type Candidate = NextAdventureRecommendation & { score: number };
    const candidates: Candidate[] = [];

    for (const fromId of discovered) {
      const fromNode = this.world.getNode(fromId);
      if (!fromNode) continue;
      const fromProgress = this.child.getProgress(fromId);

      for (const neighbor of this.world.related(fromId, 12)) {
        const toProgress = this.child.getProgress(neighbor.node.id);
        if (toProgress.discovered && toProgress.masteryScore >= 75) continue;

        let score = 10;
        score += fromProgress.masteryScore / 10;
        if (!toProgress.discovered) score += 20;
        if (!toProgress.completedAdventure) score += 10;
        if (neighbor.direction === "out") score += 5;
        if (profile.age <= 5 && neighbor.node.category !== "concepts") {
          score += 8;
        }
        if (profile.age >= 7 && neighbor.node.category === "concepts") {
          score += 6;
        }

        candidates.push({
          nodeId: neighbor.node.id,
          name: neighbor.node.name,
          emoji: neighbor.node.emoji,
          reason: neighbor.edge.reason,
          fromNodeId: fromId,
          fromName: fromNode.name,
          score,
        });
      }
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    return {
      nodeId: best.nodeId,
      name: best.name,
      emoji: best.emoji,
      reason: best.reason,
      fromNodeId: best.fromNodeId,
      fromName: best.fromName,
    };
  }
}
