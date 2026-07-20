import type { RecognitionCategory } from "@/domain/recognition/types";

/**
 * Scrapbook categories — aligned with recognition domains so every
 * RecognitionService result maps cleanly into Adventure Book memories.
 */
export type MemoryCategory =
  | "plants"
  | "animals"
  | "vehicles"
  | "buildings"
  | "food"
  | "ocean"
  | "insects"
  | "household"
  | "construction"
  | "landmarks"
  | "nature"
  | "other";

const CATEGORY_BY_OBJECT: Record<string, MemoryCategory> = {
  Dog: "animals",
  Cat: "animals",
  Butterfly: "insects",
  Turtle: "animals",
  Bear: "animals",
  Lizard: "animals",
  Bee: "insects",
  "Fire Truck": "vehicles",
  Train: "vehicles",
  Car: "vehicles",
  Boat: "vehicles",
  Excavator: "construction",
  Tree: "plants",
  Flower: "plants",
  Apple: "food",
  Banana: "food",
  Rainbow: "nature",
  Ocean: "ocean",
  Rock: "nature",
  Building: "buildings",
};

export function categoryForObject(objectName: string): MemoryCategory {
  return CATEGORY_BY_OBJECT[objectName] ?? "other";
}

export function memoryCategoryFromRecognition(
  category: RecognitionCategory,
): MemoryCategory {
  return category;
}

export function accentForCategory(category: MemoryCategory): string {
  switch (category) {
    case "animals":
      return "#C97B63";
    case "vehicles":
      return "#D64545";
    case "plants":
      return "#3D8B6E";
    case "food":
      return "#E8A04A";
    case "nature":
      return "#6B9BD1";
    case "ocean":
      return "#4A90C8";
    case "insects":
      return "#C4A35A";
    case "construction":
      return "#F08A24";
    case "buildings":
      return "#7A8BA0";
    case "household":
      return "#8B6B5A";
    case "landmarks":
      return "#5B6FA8";
    default:
      return "#2F6B5A";
  }
}
