import { createId } from "@/domain/shared/ids";
import type {
  CreateRelationshipInput,
  GraphKind,
  GraphRelationship,
  RelationshipType,
} from "@/intelligence/types/relationships";
import { asRelationshipId } from "@/intelligence/types/ids";

/**
 * Generic async key-value + relationship store.
 * Swap InMemoryGraphStore for FirestoreGraphStore without changing engines.
 */
export interface NodeRepository<T extends { id: string }> {
  getById(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  upsert(node: T): Promise<T>;
  delete(id: string): Promise<void>;
  findWhere(predicate: (node: T) => boolean): Promise<T[]>;
}

export interface RelationshipRepository {
  getById(id: string): Promise<GraphRelationship | null>;
  list(): Promise<GraphRelationship[]>;
  create(input: CreateRelationshipInput): Promise<GraphRelationship>;
  delete(id: string): Promise<void>;
  findFrom(fromGraph: GraphKind, fromId: string): Promise<GraphRelationship[]>;
  findTo(toGraph: GraphKind, toId: string): Promise<GraphRelationship[]>;
  findByType(type: RelationshipType): Promise<GraphRelationship[]>;
  findBetween(
    fromGraph: GraphKind,
    fromId: string,
    toGraph: GraphKind,
    toId: string,
  ): Promise<GraphRelationship[]>;
}

export class InMemoryNodeRepository<T extends { id: string }>
  implements NodeRepository<T>
{
  private nodes = new Map<string, T>();

  async getById(id: string): Promise<T | null> {
    return this.nodes.get(id) ?? null;
  }

  async list(): Promise<T[]> {
    return [...this.nodes.values()];
  }

  async upsert(node: T): Promise<T> {
    this.nodes.set(node.id, node);
    return node;
  }

  async delete(id: string): Promise<void> {
    this.nodes.delete(id);
  }

  async findWhere(predicate: (node: T) => boolean): Promise<T[]> {
    return [...this.nodes.values()].filter(predicate);
  }

  /** Bulk seed helper for local / migration loaders. */
  async seed(nodes: T[]): Promise<void> {
    for (const node of nodes) {
      this.nodes.set(node.id, node);
    }
  }

  clear(): void {
    this.nodes.clear();
  }
}

export class InMemoryRelationshipRepository implements RelationshipRepository {
  private edges = new Map<string, GraphRelationship>();

  async getById(id: string): Promise<GraphRelationship | null> {
    return this.edges.get(id) ?? null;
  }

  async list(): Promise<GraphRelationship[]> {
    return [...this.edges.values()];
  }

  async create(input: CreateRelationshipInput): Promise<GraphRelationship> {
    const relationship: GraphRelationship = {
      ...input,
      id: asRelationshipId(input.id ?? createId("rel")),
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    this.edges.set(relationship.id, relationship);
    return relationship;
  }

  async delete(id: string): Promise<void> {
    this.edges.delete(id);
  }

  async findFrom(
    fromGraph: GraphKind,
    fromId: string,
  ): Promise<GraphRelationship[]> {
    return [...this.edges.values()].filter(
      (edge) => edge.fromGraph === fromGraph && edge.fromId === fromId,
    );
  }

  async findTo(toGraph: GraphKind, toId: string): Promise<GraphRelationship[]> {
    return [...this.edges.values()].filter(
      (edge) => edge.toGraph === toGraph && edge.toId === toId,
    );
  }

  async findByType(type: RelationshipType): Promise<GraphRelationship[]> {
    return [...this.edges.values()].filter((edge) => edge.type === type);
  }

  async findBetween(
    fromGraph: GraphKind,
    fromId: string,
    toGraph: GraphKind,
    toId: string,
  ): Promise<GraphRelationship[]> {
    return [...this.edges.values()].filter(
      (edge) =>
        edge.fromGraph === fromGraph &&
        edge.fromId === fromId &&
        edge.toGraph === toGraph &&
        edge.toId === toId,
    );
  }

  async seed(edges: GraphRelationship[]): Promise<void> {
    for (const edge of edges) {
      this.edges.set(edge.id, edge);
    }
  }

  clear(): void {
    this.edges.clear();
  }
}
