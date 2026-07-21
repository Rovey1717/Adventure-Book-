import type { GraphEngine } from "@/intelligence/engines/GraphEngine";
import type { ChildNode } from "@/intelligence/types/child";
import type {
  CollectionProgressSection,
  FamilyMoment,
  GrowthMilestone,
  HowIveGrown,
  JourneyMemoryEntry,
  JourneyTimelineGroup,
  LearnSection,
  LivingDiscoveryCard,
  MyJourneySection,
  RelatedMemoryLink,
} from "@/intelligence/types/livingDiscoveryCard";
import type { ChildId, WorldNodeId } from "@/intelligence/types/ids";
import type { MemoryNode } from "@/intelligence/types/memory";
import type { WorldNode } from "@/intelligence/types/world";

function now() {
  return new Date().toISOString();
}

/**
 * Approximate child age at a past timestamp.
 * Prefer birthdate; otherwise back-calculate from currentAge.
 */
export function ageAtTimestamp(
  child: ChildNode,
  iso: string,
): number | null {
  if (child.birthdate) {
    const birth = new Date(child.birthdate);
    const at = new Date(iso);
    if (Number.isNaN(birth.getTime()) || Number.isNaN(at.getTime())) {
      return null;
    }
    let age = at.getFullYear() - birth.getFullYear();
    const monthDelta = at.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && at.getDate() < birth.getDate())) {
      age -= 1;
    }
    return Math.max(0, age);
  }

  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return null;
  const yearsAgo =
    (Date.now() - at) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.round(child.currentAge - yearsAgo));
}

function scrapbookLine(memory: MemoryNode, childAge: number | null): string {
  const bits: string[] = [];
  if (memory.notes?.trim()) {
    bits.push(memory.notes.trim());
  } else if (memory.discoveryLabel) {
    bits.push(memory.discoveryLabel);
  }
  if (memory.activitiesCompleted[0]) {
    bits.push(memory.activitiesCompleted[0]);
  }
  if (memory.voiceMemos.length > 0 && bits.length === 0) {
    bits.push("Voice memo saved");
  }
  if (memory.photos.length > 0 && bits.length === 0) {
    bits.push("Photo saved");
  }
  if (bits.length === 0) {
    bits.push(
      childAge != null
        ? `Discovered at age ${childAge}`
        : "A family discovery moment",
    );
  }
  return bits[0]!;
}

function journeyEntryFromMemory(
  memory: MemoryNode,
  child: ChildNode,
  badgesForMemory: string[],
): JourneyMemoryEntry {
  const childAge = memory.childAge ?? ageAtTimestamp(child, memory.timestamp);
  return {
    memoryId: memory.id,
    date: memory.timestamp,
    childAge,
    title: memory.discoveryLabel || "Discovery",
    photos: memory.photos,
    videos: memory.videos,
    voiceMemos: memory.voiceMemos,
    locationLabel: memory.locationLabel,
    peoplePresent: memory.peoplePresent,
    emotion: memory.emotion,
    parentNotes: memory.notes,
    questionsAsked: [],
    activitiesCompleted: memory.activitiesCompleted,
    storyId: memory.storyId,
    adventureProgress: memory.adventureProgress,
    badgesEarned: badgesForMemory,
    favorite: memory.favorite,
    scrapbookLine: scrapbookLine(memory, childAge),
  };
}

function groupTimeline(
  entries: JourneyMemoryEntry[],
): JourneyTimelineGroup[] {
  const byAge = new Map<string, JourneyMemoryEntry[]>();
  for (const entry of entries) {
    const key =
      entry.childAge != null ? String(entry.childAge) : "unknown";
    const list = byAge.get(key) ?? [];
    list.push(entry);
    byAge.set(key, list);
  }

  const groups: JourneyTimelineGroup[] = [];
  for (const [key, groupEntries] of byAge) {
    const childAge = key === "unknown" ? null : Number(key);
    groups.push({
      childAge,
      label: childAge != null ? `Age ${childAge}` : "Along the way",
      entries: groupEntries.sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    });
  }

  return groups.sort((a, b) => {
    if (a.childAge == null) return 1;
    if (b.childAge == null) return -1;
    return a.childAge - b.childAge;
  });
}

