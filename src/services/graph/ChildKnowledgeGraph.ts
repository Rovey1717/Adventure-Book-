import type {
  ChildNodeProgress,
  ChildProfile,
} from "@/domain/graph/types";
import { getDemoLearningProfile } from "@/domain/parent/profile";

/**
 * Per-child learning state on the world graph.
 * Separate from Adventure Book memories — this tracks mastery signals.
 */
export class ChildKnowledgeGraph {
  private readonly progress = new Map<string, ChildNodeProgress>();

  constructor(
    private readonly profile: ChildProfile = (() => {
      const demo = getDemoLearningProfile();
      return {
        id: "child_emma",
        name: demo.name,
        age: demo.age,
      };
    })(),
  ) {}

  getProfile() {
    return this.profile;
  }

  getProgress(nodeId: string): ChildNodeProgress {
    return (
      this.progress.get(nodeId) ?? {
        nodeId,
        discovered: false,
        watchedVideo: false,
        completedQuiz: false,
        completedAdventure: false,
        masteryScore: 0,
      }
    );
  }

  listProgress(): ChildNodeProgress[] {
    return [...this.progress.values()];
  }

  discoveredNodeIds(): string[] {
    return this.listProgress()
      .filter((item) => item.discovered)
      .map((item) => item.nodeId);
  }

  markDiscovered(nodeId: string) {
    const current = this.getProgress(nodeId);
    this.progress.set(nodeId, this.withMastery({ ...current, discovered: true }));
  }

  markWatchedVideo(nodeId: string) {
    const current = this.getProgress(nodeId);
    this.progress.set(
      nodeId,
      this.withMastery({ ...current, watchedVideo: true }),
    );
  }

  markQuizCompleted(nodeId: string) {
    const current = this.getProgress(nodeId);
    this.progress.set(
      nodeId,
      this.withMastery({ ...current, completedQuiz: true }),
    );
  }

  markAdventureCompleted(nodeId: string) {
    const current = this.getProgress(nodeId);
    this.progress.set(
      nodeId,
      this.withMastery({ ...current, completedAdventure: true, discovered: true }),
    );
  }

  /** Sync discovery flags from Adventure Book memories (by graph node id / name match handled upstream). */
  syncDiscovered(nodeIds: string[]) {
    for (const nodeId of nodeIds) {
      this.markDiscovered(nodeId);
    }
  }

  private withMastery(progress: ChildNodeProgress): ChildNodeProgress {
    let score = 0;
    if (progress.discovered) score += 25;
    if (progress.watchedVideo) score += 25;
    if (progress.completedQuiz) score += 25;
    if (progress.completedAdventure) score += 25;
    return { ...progress, masteryScore: score };
  }
}
