import {
  ADVENTURE_COLLECTIONS,
  collectionProgress,
} from "@/domain/adventure/collections";
import {
  applyDiscoveryToProfile,
  interestLabelForCategory,
  type DiscoveryProfileContext,
} from "@/domain/family/applyDiscoveryToProfile";
import {
  emptyFamilyAIProfile,
  estimateAttentionSpan,
  type AdventureProgressEntry,
  type FamilyAIProfile,
  type FamilyAIProfilePatch,
  type MemoryHistoryEntry,
} from "@/domain/family/FamilyAIProfile";
import {
  learningModeForAge,
  type LearningModeId,
} from "@/domain/learning/mode";
import { learningLevelForAge } from "@/intelligence/types/progression";
import type { ChildNode } from "@/intelligence/types/child";
import type { Adventure } from "@/domain/adventure/types";
import type { Memory } from "@/domain/memory/types";
import { categoryForObject } from "@/domain/shared/categories";

type Listener = (profile: FamilyAIProfile) => void;

/**
 * FamilyAIProfileService — single source of truth for personalization.
 * Every discovery should call applyDiscovery() so the profile gets smarter.
 */
class FamilyAIProfileService {
  private profile: FamilyAIProfile = emptyFamilyAIProfile();
  private readonly listeners = new Set<Listener>();

