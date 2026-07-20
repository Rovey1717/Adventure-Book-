export type AdventureKind =
  | "language"
  | "video"
  | "quiz"
  | "draw"
  | "seek"
  | "habitat"
  | "sound"
  | "count";

export type AdventureStatus = "unlocked" | "in_progress" | "completed";

/**
 * Personalized learning unlocked ONLY from a real-world Memory.
 * Children cannot create adventures manually.
 * Library cards never unlock adventures.
 */
export type Adventure = {
  id: string;
  memoryId: string;
  discoveryId: string;
  objectName: string;
  kind: AdventureKind;
  title: string;
  status: AdventureStatus;
  unlockedAt: string;
  completedAt: string | null;
  points: number;
};

/** Template used to generate adventures from discovery/memory data. */
export type AdventureBlueprint = {
  kind: AdventureKind;
  titleFor: (objectName: string) => string;
  points: number;
};
