import type { AdventureNodeId, WorldNodeId } from "@/intelligence/types/ids";
import type { AgeRange } from "@/intelligence/types/world";

/**
 * ADVENTURE GRAPH — experiences composed of many World Nodes.
 * Progress is derived from Memory / Child discovery of required nodes.
 */

export type AdventureProgressRules = {
  /** Fraction (0–1) of required nodes needed to unlock. */
  unlockThreshold: number;
  /** Whether optional nodes count toward progress display. */
  countOptionalTowardProgress: boolean;
};

export type AdventureCompletionRules = {
  /** All required nodes must be discovered. */
  requireAllRequiredNodes: boolean;
  /** Minimum memories that reference required nodes. */
  minMemories?: number;
};

export type AdventureReward = {
  badgeId?: string;
  title: string;
  points: number;
};

export type AdventureNode = {
  id: AdventureNodeId;
  title: string;
  description: string;
  coverImage: string | null;
  requiredNodeIds: WorldNodeId[];
  optionalNodeIds: WorldNodeId[];
  reward: AdventureReward;
  unlockRequirements: {
    minAge?: number;
    maxAge?: number;
    prerequisiteAdventureIds?: AdventureNodeId[];
  };
  recommendedAge: AgeRange | null;
  estimatedTimeMinutes: number;
  progressRules: AdventureProgressRules;
  completionRules: AdventureCompletionRules;
  relatedAdventureIds: AdventureNodeId[];
  createdAt: string;
  updatedAt: string;
};

export type AdventureProgressSnapshot = {
  adventureId: AdventureNodeId;
  childId: string;
  requiredCompleted: number;
  requiredTotal: number;
  optionalCompleted: number;
  optionalTotal: number;
  progressRatio: number;
  unlocked: boolean;
  completed: boolean;
  missingRequiredNodeIds: WorldNodeId[];
};

export type CreateAdventureNodeInput = Omit<
  AdventureNode,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: string;
};
