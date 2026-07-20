import { GARDEN_WORLD_GRAPH } from "@/data/graph/gardenWorld";
import type {
  GraphEdge,
  GraphNode,
  WorldGraphSnapshot,
} from "@/domain/graph/types";

/**
 * Persistence for world knowledge graphs.
 * Today: Garden seed in memory. Later: load additional ecosystems without
 * changing GraphTraversal / RecommendationEngine.
 */
export class GraphRepository {
  private world: WorldGraphSnapshot = GARDEN_WORLD_GRAPH;

  getWorld(): WorldGraphSnapshot {
    return this.world;
  }

  /** Swap or extend ecosystems without rewriting engines. */
  loadWorld(snapshot: WorldGraphSnapshot) {
    this.world = snapshot;
  }

  getNodes(): GraphNode[] {
    return this.world.nodes;
  }

  getEdges(): GraphEdge[] {
    return this.world.edges;
  }

  getNodeById(id: string): GraphNode | null {
    return this.world.nodes.find((node) => node.id === id) ?? null;
  }

  getNodeByName(name: string): GraphNode | null {
    const key = name.trim().toLowerCase();
    return (
      this.world.nodes.find((node) => node.name.toLowerCase() === key) ?? null
    );
  }

  searchNodes(query: string): GraphNode[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [...this.world.nodes];
    return this.world.nodes.filter(
      (node) =>
        node.name.toLowerCase().includes(trimmed) ||
        node.pronunciation.toLowerCase().includes(trimmed) ||
        node.vocabulary.some((word) => word.toLowerCase().includes(trimmed)) ||
        node.description.toLowerCase().includes(trimmed),
    );
  }

  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.world.edges.filter((edge) => edge.from === nodeId);
  }

  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.world.edges.filter((edge) => edge.to === nodeId);
  }
}

export const graphRepository = new GraphRepository();
