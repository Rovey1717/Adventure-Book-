import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import { InMemoryGraphRepository } from "@/intelligence/core/InMemoryGraphRepository";
import type { InMemoryNodeRepository } from "@/intelligence/core/repositories";
import type { InMemoryRelationshipRepository } from "@/intelligence/core/repositories";
import { GraphEngine } from "@/intelligence/engines/GraphEngine";
import { FamilyAI } from "@/intelligence/family/FamilyAI";
import {
  SEED_ADVENTURE_NODES,
  SEED_LEARNING_NODES,
  SEED_MEMORY_NODES,
  SEED_RELATIONSHIPS,
  SEED_WORLD_NODES,
} from "@/intelligence/seed/referenceSeed";
import { asChildId, asWorldNodeId } from "@/intelligence/types/ids";
import type { AdventureNode } from "@/intelligence/types/adventure";
import type { LearningNode } from "@/intelligence/types/learning";
import type { MemoryNode } from "@/intelligence/types/memory";
import type { WorldNode } from "@/intelligence/types/world";

/** Demo child used by the intelligence layer / Living Discovery Cards. */
export const DEMO_INTELLIGENCE_CHILD_ID = "child_kase";

export type IntelligenceLayer = {
  repository: GraphRepository;
  graph: GraphEngine;
  familyAI: FamilyAI;
};

async function seedReference(repository: GraphRepository): Promise<void> {
  const world = repository.world as InMemoryNodeRepository<WorldNode>;
  const learning = repository.learning as InMemoryNodeRepository<LearningNode>;
  const adventure = repository.adventure as InMemoryNodeRepository<AdventureNode>;
  const relationships =
    repository.relationships as InMemoryRelationshipRepository;

  await world.seed(SEED_WORLD_NODES);
  await learning.seed(SEED_LEARNING_NODES);
  await adventure.seed(SEED_ADVENTURE_NODES);
  await relationships.seed(SEED_RELATIONSHIPS);
}

async function seedDemoJourney(repository: GraphRepository): Promise<void> {
  const memory = repository.memory as InMemoryNodeRepository<MemoryNode>;
  await memory.seed(SEED_MEMORY_NODES);
}

/**
 * Composition root — dependency injection for the intelligence layer.
 * Swap InMemoryGraphRepository for a Firebase-backed GraphRepository later.
 */
export async function createIntelligenceLayer(
  repository: GraphRepository = new InMemoryGraphRepository(),
  options: { seedReferenceData?: boolean; demoChild?: boolean } = {},
): Promise<IntelligenceLayer> {
  const { seedReferenceData = true, demoChild = true } = options;

  if (seedReferenceData) {
    await seedReference(repository);
  }

  const graph = new GraphEngine(repository);
  const familyAI = new FamilyAI(graph);

  if (demoChild) {
    const existing = await graph.child.getById(DEMO_INTELLIGENCE_CHILD_ID);
    if (!existing) {
      await graph.child.create({
        id: asChildId(DEMO_INTELLIGENCE_CHILD_ID),
        name: "Kase",
        /** Born mid-2017 → age ~9 in 2026; Fire Truck journey spans ages 2–9. */
        birthdate: "2017-07-20",
        currentAge: 9,
        languages: ["en"],
        favoriteCategories: ["Vehicles", "Animals"],
        completedNodeIds: [
          asWorldNodeId("world_fire_truck"),
          asWorldNodeId("world_ambulance"),
          asWorldNodeId("world_firefighter"),
        ],
        completedAdventureIds: [],
        earnedBadges: [
          {
            badgeId: "badge_community_helpers",
            earnedAt: "2026-05-10T11:00:00.000Z",
          },
        ],
        streaks: {
          discoveryDays: 12,
          lastDiscoveryDate: "2026-05-10T11:00:00.000Z",
        },
      });
    }
    if (seedReferenceData) {
      await seedDemoJourney(repository);
    }
  }

  return { repository, graph, familyAI };
}

/** Process-wide singleton for app wiring (tests may create isolated layers). */
let singleton: IntelligenceLayer | null = null;

export async function getIntelligenceLayer(): Promise<IntelligenceLayer> {
  if (!singleton) {
    singleton = await createIntelligenceLayer();
  }
  return singleton;
}

export function resetIntelligenceLayerForTests(): void {
  singleton = null;
}
