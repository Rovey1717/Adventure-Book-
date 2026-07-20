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
};

const EMOJI_BY_CATEGORY: Record<LibraryCategoryId, string> = {
  animals: "🐾",
  vehicles: "🚗",
  ocean: "🌊",
  food: "🍽️",
  construction: "🚧",
  nature: "🌤️",
};

export function emojiForLibraryEntry(
  title: string,
  categoryId: LibraryCategoryId,
): string {
  return EMOJI_BY_TITLE[title] ?? EMOJI_BY_CATEGORY[categoryId] ?? "✨";
}
