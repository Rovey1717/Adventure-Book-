import {
  InMemoryNodeRepository,
  InMemoryRelationshipRepository,
} from "@/intelligence/core/repositories";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import type { AdventureNode } from "@/intelligence/types/adventure";
import type { ChildNode } from "@/intelligence/types/child";
import type { LearningNode } from "@/intelligence/types/learning";
import type { MemoryNode } from "@/intelligence/types/memory";
import type { WorldNode } from "@/intelligence/types/world";

/**
 * Local MVP persistence. Replace with FirebaseGraphRepository later —
 * engines and FamilyAI stay unchanged.
 */
export class InMemoryGraphRepository implements GraphRepository {
  readonly world = new InMemoryNodeRepository<WorldNode>();
  readonly learning = new InMemoryNodeRepository<LearningNode>();
  readonly adventure = new InMemoryNodeRepository<AdventureNode>();
  readonly child = new InMemoryNodeRepository<ChildNode>();
  readonly memory = new InMemoryNodeRepository<MemoryNode>();
  readonly relationships = new InMemoryRelationshipRepository();

  clearAll(): void {
    this.world.clear();
    this.learning.clear();
    this.adventure.clear();
    this.child.clear();
    this.memory.clear();
    this.relationships.clear();
  }
}
