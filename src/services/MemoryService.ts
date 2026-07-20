import type { MemoryRepository } from "@/data/memory/MemoryRepository";
import type { Discovery } from "@/domain/discovery/types";
import type { Memory } from "@/domain/memory/types";
import {
  categoryForObject,
  type MemoryCategory,
} from "@/domain/shared/categories";

export class MemoryService {
  constructor(private readonly repository: MemoryRepository) {}

  list() {
    return this.repository.getAll();
  }

  getById(id: string) {
    return this.repository.getById(id);
  }

  /**
   * Creates or strengthens a scrapbook memory from a discovery.
   * Re-discovering the same object increments discoveryCount.
   * The family-provided name is the source of truth.
   */
  async createFromDiscovery(
    discovery: Discovery,
    categoryOverride?: MemoryCategory,
  ): Promise<Memory> {
    const existing = await this.repository.findByObjectName(discovery.objectName);
    const photoUri =
      discovery.mediaType === "photo" ? discovery.mediaUri : existing?.photoUri ?? null;
    const category =
      categoryOverride ?? categoryForObject(discovery.objectName);

    if (existing) {
      return this.repository.update(existing.id, {
        discoveryId: discovery.id,
        photoUri,
        discoveredAt: discovery.createdAt,
        location: discovery.location,
        locationLabel: discovery.locationLabel ?? existing.locationLabel,
        discoveryCount: existing.discoveryCount + 1,
        celebrationStatus: "pending",
        category,
      });
    }

    return this.repository.create({
      discoveryId: discovery.id,
      objectName: discovery.objectName,
      photoUri,
      discoveredAt: discovery.createdAt,
      location: discovery.location,
      locationLabel: discovery.locationLabel,
      category,
    });
  }

  markCelebrated(id: string) {
    return this.repository.update(id, { celebrationStatus: "celebrated" });
  }

  toggleFavorite(id: string, isFavorite: boolean) {
    return this.repository.update(id, { isFavorite });
  }

  setAdventuresCompleted(id: string, count: number) {
    return this.repository.update(id, { adventuresCompleted: count });
  }
}
