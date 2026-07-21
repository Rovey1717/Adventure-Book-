import type {
  AdventureNodeId,
  ChildId,
  MemoryNodeId,
  WorldNodeId,
} from "@/intelligence/types/ids";

/**
 * MEMORY GRAPH — every real-world discovery.
 * The family's digital childhood timeline.
 *
 * Living Discovery Cards query this graph — they never store memory data.
 */

export type MemoryMedia = {
  uri: string;
  kind: "photo" | "video" | "voice";
  capturedAt: string;
};

export type GeoPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export type QuizResult = {
  questionId: string;
  correct: boolean;
  answeredAt: string;
};

export type MemoryNode = {
  id: MemoryNodeId;
  childId: ChildId;
  worldNodeId: WorldNodeId;
  timestamp: string;
  /** Child's age when this memory was created (snapshot). */
  childAge: number | null;
  photos: MemoryMedia[];
  videos: MemoryMedia[];
  voiceMemos: MemoryMedia[];
  location: GeoPoint | null;
  locationLabel: string | null;
  weather: string | null;
  peoplePresent: string[];
  emotion: string | null;
  notes: string | null;
  /** Primary adventure linked at save time, if any. */
  adventureId: AdventureNodeId | null;
  storyId: string | null;
  quizResults: QuizResult[];
  activitiesCompleted: string[];
  adventureProgress: Record<string, number>;
  favorite: boolean;
  tags: string[];
  linkedMemoryIds: MemoryNodeId[];
  /** Display name as typed by the family (may match a World alias). */
  discoveryLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMemoryNodeInput = {
  id?: string;
  childId: ChildId;
  worldNodeId: WorldNodeId;
  discoveryLabel: string;
  timestamp?: string;
  childAge?: number | null;
  photos?: MemoryMedia[];
  videos?: MemoryMedia[];
  voiceMemos?: MemoryMedia[];
  location?: GeoPoint | null;
  locationLabel?: string | null;
  weather?: string | null;
  peoplePresent?: string[];
  emotion?: string | null;
  notes?: string | null;
  adventureId?: AdventureNodeId | null;
  favorite?: boolean;
  tags?: string[];
};
