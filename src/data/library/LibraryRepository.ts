import type {
  LibraryCategory,
  LibraryEntry,
} from "@/domain/library/types";

const CATEGORIES: LibraryCategory[] = [
  {
    id: "animals",
    title: "Animals",
    description: "Creatures big and small",
    accent: "#C97B63",
  },
  {
    id: "vehicles",
    title: "Vehicles",
    description: "Things that go",
    accent: "#D64545",
  },
  {
    id: "ocean",
    title: "Ocean",
    description: "Waves, shells, and sea life",
    accent: "#6B9BD1",
  },
  {
    id: "food",
    title: "Food",
    description: "Tastes from the world",
    accent: "#E8A04A",
  },
  {
    id: "construction",
    title: "Construction",
    description: "Machines that build",
    accent: "#F08A24",
  },
  {
    id: "nature",
    title: "Nature",
    description: "Sky, weather, and wild places",
    accent: "#3D8B6E",
  },
];

const ENTRIES: LibraryEntry[] = [
  {
    id: "entry_turtle",
    categoryId: "animals",
    title: "Turtle",
    pronunciation: "TUR-tl",
    facts: [
      "Turtles have a shell that is part of their skeleton.",
      "Some turtles can live longer than people.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
  },
  {
    id: "entry_dog",
    categoryId: "animals",
    title: "Dog",
    pronunciation: "dawg",
    facts: ["Dogs have an incredible sense of smell.", "Dogs yawn when they are happy or tired."],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
  },
  {
    id: "entry_firetruck",
    categoryId: "vehicles",
    title: "Fire Truck",
    pronunciation: "FIRE truk",
    facts: [
      "Fire trucks carry water, ladders, and brave helpers.",
      "The loud siren asks everyone to make room.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
  },
  {
    id: "entry_ocean",
    categoryId: "ocean",
    title: "Ocean",
    pronunciation: "OH-shun",
    facts: [
      "Most of Earth is covered by ocean.",
      "Oceans help make the weather we feel every day.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: false,
  },
  {
    id: "entry_apple",
    categoryId: "food",
    title: "Apple",
    pronunciation: "AP-uhl",
    facts: ["Apples grow on trees.", "There are thousands of apple kinds."],
    hasVideo: false,
    hasSound: false,
    hasQuiz: true,
  },
  {
    id: "entry_excavator",
    categoryId: "construction",
    title: "Excavator",
    pronunciation: "EKS-kuh-vay-ter",
    facts: [
      "Excavators dig with a big arm and bucket.",
      "Builders use them to shape the ground.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
  },
  {
    id: "entry_rainbow",
    categoryId: "nature",
    title: "Rainbow",
    pronunciation: "RAIN-boh",
    facts: [
      "Rainbows appear when sunlight meets raindrops.",
      "Every rainbow has the same color order.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
  },
  {
    id: "entry_lizard",
    categoryId: "animals",
    title: "Lizard",
    pronunciation: "LIZ-urd",
    facts: [
      "Many lizards can drop their tails to escape.",
      "Lizards love warm sunny rocks.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
  },
  {
    id: "entry_bear",
    categoryId: "animals",
    title: "Bear",
    pronunciation: "bair",
    facts: [
      "Bears have a strong sense of smell.",
      "Some bears sleep through the coldest months.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
  },
  {
    id: "entry_cat",
    categoryId: "animals",
    title: "Cat",
    pronunciation: "kat",
    facts: ["Cats purr when they feel safe.", "Cats can see well in dim light."],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
  },
  {
    id: "entry_butterfly",
    categoryId: "animals",
    title: "Butterfly",
    pronunciation: "BUT-ur-fly",
    facts: [
      "Butterflies taste with their feet.",
      "A butterfly starts life as a caterpillar.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
  },
  {
    id: "entry_train",
    categoryId: "vehicles",
    title: "Train",
    pronunciation: "trayn",
    facts: [
      "Trains ride on metal tracks.",
      "Some trains carry people; others carry cargo.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
  },
];

/** Encyclopedia content only — never stores personal discoveries. */
export class LibraryRepository {
  getCategories(): LibraryCategory[] {
    return CATEGORIES;
  }

  getEntries(categoryId?: string): LibraryEntry[] {
    if (!categoryId) return ENTRIES;
    return ENTRIES.filter((entry) => entry.categoryId === categoryId);
  }

  getEntryById(id: string): LibraryEntry | null {
    return ENTRIES.find((entry) => entry.id === id) ?? null;
  }
}

export const libraryRepository = new LibraryRepository();
