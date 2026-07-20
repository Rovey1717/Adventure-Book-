export type MemoryCategory =
  | "animals"
  | "vehicles"
  | "plants"
  | "food"
  | "nature"
  | "construction"
  | "other";

const CATEGORY_BY_OBJECT: Record<string, MemoryCategory> = {
  Dog: "animals",
  Cat: "animals",
  Butterfly: "animals",
  Turtle: "animals",
  "Fire Truck": "vehicles",
  Train: "vehicles",
  Excavator: "construction",
  Tree: "plants",
  Apple: "food",
  Banana: "food",
  Rainbow: "nature",
  Ocean: "nature",
};

export function categoryForObject(objectName: string): MemoryCategory {
  return CATEGORY_BY_OBJECT[objectName] ?? "other";
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
    case "construction":
      return "#F08A24";
    default:
      return "#2F6B5A";
  }
}
