import { createId, delay } from "@/domain/shared/ids";
import type {
  RecognitionAlternative,
  RecognitionCategory,
  RecognitionResult,
} from "@/domain/recognition/types";
import type { RecognitionProvider } from "@/services/recognition/providers/RecognitionProvider";

type CatalogEntry = {
  name: string;
  category: RecognitionCategory;
  description: string;
  nearMisses: { name: string; category: RecognitionCategory; description: string }[];
};

/**
 * Demo catalog spanning future recognition domains.
 * A real provider ignores this and calls its vision API.
 */
const CATALOG: CatalogEntry[] = [
  {
    name: "Turtle",
    category: "animals",
    description: "A shelled reptile that moves at its own pace.",
    nearMisses: [
      {
        name: "Lizard",
        category: "animals",
        description: "A quick little reptile.",
      },
      { name: "Rock", category: "nature", description: "A stone from the ground." },
    ],
  },
  {
    name: "Dog",
    category: "animals",
    description: "A loyal four-legged friend.",
    nearMisses: [
      { name: "Bear", category: "animals", description: "A big furry animal." },
      { name: "Cat", category: "animals", description: "A soft, curious companion." },
    ],
  },
  {
    name: "Cat",
    category: "animals",
    description: "A soft, curious companion.",
    nearMisses: [
      { name: "Dog", category: "animals", description: "A loyal four-legged friend." },
      {
        name: "Butterfly",
        category: "insects",
        description: "A colorful winged visitor.",
      },
    ],
  },
  {
    name: "Butterfly",
    category: "insects",
    description: "A colorful winged visitor.",
    nearMisses: [
      { name: "Bee", category: "insects", description: "A busy buzzing helper." },
      { name: "Flower", category: "plants", description: "A bright blooming plant." },
    ],
  },
  {
    name: "Fire Truck",
    category: "vehicles",
    description: "A bright red helper that races to the rescue.",
    nearMisses: [
      { name: "Train", category: "vehicles", description: "A long vehicle on tracks." },
      {
        name: "Excavator",
        category: "construction",
        description: "A machine that digs with a big arm.",
      },
    ],
  },
  {
    name: "Train",
    category: "vehicles",
    description: "A long vehicle that rides on tracks.",
    nearMisses: [
      {
        name: "Fire Truck",
        category: "vehicles",
        description: "A bright red helper that races to the rescue.",
      },
      { name: "Boat", category: "vehicles", description: "A vessel that floats on water." },
    ],
  },
  {
    name: "Excavator",
    category: "construction",
    description: "A machine that digs with a big arm.",
    nearMisses: [
      {
        name: "Fire Truck",
        category: "vehicles",
        description: "A bright red helper that races to the rescue.",
      },
      {
        name: "Building",
        category: "buildings",
        description: "A place people live or work.",
      },
    ],
  },
  {
    name: "Tree",
    category: "plants",
    description: "A tall plant with a trunk and leaves.",
    nearMisses: [
      { name: "Flower", category: "plants", description: "A bright blooming plant." },
      { name: "Rock", category: "nature", description: "A stone from the ground." },
    ],
  },
  {
    name: "Apple",
    category: "food",
    description: "A crisp fruit that grows on trees.",
    nearMisses: [
      { name: "Banana", category: "food", description: "A soft yellow fruit." },
      { name: "Flower", category: "plants", description: "A bright blooming plant." },
    ],
  },
  {
    name: "Banana",
    category: "food",
    description: "A soft yellow fruit.",
    nearMisses: [
      { name: "Apple", category: "food", description: "A crisp fruit that grows on trees." },
      { name: "Boat", category: "vehicles", description: "A vessel that floats on water." },
    ],
  },
  {
    name: "Rainbow",
    category: "nature",
    description: "Colorful arcs that appear after rain.",
    nearMisses: [
      { name: "Ocean", category: "ocean", description: "A vast body of salt water." },
      { name: "Flower", category: "plants", description: "A bright blooming plant." },
    ],
  },
  {
    name: "Ocean",
    category: "ocean",
    description: "A vast body of salt water.",
    nearMisses: [
      { name: "Boat", category: "vehicles", description: "A vessel that floats on water." },
      { name: "Turtle", category: "animals", description: "A shelled reptile." },
    ],
  },
];

type Scenario = "auto_accept" | "confirm" | "choose" | "uncertain";

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickScenario(seed: number): Scenario {
  const roll = seed % 100;
  if (roll < 25) return "auto_accept";
  if (roll < 50) return "confirm";
  if (roll < 80) return "choose";
  return "uncertain";
}

function confidenceForScenario(scenario: Scenario, seed: number): number {
  const jitter = (seed % 40) / 1000;
  switch (scenario) {
    case "auto_accept":
      return Math.min(0.99, 0.95 + jitter);
    case "confirm":
      return Math.min(0.949, 0.9 + jitter);
    case "choose":
      return Math.min(0.89, 0.72 + (seed % 160) / 1000);
    case "uncertain":
      return Math.max(0.15, 0.35 + (seed % 300) / 1000 - 0.2);
  }
}

function buildAlternatives(
  entry: CatalogEntry,
  primaryConfidence: number,
  scenario: Scenario,
): RecognitionAlternative[] {
  const remainder = Math.max(0.01, 1 - primaryConfidence);
  const [first, second] = entry.nearMisses;

  if (scenario === "uncertain") {
    return [
      {
        name: first.name,
        confidence: remainder * 0.55,
        category: first.category,
        description: first.description,
      },
      {
        name: second.name,
        confidence: remainder * 0.45,
        category: second.category,
        description: second.description,
      },
    ];
  }

  return [
    {
      name: first.name,
      confidence: remainder * 0.7,
      category: first.category,
      description: first.description,
    },
    {
      name: second.name,
      confidence: remainder * 0.3,
      category: second.category,
      description: second.description,
    },
  ];
}

/**
 * Development / demo vision provider.
 * Replace by injecting OpenAIVisionProvider (etc.) into RecognitionService.
 */
export class MockVisionProvider implements RecognitionProvider {
  readonly id = "mock" as const;

  async analyze(mediaUri: string): Promise<RecognitionResult> {
    await delay(900);

    const seed = hashSeed(mediaUri);
    const entry = CATALOG[seed % CATALOG.length];
    const scenario = pickScenario(seed);
    const confidence = confidenceForScenario(scenario, seed);
    const alternatives = buildAlternatives(entry, confidence, scenario);

    return {
      id: createId("rec"),
      name: entry.name,
      confidence,
      category: entry.category,
      description: entry.description,
      provider: this.id,
      alternatives,
      recognizedAt: new Date().toISOString(),
      mediaUri,
    };
  }
}
