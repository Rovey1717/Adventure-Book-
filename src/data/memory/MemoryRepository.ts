import type { CreateMemoryInput, Memory } from "@/domain/memory/types";
import type { LearningCardSnapshot, LearningViewStatus } from "@/domain/learning/card";
import { createId } from "@/domain/shared/ids";

export class MemoryRepository {
  private memories: Memory[] = [];

  async getAll(): Promise<Memory[]> {
    return [...this.memories].sort(
      (a, b) =>
        new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime(),
    );
  }

  async getById(id: string): Promise<Memory | null> {
    return this.memories.find((item) => item.id === id) ?? null;
  }

  async findByObjectName(objectName: string): Promise<Memory | null> {
    return (
      this.memories.find(
        (item) => item.objectName.toLowerCase() === objectName.toLowerCase(),
      ) ?? null
    );
  }

  async create(input: CreateMemoryInput): Promise<Memory> {
    const memory: Memory = {
      id: createId("mem"),
      discoveryId: input.discoveryId,
      objectName: input.objectName,
      photoUri: input.photoUri,
      discoveredAt: input.discoveredAt,
      location: input.location,
      locationLabel: input.locationLabel,
      category: input.category,
      discoveryCount: 1,
      adventuresCompleted: 0,
      isFavorite: false,
      celebrationStatus: "pending",
      learningViewStatus: "never_viewed",
      learningCard: null,
      unlockPresented: false,
      notes: null,
      story: null,
    };
    this.memories = [memory, ...this.memories];
    return memory;
  }

  async update(
    id: string,
    patch: Partial<Omit<Memory, "id">>,
  ): Promise<Memory> {
    const index = this.memories.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error(`Memory not found: ${id}`);
    }
    const updated = { ...this.memories[index], ...patch };
    this.memories = [
      ...this.memories.slice(0, index),
      updated,
      ...this.memories.slice(index + 1),
    ];
    return updated;
  }
}

export const memoryRepository = new MemoryRepository();

export type { LearningCardSnapshot, LearningViewStatus };
