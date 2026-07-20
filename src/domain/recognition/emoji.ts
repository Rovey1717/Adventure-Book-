import type { RecognitionCategory } from "@/domain/recognition/types";

const EMOJI_BY_NAME: Record<string, string> = {
  Dog: "🐕",
  Cat: "🐈",
  Turtle: "🐢",
  Lizard: "🦎",
  Butterfly: "🦋",
  Bear: "🐻",
  Rock: "🪨",
  Tree: "🌳",
  "Fire Truck": "🚒",
  Train: "🚂",
  Excavator: "🏗️",
  Apple: "🍎",
  Banana: "🍌",
  Rainbow: "🌈",
  Ocean: "🌊",
  Building: "🏢",
  Flower: "🌸",
  Bee: "🐝",
  Car: "🚗",
  Boat: "⛵",
};

const EMOJI_BY_CATEGORY: Record<RecognitionCategory, string> = {
  animals: "🐾",
  plants: "🌿",
  vehicles: "🚗",
  buildings: "🏛️",
  food: "🍽️",
  ocean: "🌊",
  insects: "🐛",
  household: "🏠",
  construction: "🚧",
  landmarks: "🗽",
  nature: "🌤️",
  other: "✨",
};

export function emojiForObject(
  name: string,
  category: RecognitionCategory,
): string {
  return EMOJI_BY_NAME[name] ?? EMOJI_BY_CATEGORY[category] ?? "✨";
}
