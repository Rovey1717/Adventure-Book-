import { createId } from "@/domain/shared/ids";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import {
  asWorldNodeId,
  type WorldNodeId,
} from "@/intelligence/types/ids";
import type {
  CreateWorldNodeInput,
  WorldNode,
} from "@/intelligence/types/world";

function now() {
  return new Date().toISOString();
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
}

/**
 * World Engine — objective world knowledge.
 * Resolves discoveries by name/alias without UI coupling.
 */
export class WorldEngine {
  constructor(private readonly graphs: GraphRepository) {}

  async getById(id: WorldNodeId | string): Promise<WorldNode | null> {
    return this.graphs.world.getById(id);
  }

  async list(): Promise<WorldNode[]> {
    return this.graphs.world.list();
  }

  async upsert(input: CreateWorldNodeInput): Promise<WorldNode> {
    const timestamp = now();
    const existing = input.id
      ? await this.graphs.world.getById(input.id)
      : null;
    const node: WorldNode = {
      id: asWorldNodeId(input.id ?? createId("world")),
      slug: input.slug,
      name: input.name,
      category: input.category,
      subCategory: input.subCategory,
      description: input.description,
      aliases: input.aliases,
      tags: input.tags,
      parentIds: input.parentIds ?? existing?.parentIds ?? [],
      childIds: input.childIds ?? existing?.childIds ?? [],
      relatedNodeIds: input.relatedNodeIds ?? existing?.relatedNodeIds ?? [],
      collections: input.collections,
      learningObjectiveIds: input.learningObjectiveIds,
      defaultAdventureIds: input.defaultAdventureIds,
      defaultMediaIds: input.defaultMediaIds,
      difficulty: input.difficulty,
      estimatedAgeRanges: input.estimatedAgeRanges,
      emoji: input.emoji,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    return this.graphs.world.upsert(node);
  }

  /**
   * Resolve a family-typed discovery label to a World Node.
   * Matches name, slug, or aliases.
   */
  async resolveByDiscoveryName(name: string): Promise<WorldNode | null> {
    const key = normalize(name);
    if (!key) return null;
    const nodes = await this.graphs.world.list();
    return (
      nodes.find((node) => {
        if (normalize(node.name) === key) return true;
        if (normalize(node.slug) === key) return true;
        return node.aliases.some((alias) => normalize(alias) === key);
      }) ?? null
    );
  }

  async search(query: string, limit = 20): Promise<WorldNode[]> {
    const key = normalize(query);
    if (!key) return (await this.graphs.world.list()).slice(0, limit);
    const nodes = await this.graphs.world.list();
    return nodes
      .map((node) => {
        const title = normalize(node.name);
        let score = 0;
        if (title === key) score = 100;
        else if (title.startsWith(key)) score = 80;
        else if (title.includes(key)) score = 50;
        else if (node.aliases.some((a) => normalize(a).includes(key))) score = 40;
        else if (node.tags.some((t) => normalize(t).includes(key))) score = 20;
        return { node, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.node);
  }

  async related(worldNodeId: string, limit = 8): Promise<WorldNode[]> {
    const edges = await this.graphs.relationships.findFrom("world", worldNodeId);
    const relatedIds = edges
      .filter(
        (edge) =>
          edge.toGraph === "world" &&
          (edge.type === "RELATED_TO" ||
            edge.type === "SIMILAR_TO" ||
            edge.type === "LEADS_TO" ||
            edge.type === "PART_OF"),
      )
      .sort((a, b) => (b.weight ?? 0.5) - (a.weight ?? 0.5))
      .map((edge) => edge.toId);

    const unique = [...new Set(relatedIds)].slice(0, limit);
    const nodes: WorldNode[] = [];
    for (const id of unique) {
      const node = await this.graphs.world.getById(id);
      if (node) nodes.push(node);
    }
    return nodes;
  }

  /**
   * Rebuild indexed neighbor arrays from relationships (source of truth).
   */
  async reindexNeighbors(worldNodeId: string): Promise<WorldNode | null> {
    const node = await this.graphs.world.getById(worldNodeId);
    if (!node) return null;
    const from = await this.graphs.relationships.findFrom("world", worldNodeId);
    const to = await this.graphs.relationships.findTo("world", worldNodeId);

    const relatedNodeIds = [
      ...from
        .filter((e) => e.toGraph === "world" && e.type === "RELATED_TO")
        .map((e) => asWorldNodeId(e.toId)),
      ...to
        .filter((e) => e.fromGraph === "world" && e.type === "RELATED_TO")
        .map((e) => asWorldNodeId(e.fromId)),
    ];
    const childIds = from
      .filter((e) => e.toGraph === "world" && e.type === "PARENT_OF")
      .map((e) => asWorldNodeId(e.toId));
    const parentIds = from
      .filter((e) => e.toGraph === "world" && e.type === "CHILD_OF")
      .map((e) => asWorldNodeId(e.toId));

    return this.graphs.world.upsert({
      ...node,
      relatedNodeIds: [...new Set(relatedNodeIds)],
      childIds: [...new Set(childIds)],
      parentIds: [...new Set(parentIds)],
      updatedAt: now(),
    });
  }
}
