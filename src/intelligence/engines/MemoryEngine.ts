import { createId } from "@/domain/shared/ids";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import {
  asMemoryNodeId,
  type ChildId,
  type MemoryNodeId,
  type WorldNodeId,
} from "@/intelligence/types/ids";
import type {
  CreateMemoryNodeInput,
  MemoryNode,
} from "@/intelligence/types/memory";

function now() {
  return new Date().toISOString();
}

/**
 * Memory Engine — real-world discoveries as the family's childhood timeline.
 */
export class MemoryEngine {
  constructor(private readonly graphs: GraphRepository) {}

  async getById(id: MemoryNodeId | string): Promise<MemoryNode | null> {
    return this.graphs.memory.getById(id);
  }

  async listForChild(childId: ChildId | string): Promise<MemoryNode[]> {
    const all = await this.graphs.memory.findWhere(
      (node) => node.childId === childId,
    );
    return all.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  async listForWorldNode(worldNodeId: WorldNodeId | string): Promise<MemoryNode[]> {
    return this.graphs.memory.findWhere(
      (node) => node.worldNodeId === worldNodeId,
    );
  }

  async create(input: CreateMemoryNodeInput): Promise<MemoryNode> {
    const timestamp = input.timestamp ?? now();
    const node: MemoryNode = {
      id: asMemoryNodeId(input.id ?? createId("memg")),
      childId: input.childId,
      worldNodeId: input.worldNodeId,
      timestamp,
      childAge: input.childAge ?? null,
      photos: input.photos ?? [],
      videos: input.videos ?? [],
      voiceMemos: input.voiceMemos ?? [],
      location: input.location ?? null,
      locationLabel: input.locationLabel ?? null,
      weather: input.weather ?? null,
      peoplePresent: input.peoplePresent ?? [],
      emotion: input.emotion ?? null,
      notes: input.notes ?? null,
      adventureId: input.adventureId ?? null,
      storyId: null,
      quizResults: [],
      activitiesCompleted: [],
      adventureProgress: {},
      favorite: input.favorite ?? false,
      tags: input.tags ?? [],
      linkedMemoryIds: [],
      discoveryLabel: input.discoveryLabel,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    return this.graphs.memory.upsert(node);
  }

  /**
   * Memories for a discovery, newest first (Living Discovery Card timeline).
   */
  async listTimelineForDiscovery(
    worldNodeId: WorldNodeId | string,
    childId?: ChildId | string,
  ): Promise<MemoryNode[]> {
    const all = await this.listForWorldNode(worldNodeId);
    const filtered = childId
      ? all.filter((node) => node.childId === childId)
      : all;
    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  async update(
    id: MemoryNodeId | string,
    patch: Partial<Omit<MemoryNode, "id" | "createdAt">>,
  ): Promise<MemoryNode> {
    const existing = await this.graphs.memory.getById(id);
    if (!existing) throw new Error(`Memory not found: ${id}`);
    return this.graphs.memory.upsert({
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now(),
    });
  }

  async linkMemories(
    a: MemoryNodeId | string,
    b: MemoryNodeId | string,
  ): Promise<void> {
    const left = await this.graphs.memory.getById(a);
    const right = await this.graphs.memory.getById(b);
    if (!left || !right) return;

    const leftLinks = left.linkedMemoryIds.includes(right.id)
      ? left.linkedMemoryIds
      : [...left.linkedMemoryIds, right.id];
    const rightLinks = right.linkedMemoryIds.includes(left.id)
      ? right.linkedMemoryIds
      : [...right.linkedMemoryIds, left.id];

    await this.update(left.id, { linkedMemoryIds: leftLinks });
    await this.update(right.id, { linkedMemoryIds: rightLinks });

    await this.graphs.relationships.create({
      type: "DISCOVERED_WITH",
      fromGraph: "memory",
      fromId: left.id,
      toGraph: "memory",
      toId: right.id,
      weight: 1,
    });
  }
}