  /**
   * Stable snapshot for React external-store subscribers.
   * Returns the same reference until the next update/notify.
   * Do not mutate the returned object — treat as read-only.
   */
  get(): FamilyAIProfile {
    return this.profile;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  update(patch: FamilyAIProfilePatch): FamilyAIProfile {
    const next: FamilyAIProfile = {
      ...this.profile,
      ...patch,
      interests: copyArray(patch.interests, this.profile.interests),
      interestScores: copyArray(patch.interestScores, this.profile.interestScores),
      favoriteDiscoveries: copyArray(
        patch.favoriteDiscoveries,
        this.profile.favoriteDiscoveries,
      ),
      favoriteAdventures: copyArray(
        patch.favoriteAdventures,
        this.profile.favoriteAdventures,
      ),
      vocabulary: copyArray(patch.vocabulary, this.profile.vocabulary),
      languages: copyArray(patch.languages, this.profile.languages),
      learningLanguages: copyArray(
        patch.learningLanguages,
        this.profile.learningLanguages,
      ),
      parentGoals: copyArray(patch.parentGoals, this.profile.parentGoals),
      learningStyle: copyArray(patch.learningStyle, this.profile.learningStyle),
      masteredConcepts: copyArray(
        patch.masteredConcepts,
        this.profile.masteredConcepts,
      ),
      needsPractice: copyArray(patch.needsPractice, this.profile.needsPractice),
      questionHistory: copyArray(
        patch.questionHistory,
        this.profile.questionHistory,
      ),
      memoryHistory: copyArray(patch.memoryHistory, this.profile.memoryHistory),
      learningHistory: copyArray(
        patch.learningHistory,
        this.profile.learningHistory,
      ),
      adventureProgress: copyArray(
        patch.adventureProgress,
        this.profile.adventureProgress,
      ),
      collections: copyArray(patch.collections, this.profile.collections),
      potentialFutureDiscoveries: copyArray(
        patch.potentialFutureDiscoveries,
        this.profile.potentialFutureDiscoveries,
      ),
      coExplorers: copyArray(patch.coExplorers, this.profile.coExplorers),
      updatedAt: new Date().toISOString(),
    };

    if (
      patch.currentAge != null &&
      !next.learningModeOverride &&
      patch.learningMode == null
    ) {
      next.learningMode = learningModeForAge(next.currentAge);
    }

    if (patch.currentAge != null && patch.currentLevel == null) {
      next.currentLevel = learningLevelForAge(next.currentAge);
    }

    next.attentionSpan =
      patch.attentionSpan ??
      estimateAttentionSpan(next.currentAge, next.learningMode);

    this.profile = next;
    this.notify();
    return this.get();
  }

  /**
   * Core intelligence path — every discovery updates the Family AI Profile.
   * Interests, vocabulary, adventures, collections, timeline, learning history,
   * and potential future discoveries all grow.
   */
  applyDiscovery(context: DiscoveryProfileContext): FamilyAIProfile {
    this.profile = applyDiscoveryToProfile(this.profile, context);
    this.notify();
    return this.get();
  }

  setLearningMode(
    mode: LearningModeId,
    options: { override?: boolean } = {},
  ): FamilyAIProfile {
    return this.update({
      learningMode: mode,
      learningModeOverride: options.override ?? true,
      attentionSpan: estimateAttentionSpan(this.profile.currentAge, mode),
    });
  }

  /** Clear parent override — mode and features follow age again. */
  clearLearningModeOverride(): FamilyAIProfile {
    const mode = learningModeForAge(this.profile.currentAge);
    return this.update({
      learningMode: mode,
      learningModeOverride: false,
      attentionSpan: estimateAttentionSpan(this.profile.currentAge, mode),
    });
  }

  resolveLearningMode(): LearningModeId {
    if (this.profile.learningModeOverride) return this.profile.learningMode;
    return learningModeForAge(this.profile.currentAge);
  }

  hasCompletedOnboarding(): boolean {
    return this.profile.onboardingComplete;
  }

  getChildId(): string {
    return this.profile.childId;
  }

  syncFromChildNode(child: ChildNode): FamilyAIProfile {
    const mode = this.profile.learningModeOverride
      ? this.profile.learningMode
      : learningModeForAge(child.currentAge);

    const discoveredNames = this.profile.memoryHistory.map(
      (item) => item.objectName,
    );

    return this.update({
      childId: child.id,
      childName: child.name,
      birthdate: child.birthdate,
      currentAge: child.currentAge,
      learningMode: mode,
      interests:
        this.profile.interestScores.length > 0
          ? this.profile.interests
          : child.favoriteCategories,
      languages: child.languages,
      learningLanguages: child.learningLanguages,
      spanishEnabled: child.spanishEnabled,
      parentGoals: child.parentGoals.map((goal) => goal.title),
      learningStyle: child.learningPreferences,
      masteredConcepts:
        this.profile.masteredConcepts.length > 0
          ? this.profile.masteredConcepts
          : child.masteredLearningObjectives.map(String),
      needsPractice:
        this.profile.needsPractice.length > 0
          ? this.profile.needsPractice
          : child.needsPracticeObjectives.map(String),
      questionHistory: child.questionHistory,
      favoriteAdventures:
        this.profile.favoriteAdventures.length > 0
          ? this.profile.favoriteAdventures
          : child.favoriteActivities,
      coExplorers: child.coExplorers,
      currentLevel: child.currentLevel || learningLevelForAge(child.currentAge),
      collections:
        this.profile.collections.length > 0
          ? this.profile.collections
          : this.collectionsFromNames(
              discoveredNames,
              child.collections.map(String),
            ),
    });
  }

  /** Record a saved memory — no-ops if this memory already updated the profile. */
  recordMemory(memory: Memory, adventures: Adventure[] = []): FamilyAIProfile {
    if (
      this.profile.memoryHistory.some((item) => item.memoryId === memory.id)
    ) {
      return adventures.length > 0
        ? this.syncAdventures(adventures)
        : this.get();
    }
    return this.applyDiscovery({
      memory,
      adventures,
      interestCategory: interestLabelForCategory(memory.category),
    });
  }

  syncMemories(
    memories: Array<{
      id: string;
      objectName: string;
      discoveredAt: string;
      category?: string;
      locationLabel?: string | null;
    }>,
  ): FamilyAIProfile {
    const history: MemoryHistoryEntry[] = [...memories]
      .sort(
        (a, b) =>
          new Date(b.discoveredAt).getTime() -
          new Date(a.discoveredAt).getTime(),
      )
      .map((memory) => ({
        memoryId: memory.id,
        objectName: memory.objectName,
        category:
          memory.category ??
          interestLabelForCategory(categoryForObject(memory.objectName)),
        discoveredAt: memory.discoveredAt,
        locationLabel: memory.locationLabel ?? null,
      }))
      .slice(0, 100);

    if (memoryHistoryEquals(this.profile.memoryHistory, history)) {
      return this.profile;
    }

    const discoveredNames = history.map((item) => item.objectName);

    return this.update({
      memoryHistory: history,
      favoriteDiscoveries: rankFavorites(discoveredNames),
      collections: this.collectionsFromNames(discoveredNames),
    });
  }

  syncAdventures(adventures: Adventure[]): FamilyAIProfile {
    const adventureProgress: AdventureProgressEntry[] = adventures.map(
      (adventure) => ({
        adventureId: adventure.id,
        title: adventure.title,
        objectName: adventure.objectName,
        status: adventure.status,
        progressRatio:
          adventure.status === "completed"
            ? 1
            : adventure.status === "in_progress"
              ? 0.5
              : 0,
      }),
    );

    if (adventureProgressEquals(this.profile.adventureProgress, adventureProgress)) {
      return this.profile;
    }

    const favoriteAdventures = rankFavorites([
      ...adventures
        .filter((item) => item.status === "completed")
        .map((item) => item.title),
      ...this.profile.favoriteAdventures,
    ]);

    return this.update({
      adventureProgress,
      favoriteAdventures,
    });
  }

  recordQuestion(question: string): FamilyAIProfile {
    const trimmed = question.trim();
    if (!trimmed) return this.get();
    return this.update({
      questionHistory: [trimmed, ...this.profile.questionHistory].slice(0, 50),
    });
  }

  markMastered(concept: string): FamilyAIProfile {
    const id = concept.trim();
    if (!id) return this.get();
    return this.update({
      masteredConcepts: unique([id, ...this.profile.masteredConcepts]),
      needsPractice: this.profile.needsPractice.filter((item) => item !== id),
    });
  }

  markNeedsPractice(concept: string): FamilyAIProfile {
    const id = concept.trim();
    if (!id) return this.get();
    return this.update({
      needsPractice: unique([id, ...this.profile.needsPractice]),
    });
  }

  resetForTests(): void {
    this.profile = emptyFamilyAIProfile();
    this.notify();
  }

  private collectionsFromNames(
    discoveredNames: string[],
    knownIds: string[] = [],
  ) {
    return ADVENTURE_COLLECTIONS.map((collection) => {
      const progress = collectionProgress(collection, discoveredNames);
      const found = new Set(discoveredNames.map((name) => name.toLowerCase()));
      const remaining = collection.discoveryNames.filter(
        (name) => !found.has(name.toLowerCase()),
      );
      return {
        collectionId: collection.id,
        title: collection.title,
        emoji: collection.emoji,
        completed: progress.completed,
        total: progress.total,
        remaining,
      };
    }).filter(
      (item) => item.completed > 0 || knownIds.includes(item.collectionId),
    );
  }

  private notify() {
    for (const listener of this.listeners) listener(this.profile);
  }
}

function copyArray<T>(patch: T[] | undefined, fallback: T[]): T[] {
  return patch ? [...patch] : [...fallback];
}

function memoryHistoryEquals(
  a: MemoryHistoryEntry[],
  b: MemoryHistoryEntry[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.memoryId === b[index]?.memoryId &&
      item.objectName === b[index]?.objectName &&
      item.discoveredAt === b[index]?.discoveredAt,
  );
}

function adventureProgressEquals(
  a: AdventureProgressEntry[],
  b: AdventureProgressEntry[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.adventureId === b[index]?.adventureId &&
      item.status === b[index]?.status &&
      item.progressRatio === b[index]?.progressRatio,
  );
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function rankFavorites(names: string[], limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const name of names) {
    const key = name.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name)
    .slice(0, limit);
}

export const familyAIProfileService = new FamilyAIProfileService();
