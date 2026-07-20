import type { LibraryCategoryId } from "@/domain/library/types";

const EMOJI_BY_TITLE: Record<string, string> = {
  Turtle: "🐢",
  Dog: "🐕",
  Cat: "🐈",
  Bear: "🐻",
  Lizard: "🦎",
  Butterfly: "🦋",
  "Fire Truck": "🚒",
  Train: "🚂",
  Excavator: "🏗️",
  Apple: "🍎",
  Ocean: "🌊",
  Rainbow: "🌈",
  Moon: "🌙",
  Rocket: "🚀",
  Magnet: "🧲",
  Tree: "🌳",
};

const EMOJI_BY_CATEGORY: Record<LibraryCategoryId, string> = {
  animals: "🐾",
  nature: "🌤️",
  ocean: "🌊",
  food: "🍽️",
  vehicles: "🚗",
  construction: "🚧",
  space: "🪐",
  science: "🔬",
};

export function emojiForLibraryEntry(
  title: string,
  categoryId: LibraryCategoryId,
): string {
  return EMOJI_BY_TITLE[title] ?? EMOJI_BY_CATEGORY[categoryId] ?? "✨";
}
