import {
  collectionForDiscovery,
  collectionProgress,
} from "@/domain/adventure/collections";
import type {
  LearningCardSnapshot,
  LearningModule,
} from "@/domain/learning/card";
import type { LibraryEntry } from "@/domain/library/types";
import type { Memory } from "@/domain/memory/types";
import type { MemoryCategory } from "@/domain/shared/categories";
import type { LibraryService } from "@/services/LibraryService";
import type { LearningGraphService } from "@/services/graph/LearningGraphService";

function categoryLabel(category: MemoryCategory): string {
  switch (category) {
    case "vehicles":
      return "Vehicles";
    case "animals":
      return "Animals";
    case "plants":
      return "Nature";
    case "insects":
      return "Insects";
    case "food":
      return "Food";
    case "ocean":
      return "Ocean";
    case "construction":
      return "Construction";
    case "nature":
      return "Nature";
    case "buildings":
      return "Places";
    default:
      return "Discovery";
  }
}

function emojiFor(name: string, category: MemoryCategory): string {
  const key = name.toLowerCase();
  if (key.includes("fire")) return "🚒";
  if (key.includes("ambulance")) return "🚑";
  if (key.includes("police")) return "🚓";
  if (key.includes("bee")) return "🐝";
  if (key.includes("butterfly")) return "🦋";
  if (key.includes("dog")) return "🐶";
  if (key.includes("tree")) return "🌳";
  if (key.includes("banana")) return "🍌";
  switch (category) {
    case "vehicles":
      return "🚗";
    case "animals":
      return "🐾";
    case "plants":
      return "🌱";
    case "food":
      return "🍎";
    case "ocean":
      return "🌊";
    case "construction":
      return "🚧";
    default:
      return "✨";
  }
}

function fallbackFact(name: string): string {
  return `${name} is something wonderful you found in the real world — noticing it is the first step of learning.`;
}

function fallbackWonder(name: string): string {
  return `What do you wonder about the ${name}?`;
}

function fallbackChallenge(name: string): string {
  return `Can you find something related to ${name} on your next adventure?`;
}

/**
 * Builds a modular Learning Card from Library + Learning Graph when available.
 * Runs after save (background) so Adventure Book always has content ready.
 */
export class LearningAdventureService {
  constructor(
    private readonly library: LibraryService,
    private readonly learningGraph: LearningGraphService,
  ) {}

  generateForMemory(
    memory: Memory,
    discoveredNames: string[],
  ): LearningCardSnapshot {
    const entry =
      this.library.search(memory.objectName).find(
        (item) =>
          item.title.toLowerCase() === memory.objectName.toLowerCase(),
      ) ?? this.library.search(memory.objectName)[0] ?? null;

    const graphNode = this.learningGraph.getNodeByName(memory.objectName);
    const related = graphNode
      ? this.learningGraph.relatedDiscoveries(graphNode.id, 3)
      : [];

    const collection = collectionForDiscovery(memory.objectName);
    const progress = collection
      ? collectionProgress(collection, discoveredNames)
      : null;

    const modules = this.buildModules(memory, entry, related, collection, progress);

    const unlockCandidate = collection
      ? {
          id: collection.id,
          title: collection.title,
          emoji: collection.emoji,
          subtitle: collection.subtitle,
        }
      : {
          id: `adventure_${memory.id}`,
          title: `${memory.objectName} Adventure`,
          emoji: emojiFor(memory.objectName, memory.category),
          subtitle: "A learning path unlocked from your discovery",
        };

    return {
      generatedAt: new Date().toISOString(),
      modules,
      unlockCandidate,
    };
  }

  private buildModules(
    memory: Memory,
    entry: LibraryEntry | null,
    related: Array<{ id: string; name: string; emoji: string }>,
    collection: ReturnType<typeof collectionForDiscovery>,
    progress: ReturnType<typeof collectionProgress> | null,
  ): LearningModule[] {
    const name = memory.objectName;
    const emoji = emojiFor(name, memory.category);
    const fact = entry?.facts[0] ?? fallbackFact(name);
    const pronunciation = entry?.pronunciation ?? name;
    const quiz = entry?.quiz[0] ?? {
      question: `Which one did you just discover?`,
      choices: [name, "A password", "A homework sheet"],
      answerIndex: 0,
    };

    const modules: LearningModule[] = [
      {
        type: "hero",
        name,
        categoryLabel: categoryLabel(memory.category),
        emoji,
        photoUri: memory.photoUri,
      },
      {
        type: "save_status",
        message: "Saved forever in Adventure Book",
      },
      {
        type: "hear_word",
        word: name,
        pronunciation,
      },
      {
        type: "fun_fact",
        fact,
      },
      {
        type: "quiz",
        question: quiz.question,
        choices: quiz.choices,
        answerIndex: quiz.answerIndex,
      },
      {
        type: "wonder",
        prompt: fallbackWonder(name),
      },
      {
        type: "challenge",
        text: collection
          ? `Can you find another ${collection.title.toLowerCase()} helper in the real world?`
          : fallbackChallenge(name),
      },
    ];

    if (collection && progress) {
      modules.push({
        type: "progress",
        label: collection.title,
        completed: progress.completed,
        total: progress.total,
      });
    }

    if (related.length > 0) {
      modules.push({
        type: "related",
        title: "Related discoveries",
        items: related.map((item) => ({
          id: item.id,
          name: item.name,
          emoji: item.emoji,
        })),
      });
    }

    // Extensibility hook — not interactive yet.
    modules.push({
      type: "future",
      id: "stories",
      title: "Stories & songs",
      teaser: "Coming soon — more ways to play with this discovery.",
    });

    return modules;
  }
}
