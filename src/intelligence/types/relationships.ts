/**
 * Strongly typed graph relationships.
 * All cross-node links live here — never duplicate neighbor arrays as source of truth.
 * Node fields like relatedNodeIds are derived projections / indexes for fast lookup.
 */

import type { RelationshipId } from "@/intelligence/types/ids";

export const RELATIONSHIP_TYPES = [
  "RELATED_TO",
  "PART_OF",
  "PARENT_OF",
  "CHILD_OF",
  "LEADS_TO",
  "REQUIRES",
  "SIMILAR_TO",
  "DISCOVERED_AFTER",
  "DISCOVERED_WITH",
  "TEACHES",
  "PRACTICES",
  "UNLOCKS",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

/** Which graphs a relationship endpoint may belong to. */
export type GraphKind =
  | "world"
  | "learning"
  | "adventure"
  | "child"
  | "memory";

export type GraphRelationship = {
  id: RelationshipId;
  type: RelationshipType;
  fromGraph: GraphKind;
  fromId: string;
  toGraph: GraphKind;
  toId: string;
  /** Optional weight for scoring / recommendations (0–1). */
  weight?: number;
  /** Machine-readable metadata (never UI copy as source of truth). */
  meta?: Record<string, string | number | boolean>;
  createdAt: string;
};

export type CreateRelationshipInput = Omit<GraphRelationship, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};
