/**
 * Strongly typed graph identifiers.
 * Opaque branded strings prevent accidental cross-graph ID mixing at compile time.
 */

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type WorldNodeId = Brand<string, "WorldNodeId">;
export type LearningNodeId = Brand<string, "LearningNodeId">;
export type AdventureNodeId = Brand<string, "AdventureNodeId">;
export type ChildId = Brand<string, "ChildId">;
export type MemoryNodeId = Brand<string, "MemoryNodeId">;
export type RelationshipId = Brand<string, "RelationshipId">;
export type MediaId = Brand<string, "MediaId">;
export type LearningObjectiveId = Brand<string, "LearningObjectiveId">;
export type CollectionId = Brand<string, "CollectionId">;

export function asWorldNodeId(id: string): WorldNodeId {
  return id as WorldNodeId;
}
export function asLearningNodeId(id: string): LearningNodeId {
  return id as LearningNodeId;
}
export function asAdventureNodeId(id: string): AdventureNodeId {
  return id as AdventureNodeId;
}
export function asChildId(id: string): ChildId {
  return id as ChildId;
}
export function asMemoryNodeId(id: string): MemoryNodeId {
  return id as MemoryNodeId;
}
export function asRelationshipId(id: string): RelationshipId {
  return id as RelationshipId;
}
export function asMediaId(id: string): MediaId {
  return id as MediaId;
}
export function asLearningObjectiveId(id: string): LearningObjectiveId {
  return id as LearningObjectiveId;
}
export function asCollectionId(id: string): CollectionId {
  return id as CollectionId;
}
