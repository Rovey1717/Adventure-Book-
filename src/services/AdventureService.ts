import type { AdventureRepository } from "@/data/adventure/AdventureRepository";
import { selectBlueprintsForChild } from "@/domain/adventure/blueprints";
import type { Adventure } from "@/domain/adventure/types";
import type { Memory } from "@/domain/memory/types";
import { getDemoLearningProfile } from "@/domain/parent/profile";

export type AdventureBoard = {
  newAdventures: Adventure[];
  continueAdventure: Adventure[];
  completed: Adventure[];
  suggested: Adventure[];
  recentlyUnlocked: Adventure[];
};

export type UnlockOptions = {
  age?: number;
  spanishEnabled?: boolean;
  parentGoals?: string[];
};

/**
 * Adventures domain — personalized learning from real-world discoveries only.
 * Never unlocks from Library search or manual creation.
 * Never unlocks random Spanish — only when parent enables it / goals include it.
 */
export class AdventureService {
  constructor(private readonly repository: AdventureRepository) {}

  list() {
    return this.repository.getAll();
  }

  getById(id: string) {
    return this.repository.getById(id);
  }

  getByMemoryId(memoryId: string) {
    return this.repository.getByMemoryId(memoryId);
  }

  /**
   * Unlock adventures after a Memory is created from a real-world capture.
   * Picks the next-best age-appropriate kinds for THIS discovery.
   */
  async unlockFromMemory(
    memory: Memory,
    options: UnlockOptions = {},
  ): Promise<Adventure[]> {
    const existing = await this.repository.getByMemoryId(memory.id);
    const existingKinds = new Set(existing.map((item) => item.kind));
    const now = new Date().toISOString();

    const profile = getDemoLearningProfile();
    const age = options.age ?? profile.age;
    const goals = options.parentGoals ?? profile.parentGoals;
    const spanishEnabled =
      options.spanishEnabled ??
      profile.spanishEnabled ??
      goals.some((g) => g.toLowerCase().includes("spanish"));

    const blueprints = selectBlueprintsForChild({
      age,
      spanishEnabled,
      limit: 4,
    });

    const toCreate = blueprints
      .filter((blueprint) => !existingKinds.has(blueprint.kind))
      .map((blueprint) => ({
        memoryId: memory.id,
        discoveryId: memory.discoveryId,
        objectName: memory.objectName,
        kind: blueprint.kind,
        title: blueprint.titleFor(memory.objectName),
        status: "unlocked" as const,
        unlockedAt: now,
        completedAt: null,
        points: blueprint.points,
      }));

    if (toCreate.length === 0) {
      return existing;
    }

    return this.repository.createMany(toCreate);
  }

  async start(id: string): Promise<Adventure> {
    return this.repository.update(id, { status: "in_progress" });
  }

  async complete(id: string): Promise<Adventure> {
    return this.repository.update(id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  async getBoard(): Promise<AdventureBoard> {
    const all = await this.repository.getAll();
    const newAdventures = all.filter((item) => item.status === "unlocked");
    const continueAdventure = all.filter(
      (item) => item.status === "in_progress",
    );
    const completed = all.filter((item) => item.status === "completed");
    const recentlyUnlocked = [...newAdventures]
      .sort(
        (a, b) =>
          new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime(),
      )
      .slice(0, 6);

    const suggested = newAdventures.slice(3);

    return {
      newAdventures,
      continueAdventure,
      completed,
      suggested,
      recentlyUnlocked,
    };
  }
}
