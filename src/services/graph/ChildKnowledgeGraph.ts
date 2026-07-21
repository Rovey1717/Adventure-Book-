import type {
  ChildExplorerState,
  ChildNodeProgress,
  ChildProfile,
} from "@/domain/graph/types";
import {
  explorerProgressFromXp,
  xpForLessonKind,
  type ExplorerProgress,
  type LessonXpKind,
} from "@/domain/progression/explorerXp";
import { getDemoLearningProfile } from "@/domain/parent/profile";

/**
 * Per-child learning state on the world graph.
 * Separate from Adventure Book memories — this tracks mastery + Explorer XP.
 */
export class ChildKnowledgeGraph {
  private readonly progress = new Map<string, ChildNodeProgress>();
  private totalXp = 0;

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

  getExplorerState(): ChildExplorerState {
    return { totalXp: this.totalXp };
  }

  getExplorerProgress(): ExplorerProgress {
    return explorerProgressFromXp(this.totalXp);
  }

  getProgress(nodeId: string): ChildNodeProgress {
    const stored = this.progress.get(nodeId);
    if (!stored) {
      return {
        nodeId,
        discovered: false,
        watchedVideo: false,
        completedQuiz: false,
        completedAdventure: false,
        completedLessonSteps: [],
        masteryScore: 0,
      };
    }
    return {
      ...stored,
      completedLessonSteps: stored.completedLessonSteps ?? [],
    };
  }

  listProgress(): ChildNodeProgress[] {
    return [...this.progress.values()].map((item) => ({
      ...item,
      completedLessonSteps: item.completedLessonSteps ?? [],
    }));
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
      this.withMastery({
        ...current,
        completedAdventure: true,
        discovered: true,
      }),
    );
  }

  /**
   * Complete an interactive Learning Journey lesson and award Explorer XP.
   * Auto-called when the LessonPlayer finishes — never a manual mark.
   */
  markLessonComplete(
    nodeId: string,
    stepId: string,
    xpKind: LessonXpKind = "digital",
  ): ExplorerProgress {
    const previousXp = this.totalXp;
    const current = this.getProgress(nodeId);
    const alreadyDone = current.completedLessonSteps.includes(stepId);

    if (!alreadyDone) {
      const completedLessonSteps = [...current.completedLessonSteps, stepId];
      const next: ChildNodeProgress = {
        ...current,
        completedLessonSteps,
        watchedVideo:
          current.watchedVideo ||
          stepId === "hear_pronunciation" ||
          stepId === "learn_parts",
        completedQuiz:
          current.completedQuiz ||
          stepId.startsWith("quiz_") ||
          stepId === "match_picture",
        completedAdventure:
          current.completedAdventure ||
          stepId === "find_three" ||
          stepId === "find_another" ||
          stepId === "mastery",
      };
      this.progress.set(nodeId, this.withMastery(next));
      this.totalXp += xpForLessonKind(xpKind);
    }

    return explorerProgressFromXp(this.totalXp, previousXp);
  }

  syncDiscovered(nodeIds: string[]) {
    for (const nodeId of nodeIds) {
      this.markDiscovered(nodeId);
    }
  }

  private withMastery(progress: ChildNodeProgress): ChildNodeProgress {
    let score = 0;
    if (progress.discovered) score += 20;
    if (progress.watchedVideo) score += 20;
    if (progress.completedQuiz) score += 20;
    if (progress.completedAdventure) score += 20;
    const lessonBonus = Math.min(
      20,
      (progress.completedLessonSteps?.length ?? 0) * 4,
    );
    score += lessonBonus;
    return { ...progress, masteryScore: Math.min(100, score) };
  }
}
