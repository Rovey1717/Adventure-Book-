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
import { getDemoLearningProfile } from "@/domain/parent/profile";
import type { MemoryCategory } from "@/domain/shared/categories";
import type { LibraryService } from "@/services/LibraryService";
import type { LearningGraphService } from "@/services/graph/LearningGraphService";
import {
  learningLevelForAge,
  type LearningLevel,
} from "@/intelligence/types/progression";

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

const SPANISH: Record<string, { word: string; pronunciation: string }> = {
  "fire truck": {
    word: "camión de bomberos",
    pronunciation: "kah-MYOHN deh boh-MEH-rohs",
  },
  firefighter: {
    word: "bombero",
    pronunciation: "boh-MEH-roh",
  },
};

/**
 * Discovery-tied, age-leveled quiz — never a random unrelated subject.
 */
function quizForDiscovery(
  name: string,
  level: LearningLevel,
  entry: LibraryEntry | null,
): { question: string; choices: string[]; answerIndex: number } {
  const fromLibrary = entry?.quiz[0];
  // Only use library quiz if it clearly mentions this discovery.
  if (
    fromLibrary &&
    fromLibrary.question.toLowerCase().includes(name.toLowerCase().split(" ")[0]!)
  ) {
    return fromLibrary;
  }

  switch (level) {
    case 1:
      return {
        question: `What color do you notice on the ${name}?`,
        choices: ["A bright color", "Invisible", "A password"],
        answerIndex: 0,
      };
    case 2:
      return {
        question: `Who uses a ${name}?`,
        choices: ["A community helper", "A pirate", "A robot"],
        answerIndex: 0,
      };
    case 3:
      return {
        question: `Why do we need a ${name}?`,
        choices: [
          "It helps people in the real world",
          "It is only a toy",
          "It is a homework sheet",
        ],
        answerIndex: 0,
      };
    case 4:
      return {
        question: `How does a ${name} work?`,
        choices: [
          "It uses special parts to do an important job",
          "It runs on homework",
          "It only looks cool",
        ],
        answerIndex: 0,
      };
    case 5:
      return {
        question: `How does ${name} connect to your community?`,
        choices: [
          "Real people use it to help others",
          "It is unrelated to people",
          "It only exists in books",
        ],
        answerIndex: 0,
      };
  }
}

function wonderForLevel(name: string, level: LearningLevel): string {
  switch (level) {
    case 1:
      return `Can you point to the ${name}? What sound does it make?`;
    case 2:
      return `Who drives or uses a ${name}?`;
    case 3:
      return `Why does a ${name} carry the tools it needs?`;
    case 4:
      return `How do the parts of a ${name} work together?`;
    case 5:
      return `How does your local community rely on a ${name}?`;
  }
}

function challengeForLevel(name: string, level: LearningLevel): string {
  switch (level) {
    case 1:
      return `Point to the ${name} and say its name out loud.`;
    case 2:
      return `Count something on the ${name} (wheels, doors, or colors).`;
    case 3:
      return `Draw the ${name} and label one important part.`;
    case 4:
      return `Compare a ${name} to something similar you have seen.`;
    case 5:
      return `Research how people near you use a ${name} to help others.`;
  }
}

export type LearningCardOptions = {
  age?: number;
  spanishEnabled?: boolean;
};

/**
 * Builds a modular Learning Card from Library + Learning Graph when available.
 * Content is always about THIS discovery and THIS child's learning level.
 * Spanish modules appear only when parent-enabled.
 */
export class LearningAdventureService {
  constructor(
    private readonly library: LibraryService,
    private readonly learningGraph: LearningGraphService,
  ) {}

  generateForMemory(
    memory: Memory,
    discoveredNames: string[],
    options: LearningCardOptions = {},
  ): LearningCardSnapshot {
    const profile = getDemoLearningProfile();
    const age = options.age ?? profile.age;
    const spanishEnabled =
      options.spanishEnabled ?? profile.spanishEnabled;
    const level = learningLevelForAge(age);

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

    const modules = this.buildModules({
      memory,
      entry,
      related,
      collection,
      progress,
      level,
      spanishEnabled,
    });

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

  private buildModules(input: {
    memory: Memory;
    entry: LibraryEntry | null;
    related: Array<{ id: string; name: string; emoji: string }>;
    collection: ReturnType<typeof collectionForDiscovery>;
    progress: ReturnType<typeof collectionProgress> | null;
    level: LearningLevel;
    spanishEnabled: boolean;
  }): LearningModule[] {
    const { memory, entry, related, collection, progress, level, spanishEnabled } =
      input;
    const name = memory.objectName;
    const emoji = emojiFor(name, memory.category);
    const fact = entry?.facts[0] ?? fallbackFact(name);
    const pronunciation = entry?.pronunciation ?? name;
    const quiz = quizForDiscovery(name, level, entry);

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
        prompt: wonderForLevel(name, level),
      },
      {
        type: "challenge",
        text: collection
          ? `Can you find another ${collection.title.toLowerCase()} helper related to ${name}?`
          : challengeForLevel(name, level),
      },
    ];

    // Spanish integrates into THIS discovery — only when enabled.
    if (spanishEnabled) {
      const pair = SPANISH[name.toLowerCase()] ?? {
        word: name,
        pronunciation: name,
      };
      modules.push({
        type: "hear_word",
        word: `${name} → ${pair.word}`,
        pronunciation: pair.pronunciation,
      });
    }

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

    modules.push({
      type: "future",
      id: "stories",
      title: "Stories & songs",
      teaser: "Coming soon — more ways to play with this discovery.",
    });

    return modules;
  }
}
