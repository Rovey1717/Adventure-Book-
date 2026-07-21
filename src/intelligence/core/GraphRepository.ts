import type { NodeRepository, RelationshipRepository } from "@/intelligence/core/repositories";
import type { AdventureNode } from "@/intelligence/types/adventure";
import type { ChildNode } from "@/intelligence/types/child";
import type { LearningNode } from "@/intelligence/types/learning";
import type { MemoryNode } from "@/intelligence/types/memory";
import type { WorldNode } from "@/intelligence/types/world";

/**
 * GraphRepository — facade over all five graph stores.
 * Engines depend on this interface; implementations may be local or remote.
 */
export interface GraphRepository {
  world: NodeRepository<WorldNode>;
  learning: NodeRepository<LearningNode>;
  adventure: NodeRepository<AdventureNode>;
  child: NodeRepository<ChildNode>;
  memory: NodeRepository<MemoryNode>;
  relationships: RelationshipRepository;
}
