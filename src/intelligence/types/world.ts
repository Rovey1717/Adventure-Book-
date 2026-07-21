import type {
  AdventureNodeId,
  CollectionId,
  LearningObjectiveId,
  MediaId,
  WorldNodeId,
} from "@/intelligence/types/ids";

/**
 * WORLD GRAPH — objective knowledge about the world.
 * Never stores child information or teaching content.
 */
export type AgeRange = {
  min: number;
  max: number;
};

export type WorldNode = {
  id: WorldNodeId;
  slug: string;
  name: string;
  category: string;
  subCategory: string | null;
  description: string;
  aliases: string[];
  tags: string[];
  /** Indexed projections of PARENT_OF / CHILD_OF / RELATED_TO — relationships are source of truth. */
  parentIds: WorldNodeId[];
  childIds: WorldNodeId[];
  relatedNodeIds: WorldNodeId[];
  collections: CollectionId[];
  learningObjectiveIds: LearningObjectiveId[];
  defaultAdventureIds: AdventureNodeId[];
  defaultMediaIds: MediaId[];
  difficulty: number;
  estimatedAgeRanges: AgeRange[];
  emoji?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorldNodeInput = Omit<
  WorldNode,
  "id" | "createdAt" | "updatedAt" | "parentIds" | "childIds" | "relatedNodeIds"
> & {
  id?: string;
  parentIds?: WorldNodeId[];
  childIds?: WorldNodeId[];
  relatedNodeIds?: WorldNodeId[];
};
