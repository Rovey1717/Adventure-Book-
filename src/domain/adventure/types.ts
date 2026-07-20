export type AdventureKind =
  | "language"
  | "video"
  | "quiz"
  | "draw"
  | "seek"
  | "habitat"
  | "sound";

export type AdventureStatus = "unlocked" | "in_progress" | "completed";

/** A learning activity unlocked by a discovery/memory. */
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

/** Template used to generate adventures from discovery data. */
export type AdventureBlueprint = {
  kind: AdventureKind;
  titleFor: (objectName: string) => string;
  points: number;
};
