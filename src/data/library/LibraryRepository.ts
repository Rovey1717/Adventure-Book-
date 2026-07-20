import type {
  LibraryCategory,
  LibraryEntry,
  LibraryQuizQuestion,
} from "@/domain/library/types";

/** Product IA category order for the Library encyclopedia tab. */
const CATEGORIES: LibraryCategory[] = [
  {
    id: "animals",
    title: "Animals",
    description: "Creatures big and small",
    accent: "#C97B63",
  },
  {
    id: "nature",
    title: "Nature",
    description: "Sky, weather, and wild places",
    accent: "#3D8B6E",
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
    id: "vehicles",
    title: "Vehicles",
    description: "Things that go",
    accent: "#D64545",
  },
  {
    id: "construction",
    title: "Construction",
    description: "Machines that build",
    accent: "#F08A24",
  },
  {
    id: "space",
    title: "Space",
    description: "Stars, planets, and beyond",
    accent: "#5B4B8A",
  },
  {
    id: "science",
    title: "Science",
    description: "Curious how the world works",
    accent: "#2F8F9D",
  },
];

function genericQuiz(
  title: string,
  questions: LibraryQuizQuestion[],
): LibraryQuizQuestion[] {
  return questions.length > 0
    ? questions
    : [
        {
          question: `What is a ${title}?`,
          choices: ["A living thing or object to learn about", "A memory", "A badge"],
          answerIndex: 0,
        },
      ];
}

