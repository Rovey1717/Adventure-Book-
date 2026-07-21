import type { AdventureCollectionDef } from "@/domain/learning/card";

/**
 * Adventure collections progressed by real-world discoveries.
 * Progress updates on save; unlock UI appears after Learning Card completion.
 */
export const ADVENTURE_COLLECTIONS: AdventureCollectionDef[] = [
  {
    id: "community_helpers",
    title: "Community Helpers",
    emoji: "🦸",
    subtitle: "People and vehicles that help our neighborhood",
    discoveryNames: [
      "Fire Truck",
      "Ambulance",
      "Police Car",
      "Firefighter",
      "School Bus",
      "Mail Truck",
    ],
  },
  {
    id: "emergency_vehicles",
    title: "Emergency Vehicles",
    emoji: "🚨",
    subtitle: "Machines that race to help",
    discoveryNames: ["Fire Truck", "Ambulance", "Police Car"],
  },
  {
    id: "pollinators",
    title: "Pollinators",
    emoji: "🐝",
    subtitle: "Tiny helpers that move pollen and grow food",
    discoveryNames: ["Bee", "Butterfly", "Flower", "Hummingbird"],
  },
  {
    id: "construction",
    title: "Construction Vehicles",
    emoji: "🚧",
    subtitle: "Machines that build our world",
    discoveryNames: ["Excavator", "Crane", "Dump Truck", "Bulldozer"],
  },
  {
    id: "farm_animals",
    title: "Farm Animals",
    emoji: "🐄",
    subtitle: "Friends who live on the farm",
    discoveryNames: ["Cow", "Chicken", "Pig", "Horse", "Duck"],
  },
  {
    id: "ocean_life",
    title: "Ocean Life",
    emoji: "🌊",
    subtitle: "Creatures and wonders of the sea",
    discoveryNames: ["Fish", "Shell", "Crab", "Whale", "Starfish"],
  },
  {
    id: "trees",
    title: "Trees",
    emoji: "🌳",
    subtitle: "Living giants that grow with us",
    discoveryNames: ["Tree", "Oak", "Pine", "Maple", "Leaf"],
  },
];

export function collectionForDiscovery(
  objectName: string,
): AdventureCollectionDef | null {
  const key = objectName.trim().toLowerCase();
  return (
    ADVENTURE_COLLECTIONS.find((collection) =>
      collection.discoveryNames.some((name) => name.toLowerCase() === key),
    ) ?? null
  );
}

export function collectionProgress(
  collection: AdventureCollectionDef,
  discoveredNames: string[],
) {
  const found = new Set(discoveredNames.map((name) => name.toLowerCase()));
  const completed = collection.discoveryNames.filter((name) =>
    found.has(name.toLowerCase()),
  ).length;
  return {
    completed,
    total: collection.discoveryNames.length,
    unlocked: completed >= Math.min(3, collection.discoveryNames.length),
  };
}
