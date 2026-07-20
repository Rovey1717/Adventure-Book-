import type { GeoLocation } from "@/domain/discovery/types";
import type {
  LearningCardSnapshot,
  LearningViewStatus,
} from "@/domain/learning/card";
import type { MemoryCategory } from "@/domain/shared/categories";

export type CelebrationStatus = "pending" | "celebrated";

/** A personal scrapbook entry in the Adventure Book. */
export type Memory = {
  id: string;
  discoveryId: string;
  objectName: string;
  photoUri: string | null;
  discoveredAt: string;
  location: GeoLocation;
  locationLabel: string | null;
  category: MemoryCategory;
  discoveryCount: number;
  adventuresCompleted: number;
  isFavorite: boolean;
  celebrationStatus: CelebrationStatus;
  /** Has the family opened the Learning Card / finished it? */
  learningViewStatus: LearningViewStatus;
  /** Modular Learning Card generated after save. */
  learningCard: LearningCardSnapshot | null;
  /** Whether the post-learning unlock screen was shown. */
  unlockPresented: boolean;
  notes: string | null;
  story: string | null;
};

export type CreateMemoryInput = {
  discoveryId: string;
  objectName: string;
  photoUri: string | null;
  discoveredAt: string;
  location: GeoLocation;
  locationLabel: string | null;
  category: MemoryCategory;
};
