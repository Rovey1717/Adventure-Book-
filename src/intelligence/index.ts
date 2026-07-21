/**
 * Adventure Book Intelligence Layer — five-graph operating system.
 *
 * World · Learning · Adventure · Child · Memory
 *
 * Living Discovery Card = FamilyAI.livingDiscoveryCard()
 *   Learn (Learning Graph) + My Journey (Memory Graph)
 *   Card stores nothing — composed on each open.
 *
 * UI never queries repositories directly.
 * FamilyAI → GraphEngine → Engines → GraphRepository
 *
 * Local InMemoryGraphRepository for MVP; swap for Firebase later
 * without changing engine business logic.
 */

export * from "@/intelligence/types";
export * from "@/intelligence/core/GraphRepository";
export * from "@/intelligence/core/InMemoryGraphRepository";
export * from "@/intelligence/core/repositories";
export * from "@/intelligence/engines/WorldEngine";
export * from "@/intelligence/engines/LearningEngine";
export * from "@/intelligence/engines/LearningProgressionEngine";
export * from "@/intelligence/engines/AdventureEngine";
export * from "@/intelligence/engines/ChildEngine";
export * from "@/intelligence/engines/MemoryEngine";
export * from "@/intelligence/engines/RecommendationEngine";
export * from "@/intelligence/engines/LivingDiscoveryCardEngine";
export * from "@/intelligence/engines/DiscoveryMemoryTimelineEngine";
export * from "@/intelligence/engines/GraphEngine";
export * from "@/intelligence/family/FamilyAI";
export {
  createIntelligenceLayer,
  getIntelligenceLayer,
  resetIntelligenceLayerForTests,
  DEMO_INTELLIGENCE_CHILD_ID,
  type IntelligenceLayer,
} from "@/intelligence/createIntelligenceLayer";
