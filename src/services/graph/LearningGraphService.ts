import type { GraphRepository } from "@/data/graph/GraphRepository";
import type { LibraryCategoryId, LibraryEntry } from "@/domain/library/types";
import type {
  ChildNodeProgress,
  GraphNode,
  NextAdventureRecommendation,
} from "@/domain/graph/types";
import { ChildKnowledgeGraph } from "@/services/graph/ChildKnowledgeGraph";
import { RecommendationEngine } from "@/services/graph/RecommendationEngine";
import { WorldGraph } from "@/services/graph/WorldGraph";

export type RelatedDiscovery = {
  id: string;
  name: string;
  emoji: string;
  reason: string;
};

export type ContinueExploringItem = {
  id: string;
  name: string;
  emoji: string;
  reason: string;
};

/**
 * Facade over WorldGraph + ChildKnowledgeGraph + RecommendationEngine.
 * UI talks to this service — never hardcodes neighbors.
 */
export class LearningGraphService {
  readonly world: WorldGraph;
  readonly child: ChildKnowledgeGraph;
  readonly recommendations: RecommendationEngine;

  constructor(repository: GraphRepository) {
    this.world = new WorldGraph(repository);
    this.child = new ChildKnowledgeGraph();
    this.recommendations = new RecommendationEngine(this.world, this.child);
  }

  search(query: string): GraphNode[] {
    return this.world.search(query);
  }

  getNode(id: string) {
    return this.world.getNode(id);
  }

  getNodeByName(name: string) {
    return this.world.getNodeByName(name);
  }

  /** Related discoveries — graph neighbors only. */
  relatedDiscoveries(nodeId: string, limit = 4): RelatedDiscovery[] {
    return this.world.related(nodeId, limit).map((item) => ({
      id: item.node.id,
      name: item.node.name,
      emoji: item.node.emoji,
      reason: item.edge.reason,
    }));
  }

  /** Continue Exploring strip — same graph neighbors, slightly larger set. */
  continueExploring(nodeId: string, limit = 4): ContinueExploringItem[] {
    return this.relatedDiscoveries(nodeId, limit);
  }

  recommendNext(): NextAdventureRecommendation | null {
    return this.recommendations.recommendNext();
  }

  recommendFrom(nodeId: string): NextAdventureRecommendation | null {
    return this.recommendations.recommendFrom(nodeId);
  }

  progressFor(nodeId: string): ChildNodeProgress {
    return this.child.getProgress(nodeId);
  }

  markWatchedVideo(nodeId: string) {
    this.child.markWatchedVideo(nodeId);
  }

  markQuizCompleted(nodeId: string) {
    this.child.markQuizCompleted(nodeId);
  }

  /** Auto-complete a Learning Journey lesson after the interactive player finishes. */
  markLessonComplete(
    nodeId: string,
    stepId: string,
    xpKind?: import("@/domain/progression/explorerXp").LessonXpKind,
  ) {
    return this.child.markLessonComplete(nodeId, stepId, xpKind);
  }

  explorerProgress() {
    return this.child.getExplorerProgress();
  }

  markDiscovered(nodeId: string) {
    this.child.markDiscovered(nodeId);
  }

  /** Map Adventure Book memory titles onto graph discovery flags. */
  syncFromMemoryNames(objectNames: string[]) {
    const ids: string[] = [];
    for (const name of objectNames) {
      const node = this.world.getNodeByName(name);
      if (node) ids.push(node.id);
    }
    this.child.syncDiscovered(ids);
  }

  gardenProgress(): { discovered: number; total: number; percent: number } {
    const total = this.world.allNodes().length;
    const discovered = this.child.discoveredNodeIds().length;
    const percent = total === 0 ? 0 : Math.round((discovered / total) * 100);
    return { discovered, total, percent };
  }

  /** Adapter so existing Discovery Card UI can render graph nodes. */
  toLibraryEntry(node: GraphNode): LibraryEntry {
    return {
      id: node.id,
      categoryId: graphCategoryToLibrary(node.category),
      title: node.name,
      pronunciation: node.pronunciation,
      vocabulary: node.vocabulary,
      facts: node.facts,
      hasVideo: node.hasVideo,
      hasSound: node.hasSound,
      hasQuiz: node.quiz.length > 0,
      quiz: node.quiz,
    };
  }

  searchAsLibraryEntries(query: string): LibraryEntry[] {
    return this.search(query).map((node) => this.toLibraryEntry(node));
  }

  getLibraryEntry(id: string): LibraryEntry | null {
    const node = this.getNode(id);
    return node ? this.toLibraryEntry(node) : null;
  }

  listLibraryEntries(categoryId?: string): LibraryEntry[] {
    const nodes = categoryId
      ? this.world.allNodes().filter(
          (node) => graphCategoryToLibrary(node.category) === categoryId,
        )
      : this.world.allNodes();
    return nodes.map((node) => this.toLibraryEntry(node));
  }
}

function graphCategoryToLibrary(
  category: GraphNode["category"],
): LibraryCategoryId {
  switch (category) {
    case "animals":
      return "animals";
    case "plants":
      return "nature";
    case "nature":
      return "nature";
    case "concepts":
      return "science";
    default:
      return "nature";
  }
}
