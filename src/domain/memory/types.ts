import type { MemoryCategory } from "@/domain/shared/categories";
import type { GeoLocation } from "@/domain/discovery/types";

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