const ENTRIES: LibraryEntry[] = [
  {
    id: "entry_turtle",
    categoryId: "animals",
    title: "Turtle",
    pronunciation: "TUR-tl",
    vocabulary: ["shell", "reptile", "habitat"],
    facts: [
      "Turtles have a shell that is part of their skeleton.",
      "Some turtles can live longer than people.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: [
      {
        question: "How many legs does a turtle have?",
        choices: ["Two", "Four", "Six"],
        answerIndex: 1,
      },
      {
        question: "What do many turtles eat?",
        choices: ["Plants and small animals", "Only rocks", "Only clouds"],
        answerIndex: 0,
      },
      {
        question: "Where do turtles live?",
        choices: ["Only in space", "Land, water, or both", "Inside volcanoes"],
        answerIndex: 1,
      },
    ],
  },
  {
    id: "entry_dog",
    categoryId: "animals",
    title: "Dog",
    pronunciation: "dawg",
    vocabulary: ["puppy", "bark", "loyal"],
    facts: [
      "Dogs have an incredible sense of smell.",
      "Dogs yawn when they are happy or tired.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Dog", [
      {
        question: "What are dogs famous for?",
        choices: ["Smell", "Flying", "Glowing"],
        answerIndex: 0,
      },
    ]),
  },
  {
    id: "entry_cat",
    categoryId: "animals",
    title: "Cat",
    pronunciation: "kat",
    vocabulary: ["kitten", "purr", "whiskers"],
    facts: ["Cats purr when they feel safe.", "Cats can see well in dim light."],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Cat", [
      {
        question: "When do cats often purr?",
        choices: ["When they feel safe", "When they fly", "When they sneeze ice"],
        answerIndex: 0,
      },
    ]),
  },
  {
    id: "entry_bear",
    categoryId: "animals",
    title: "Bear",
    pronunciation: "bair",
    vocabulary: ["cub", "fur", "hibernate"],
    facts: [
      "Bears have a strong sense of smell.",
      "Some bears sleep through the coldest months.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Bear", []),
  },
  {
    id: "entry_lizard",
    categoryId: "animals",
    title: "Lizard",
    pronunciation: "LIZ-urd",
    vocabulary: ["scales", "tail", "reptile"],
    facts: [
      "Many lizards can drop their tails to escape.",
      "Lizards love warm sunny rocks.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
    quiz: genericQuiz("Lizard", []),
  },
  {
    id: "entry_butterfly",
    categoryId: "animals",
    title: "Butterfly",
    pronunciation: "BUT-ur-fly",
    vocabulary: ["wings", "caterpillar", "nectar"],
    facts: [
      "Butterflies taste with their feet.",
      "A butterfly starts life as a caterpillar.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
    quiz: genericQuiz("Butterfly", []),
  },
  {
    id: "entry_rainbow",
    categoryId: "nature",
    title: "Rainbow",
    pronunciation: "RAIN-boh",
    vocabulary: ["colors", "rain", "sunlight"],
    facts: [
      "Rainbows appear when sunlight meets raindrops.",
      "Every rainbow has the same color order.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
    quiz: genericQuiz("Rainbow", []),
  },
  {
    id: "entry_tree",
    categoryId: "nature",
    title: "Tree",
    pronunciation: "tree",
    vocabulary: ["trunk", "leaves", "roots"],
    facts: [
      "Trees clean the air and give shade.",
      "A tree's rings can tell its age.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
    quiz: genericQuiz("Tree", []),
  },
  {
    id: "entry_ocean",
    categoryId: "ocean",
    title: "Ocean",
    pronunciation: "OH-shun",
    vocabulary: ["waves", "salt", "tide"],
    facts: [
      "Most of Earth is covered by ocean.",
      "Oceans help make the weather we feel every day.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Ocean", []),
  },
  {
    id: "entry_apple",
    categoryId: "food",
    title: "Apple",
    pronunciation: "AP-uhl",
    vocabulary: ["fruit", "orchard", "crisp"],
    facts: ["Apples grow on trees.", "There are thousands of apple kinds."],
    hasVideo: false,
    hasSound: false,
    hasQuiz: true,
    quiz: genericQuiz("Apple", []),
  },
  {
    id: "entry_firetruck",
    categoryId: "vehicles",
    title: "Fire Truck",
    pronunciation: "FIRE truk",
    vocabulary: ["siren", "ladder", "rescue"],
    facts: [
      "Fire trucks carry water, ladders, and brave helpers.",
      "The loud siren asks everyone to make room.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Fire Truck", []),
  },
  {
    id: "entry_train",
    categoryId: "vehicles",
    title: "Train",
    pronunciation: "trayn",
    vocabulary: ["tracks", "engine", "cargo"],
    facts: [
      "Trains ride on metal tracks.",
      "Some trains carry people; others carry cargo.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Train", []),
  },
  {
    id: "entry_excavator",
    categoryId: "construction",
    title: "Excavator",
    pronunciation: "EKS-kuh-vay-ter",
    vocabulary: ["bucket", "dig", "builder"],
    facts: [
      "Excavators dig with a big arm and bucket.",
      "Builders use them to shape the ground.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Excavator", []),
  },
  {
    id: "entry_moon",
    categoryId: "space",
    title: "Moon",
    pronunciation: "moon",
    vocabulary: ["crater", "orbit", "night"],
    facts: [
      "The Moon lights up our night sky.",
      "The Moon has no air like Earth does.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
    quiz: genericQuiz("Moon", []),
  },
  {
    id: "entry_rocket",
    categoryId: "space",
    title: "Rocket",
    pronunciation: "ROK-it",
    vocabulary: ["launch", "astronaut", "space"],
    facts: [
      "Rockets push themselves into space with powerful engines.",
      "Astronauts ride rockets to visit the Moon and beyond.",
    ],
    hasVideo: true,
    hasSound: true,
    hasQuiz: true,
    quiz: genericQuiz("Rocket", []),
  },
  {
    id: "entry_magnet",
    categoryId: "science",
    title: "Magnet",
    pronunciation: "MAG-nit",
    vocabulary: ["north", "south", "attract"],
    facts: [
      "Magnets pull metal things like paperclips.",
      "Every magnet has a north and south side.",
    ],
    hasVideo: true,
    hasSound: false,
    hasQuiz: true,
    quiz: genericQuiz("Magnet", []),
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
