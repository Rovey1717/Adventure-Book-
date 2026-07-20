import type { GraphRepository } from "@/data/graph/GraphRepository";
import type { GraphEdge, GraphNode } from "@/domain/graph/types";

export type NeighborResult = {
  node: GraphNode;
  edge: GraphEdge;
  /** Direction relative to the seed node. */
  direction: "out" | "in";
};

/**
 * Pure graph walks — no UI, no child state.
 * Engines call this instead of hardcoding neighbor lists.
 */
export class GraphTraversal {
  constructor(private readonly repository: GraphRepository) {}

  neighbors(nodeId: string): NeighborResult[] {
    const outgoing = this.repository.getOutgoingEdges(nodeId).flatMap((edge) => {
      const node = this.repository.getNodeById(edge.to);
      return node ? [{ node, edge, direction: "out" as const }] : [];
    });
    const incoming = this.repository.getIncomingEdges(nodeId).flatMap((edge) => {
      const node = this.repository.getNodeById(edge.from);
      return node ? [{ node, edge, direction: "in" as const }] : [];
    });

    const seen = new Set<string>();
    const merged: NeighborResult[] = [];
    for (const item of [...outgoing, ...incoming]) {
      if (seen.has(item.node.id)) continue;
      seen.add(item.node.id);
      merged.push(item);
    }
    return merged;
  }

  /** Unique neighbor nodes, preferring outgoing edge reasons. */
  relatedDiscoveries(nodeId: string, limit = 6): NeighborResult[] {
    return this.neighbors(nodeId).slice(0, limit);
  }

  /** Breadth-first walk for future path suggestions. */
  breadthFirst(startId: string, maxDepth = 2): GraphNode[] {
    const start = this.repository.getNodeById(startId);
    if (!start) return [];
    const visited = new Set<string>([startId]);
    const result: GraphNode[] = [];
    let frontier = [startId];

    for (let depth = 0; depth < maxDepth; depth += 1) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const neighbor of this.neighbors(id)) {
          if (visited.has(neighbor.node.id)) continue;
          visited.add(neighbor.node.id);
          result.push(neighbor.node);
          next.push(neighbor.node.id);
        }
      }
      frontier = next;
    }
    return result;
  }

  edgeReason(fromId: string, toId: string): string | null {
    const out = this.repository
      .getOutgoingEdges(fromId)
      .find((edge) => edge.to === toId);
    if (out) return out.reason;
    const incoming = this.repository
      .getIncomingEdges(fromId)
      .find((edge) => edge.from === toId);
    return incoming?.reason ?? null;
  }
}