function growthSummary(entry: JourneyMemoryEntry): string {
  if (entry.parentNotes?.trim()) return entry.parentNotes.trim();
  if (entry.activitiesCompleted[0]) {
    return `Completed: ${entry.activitiesCompleted[0]}`;
  }
  if (entry.voiceMemos.length > 0) {
    return "You recorded a voice memo about this.";
  }
  if (entry.photos.length > 0) {
    return "You captured a photo of this discovery.";
  }
  return entry.scrapbookLine;
}

function buildHowIveGrown(entries: JourneyMemoryEntry[]): HowIveGrown {
  const chronological = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const milestones: GrowthMilestone[] = chronological.map((entry) => ({
    childAge: entry.childAge,
    date: entry.date,
    memoryId: entry.memoryId,
    summary: growthSummary(entry),
  }));

  return {
    milestones,
    earliest: milestones[0] ?? null,
    newest: milestones[milestones.length - 1] ?? null,
  };
}

function buildFamilyMoments(
  entries: JourneyMemoryEntry[],
): FamilyMoment[] {
  if (entries.length === 0) return [];

  const chronological = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const moments: FamilyMoment[] = [];
  const first = chronological[0]!;

  moments.push({
    kind: "first_discovery",
    title: "Your first time",
    detail: first.scrapbookLine,
    memoryId: first.memoryId,
    date: first.date,
    childAge: first.childAge,
  });

  for (const entry of chronological) {
    if (entry.voiceMemos.length > 0) {
      const who = entry.peoplePresent[0];
      moments.push({
        kind: "voice_memo",
        title: who ? `${who} recorded a voice memo` : "A voice memo",
        detail: entry.parentNotes?.trim() || entry.scrapbookLine,
        memoryId: entry.memoryId,
        date: entry.date,
        childAge: entry.childAge,
      });
    }
    if (entry.photos.length > 0) {
      const who = entry.peoplePresent[0];
      moments.push({
        kind: "photo",
        title: who ? `${who} took this picture` : "A family photo",
        detail: entry.locationLabel
          ? `At ${entry.locationLabel}`
          : entry.scrapbookLine,
        memoryId: entry.memoryId,
        date: entry.date,
        childAge: entry.childAge,
      });
    }
    if (entry.peoplePresent.length > 0) {
      moments.push({
        kind: "people",
        title: `With ${entry.peoplePresent.join(", ")}`,
        detail: entry.scrapbookLine,
        memoryId: entry.memoryId,
        date: entry.date,
        childAge: entry.childAge,
      });
    }
    if (entry.favorite) {
      moments.push({
        kind: "favorite",
        title: "A favorite moment",
        detail: entry.scrapbookLine,
        memoryId: entry.memoryId,
        date: entry.date,
        childAge: entry.childAge,
      });
    }
    if (entry.parentNotes?.trim() && entry !== first) {
      moments.push({
        kind: "note",
        title: "A parent note",
        detail: entry.parentNotes.trim(),
        memoryId: entry.memoryId,
        date: entry.date,
        childAge: entry.childAge,
      });
    }
    if (entry.locationLabel) {
      moments.push({
        kind: "location",
        title: entry.locationLabel,
        detail: entry.scrapbookLine,
        memoryId: entry.memoryId,
        date: entry.date,
        childAge: entry.childAge,
      });
    }
  }

  // Prefer emotional variety; keep the scrapbook from overflowing.
  const seen = new Set<string>();
  const unique: FamilyMoment[] = [];
  for (const moment of moments) {
    const key = `${moment.kind}:${moment.memoryId}:${moment.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(moment);
    if (unique.length >= 8) break;
  }
  return unique;
}

/**
 * Living Discovery Card Engine — composes Learn + My Journey.
 *
 * Does not store card data. Queries GraphEngine only.
 * UI stays separate; this is reusable business logic.
 */
export class LivingDiscoveryCardEngine {
  constructor(private readonly graph: GraphEngine) {}

  async compose(input: {
    childId: ChildId | string;
    worldNodeId?: string;
    discoveryLabel?: string;
  }): Promise<LivingDiscoveryCard | null> {
    const child = await this.graph.child.getById(input.childId);
    if (!child) return null;

    let world: WorldNode | null = null;
    if (input.worldNodeId) {
      world = await this.graph.world.getById(input.worldNodeId);
    } else if (input.discoveryLabel) {
      world = await this.graph.world.resolveByDiscoveryName(
        input.discoveryLabel,
      );
    }
    if (!world) return null;

    const learn = await this.buildLearn(world, child);
    const myJourney = await this.buildMyJourney(world, child);

    return {
      childId: child.id,
      worldNodeId: world.id,
      world,
      childName: child.name,
      childAge: child.currentAge,
      learn,
      myJourney,
      defaultTab: myJourney.memoryCount > 0 ? "my_journey" : "learn",
      composedAt: now(),
    };
  }

  private async buildLearn(
    world: WorldNode,
    child: ChildNode,
  ): Promise<LearnSection> {
    const resolved = await this.graph.learning.resolveForAge(
      world.id,
      child.currentAge,
    );
    const node = resolved?.node ?? null;
    const variant = resolved?.variant ?? null;

    const relatedWorld = await this.graph.world.related(world.id, 8);
    const adventures = await this.graph.adventure.adventuresForWorldNode(
      world.id,
    );
    const relatedAdventures = [];
    for (const adventure of adventures) {
      const progress = await this.graph.adventure.progressForChild(
        adventure.id,
        child.id,
      );
      relatedAdventures.push({
        adventureId: adventure.id,
        title: adventure.title,
        progressRatio: progress?.progressRatio ?? 0,
        unlocked: progress?.unlocked ?? false,
        completed: progress?.completed ?? false,
      });
    }

    const ageRange = variant?.ageRange;
    return {
      worldNodeId: world.id,
      learningNodeId: node?.id ?? null,
      title: world.name,
      description: world.description,
      emoji: world.emoji ?? null,
      heroMediaIds: world.defaultMediaIds,
      videos: node?.videos ?? [],
      sounds: node?.songs ?? [],
      vocabulary: variant?.vocabulary ?? node?.vocabulary ?? [],
      pronunciation: node?.pronunciation ?? null,
      funFacts: variant?.funFacts ?? node?.funFacts ?? [],
      quiz: variant?.quizQuestions ?? node?.quizQuestions ?? [],
      wonderQuestions:
        variant?.wonderQuestions ?? node?.wonderQuestions ?? [],
      challenge:
        variant?.activities[0] ?? node?.activities[0] ?? null,
      relatedDiscoveries: relatedWorld.map((item) => ({
        worldNodeId: item.id,
        name: item.name,
        emoji: item.emoji ?? null,
      })),
      relatedAdventures,
      creatorStories: node?.creatorContent ?? [],
      ageRangeLabel: ageRange
        ? `Ages ${ageRange.min}–${ageRange.max}`
        : null,
      childAge: child.currentAge,
      learningNode: node,
      ageVariant: variant,
    };
  }

  private async buildMyJourney(
    world: WorldNode,
    child: ChildNode,
  ): Promise<MyJourneySection> {
    const raw = await this.graph.memory.listForWorldNode(world.id);
    const memories = raw
      .filter((m) => m.childId === child.id)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime(),
      );

    const badgeIdsNearDiscovery = child.earnedBadges
      .filter((b) =>
        memories.some(
          (m) =>
            Math.abs(
              new Date(b.earnedAt).getTime() -
                new Date(m.timestamp).getTime(),
            ) <
            7 * 24 * 60 * 60 * 1000,
        ),
      )
      .map((b) => b.badgeId);

    const entries = memories.map((memory) =>
      journeyEntryFromMemory(memory, child, badgeIdsNearDiscovery),
    );

    const relatedMemories = await this.buildRelatedMemories(
      world,
      child,
    );
    const collectionProgress = await this.buildCollectionProgress(
      world,
      child,
    );

    return {
      timeline: groupTimeline(entries),
      memories: entries,
      howIveGrown: buildHowIveGrown(entries),
      relatedMemories,
      familyMoments: buildFamilyMoments(entries),
      collectionProgress,
      memoryCount: entries.length,
      firstDiscoveredAt: entries[0]?.date ?? null,
      lastVisitedAt: entries[entries.length - 1]?.date ?? null,
    };
  }

  private async buildRelatedMemories(
    world: WorldNode,
    child: ChildNode,
  ): Promise<RelatedMemoryLink[]> {
    const related = await this.graph.world.related(world.id, 12);
    const links: RelatedMemoryLink[] = [];

    for (const node of related) {
      const all = await this.graph.memory.listForWorldNode(node.id);
      const forChild = all.filter((m) => m.childId === child.id);
      if (forChild.length === 0) {
        // Still surface graph neighbors so the card can invite exploration.
        links.push({
          worldNodeId: node.id,
          name: node.name,
          emoji: node.emoji ?? null,
          memoryCount: 0,
          latestMemoryAt: null,
        });
        continue;
      }
      const latest = [...forChild].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime(),
      )[0];
      links.push({
        worldNodeId: node.id,
        name: node.name,
        emoji: node.emoji ?? null,
        memoryCount: forChild.length,
        latestMemoryAt: latest?.timestamp ?? null,
      });
    }

    return links.sort((a, b) => b.memoryCount - a.memoryCount);
  }

  private async buildCollectionProgress(
    world: WorldNode,
    child: ChildNode,
  ): Promise<CollectionProgressSection> {
    const adventures = await this.graph.adventure.adventuresForWorldNode(
      world.id,
    );
    const adventureSnapshots = [];
    for (const adventure of adventures) {
      const progress = await this.graph.adventure.progressForChild(
        adventure.id,
        child.id,
      );
      if (progress) adventureSnapshots.push(progress);
    }

    const collections = world.collections.map((collectionId) => ({
      collectionId,
      label: String(collectionId).replace(/^collection_/, "").replace(/_/g, " "),
      discoveredCount: child.completedNodeIds.includes(world.id) ? 1 : 0,
      totalKnown: null as number | null,
    }));

    const learning = await this.graph.learning.resolveForAge(
      world.id,
      child.currentAge,
    );
    const goals =
      learning?.variant?.learningGoals ??
      learning?.node?.learningGoals ??
      [];
    const learningGoals = goals.map((goal) => {
      const mastered = child.masteredLearningObjectives.some((id) =>
        String(id).includes(goal),
      );
      const practiced = child.needsPracticeObjectives.some((id) =>
        String(id).includes(goal),
      );
      return {
        goal,
        status: mastered
          ? ("mastered" as const)
          : practiced
            ? ("practiced" as const)
            : ("active" as const),
      };
    });

    const familyGoals = [...child.goals, ...child.parentGoals].map(
      (goal) => ({
        id: goal.id,
        title: goal.title,
        completed: goal.completedAt != null,
        relevant:
          goal.worldNodeIds?.includes(world.id as WorldNodeId) === true ||
          goal.adventureIds?.some((id) =>
            adventures.some((a) => a.id === id),
          ) === true ||
          (!goal.worldNodeIds?.length && !goal.adventureIds?.length),
      }),
    );

    return {
      collections,
      adventures: adventureSnapshots,
      learningGoals,
      familyGoals: familyGoals.filter((g) => g.relevant),
      curiosityStreakDays: child.streaks.discoveryDays,
    };
  }
}
