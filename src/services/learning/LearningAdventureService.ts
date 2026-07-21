import {
  collectionForDiscovery,
  collectionProgress,
} from "@/domain/adventure/collections";
import type {
  LearningCardSnapshot,
  LearningModule,
} from "@/domain/learning/card";
import {
  parentCoachStartersFor,
} from "@/domain/learning/parentCoach";
import {
  featuresForChild,
  type DevelopmentalFeaturePlan,
} from "@/domain/learning/developmentalFeatures";
import {
  learningModeForAge,
  type LearningModeId,
} from "@/domain/learning/mode";
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
  if (
    fromLibrary &&
    fromLibrary.question
      .toLowerCase()
      .includes(name.toLowerCase().split(" ")[0]!)
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

function matchForDiscovery(name: string): LearningModule {
  return {
    type: "match",
    prompt: `Match each idea to the ${name}.`,
    pairs: [
      { left: name, right: "What we discovered" },
      { left: "Helper", right: "Someone who uses it" },
      { left: "Job", right: "What it helps with" },
    ],
  };
}

function readingForDiscovery(name: string, fact: string): LearningModule {
  return {
    type: "reading",
    title: `Read about ${name}`,
    text: fact,
  };
}

function projectForDiscovery(name: string): LearningModule {
  return {
    type: "project",
    title: `${name} project`,
    steps: [
      `Observe one real ${name} (or a photo of one) carefully.`,
      `Sketch or list three important parts.`,
      `Explain to someone how those parts help it do its job.`,
      `Share one question you still want to investigate.`,
    ],
  };
}

function storyForDiscovery(name: string): LearningModule {
  return {
    type: "story",
    title: `Tell a ${name} story`,
    prompt: `Create a short story that includes a ${name}.`,
    starters: [
      `Once upon a time, a ${name} had an important job…`,
      `Someone needed help — and the ${name} was ready…`,
      `What happened next? You decide the ending.`,
    ],
  };
}

function researchForDiscovery(name: string): LearningModule {
  return {
    type: "research",
    question: `How does a ${name} help people in your community?`,
    hints: [
      "Ask a grown-up who might know.",
      "Look for a trusted book or local fact.",
      "Write one sentence with what you learned.",
    ],
  };
}

function aiChatForDiscovery(name: string): LearningModule {
  return {
    type: "ai_chat",
    title: `Talk about ${name}`,
    starter: `I'm curious about ${name}. What should we explore first?`,
    followUps: [
      `What problems does a ${name} solve?`,
      `What would happen if we didn't have a ${name}?`,
      `How is a ${name} different from something similar?`,
    ],
  };
}

export type LearningCardOptions = {
  age?: number;
  spanishEnabled?: boolean;
  learningMode?: LearningModeId;
};

/**
 * Builds a modular Learning Card from Library + Learning Graph when available.
 * Module set follows the child's learning mode.
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
    const mode =
      options.learningMode ??
      profile.learningMode ??
      learningModeForAge(age);
    const features = featuresForChild({
      age,
      mode,
      modeOverride: profile.learningModeOverride,
    });
    const level = learningLevelForAge(age);

    const entry =
      this.library.search(memory.objectName).find(
        (item) =>
          item.title.toLowerCase() === memory.objectName.toLowerCase(),
      ) ??
      this.library.search(memory.objectName)[0] ??
      null;

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
      mode,
      features,
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
    mode: LearningModeId;
    features: DevelopmentalFeaturePlan;
  }): LearningModule[] {
    const {
      memory,
      entry,
      related,
      collection,
      progress,
      level,
      spanishEnabled,
      features,
    } = input;
    const name = memory.objectName;
    const emoji = emojiFor(name, memory.category);
    const fact = entry?.facts[0] ?? fallbackFact(name);
    const pronunciation = entry?.pronunciation ?? name;
    const parentLed =
      features.conversationPrompts &&
      features.parentPromptCount > 0 &&
      !features.quizzes;

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
        message: parentLed
          ? "Saved — conversation starters ready for you"
          : features.projects || features.research
            ? "Saved — ready for a deeper dive"
            : "Saved forever in Adventure Book",
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
    ];

    if (features.conversationPrompts && features.parentPromptCount > 0) {
      const coach = parentCoachStartersFor(name);
      const prompts = coach.starters.slice(0, features.parentPromptCount);
      modules.push({
        type: "conversation_prompts",
        title: parentLed
          ? "How to teach this moment"
          : "A few conversation starters",
        prompts,
      });
    }

    if (features.quizzes) {
      const quiz = quizForDiscovery(name, level, entry);
      modules.push({
        type: "quiz",
        question: quiz.question,
        choices: quiz.choices,
        answerIndex: quiz.answerIndex,
      });
    }

    if (features.matching) {
      modules.push(matchForDiscovery(name));
    }

    if (features.reading) {
      modules.push(readingForDiscovery(name, fact));
    }

    if (features.criticalThinking || features.quizzes) {
      modules.push({
        type: "wonder",
        prompt: wonderForLevel(name, level),
      });
    }

    if (features.challenges) {
      modules.push({
        type: "challenge",
        text: collection
          ? `Can you find another ${collection.title.toLowerCase()} helper related to ${name}?`
          : challengeForLevel(name, level),
      });
    }

    if (features.projects) {
      modules.push(projectForDiscovery(name));
    }

    if (features.storyCreation) {
      modules.push(storyForDiscovery(name));
    }

    if (features.research) {
      modules.push(researchForDiscovery(name));
    }

    if (features.aiConversations) {
      modules.push(aiChatForDiscovery(name));
    }

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

    if (features.collections && collection && progress) {
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

    if (!features.storyCreation) {
      modules.push({
        type: "future",
        id: "stories",
        title: features.aiConversations
          ? "Deeper AI conversations"
          : "Stories & songs",
        teaser: features.aiConversations
          ? "Coming soon — longer research chats about this discovery."
          : "Story creation unlocks as your explorer grows.",
      });
    }

    return modules;
  }
}
