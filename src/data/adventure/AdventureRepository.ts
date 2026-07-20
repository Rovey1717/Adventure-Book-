import type { Adventure } from "@/domain/adventure/types";
import { createId } from "@/domain/shared/ids";

export class AdventureRepository {
  private adventures: Adventure[] = [];

  async getAll(): Promise<Adventure[]> {
    return [...this.adventures].sort(
      (a, b) =>
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
    );
  }

  async getById(id: string): Promise<Adventure | null> {
    return this.adventures.find((item) => item.id === id) ?? null;
  }

  async getByMemoryId(memoryId: string): Promise<Adventure[]> {
    return this.adventures.filter((item) => item.memoryId === memoryId);
  }

  async createMany(
    items: Omit<Adventure, "id">[],
  ): Promise<Adventure[]> {
    const created = items.map((item) => ({
      ...item,
      id: createId("adv"),
    }));
    this.adventures = [...created, ...this.adventures];
    return created;
  }

  async update(
    id: string,
    patch: Partial<Omit<Adventure, "id">>,
  ): Promise<Adventure> {
    const index = this.adventures.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error(`Adventure not found: ${id}`);
    }
    const updated = { ...this.adventures[index], ...patch };
    this.adventures = [
      ...this.adventures.slice(0, index),
      updated,
      ...this.adventures.slice(index + 1),
    ];
    return updated;
  }
}

export const adventureRepository = new AdventureRepository();
