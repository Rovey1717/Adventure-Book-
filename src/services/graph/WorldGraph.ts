import type { GraphRepository } from "@/data/graph/GraphRepository";
import type { GraphNode, WorldGraphSnapshot } from "@/domain/graph/types";
import { GraphTraversal } from "@/services/graph/GraphTraversal";

/**
 * Read model over a loaded world ecosystem (Garden first).
 * Swap ecosystems via GraphRepository.loadWorld without changing callers.
 */
export class WorldGraph {
  readonly traversal: GraphTraversal;

  constructor(private readonly repository: GraphRepository) {
    this.traversal = new GraphTraversal(repository);
  }

  snapshot(): WorldGraphSnapshot {
    return this.repository.getWorld();
  }

  ecosystemTitle() {
    return this.repository.getWorld().ecosystemTitle;
  }

  getNode(id: string) {
    return this.repository.getNodeById(id);
  }

  getNodeByName(name: string) {
    return this.repository.getNodeByName(name);
  }

  search(query: string) {
    return this.repository.searchNodes(query);
  }

  allNodes() {
    return this.repository.getNodes();
  }

  related(nodeId: string, limit = 6) {
    return this.traversal.relatedDiscoveries(nodeId, limit);
  }

  reasonBetween(fromId: string, toId: string) {
    return this.traversal.edgeReason(fromId, toId);
  }

  categoryCount(category: GraphNode["category"]) {
    return this.repository.getNodes().filter((node) => node.category === category)
      .length;
  }
}
