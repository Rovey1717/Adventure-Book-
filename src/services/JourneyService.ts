import type { AdventureRepository } from "@/data/adventure/AdventureRepository";
import type { DiscoveryRepository } from "@/data/discovery/DiscoveryRepository";
import type { MemoryRepository } from "@/data/memory/MemoryRepository";
import type { JourneySnapshot } from "@/domain/journey/types";
import type { MemoryCategory } from "@/domain/shared/categories";

const COLLECTION_TITLES: Record<MemoryCategory, string> = {
  animals: "Animals",
  vehicles: "Vehicles",
  plants: "Plants",
  food: "Food",
  nature: "Nature",
  ocean: "Ocean",
  insects: "Insects",
  construction: "Construction",
  buildings: "Buildings",
  household: "Household",
  landmarks: "Landmarks",
  other: "More",
};

export class JourneyService {
  constructor(
    private readonly discoveries: DiscoveryRepository,
    private readonly memories: MemoryRepository,
    private readonly adventures: AdventureRepository,
  ) {}

  async getSnapshot(): Promise<JourneySnapshot> {
    const [discoveryList, memoryList, adventureList] = await Promise.all([
      this.discoveries.getAll(),
      this.memories.getAll(),
      this.adventures.getAll(),
    ]);

    const completedAdventures = adventureList.filter(
      (item) => item.status === "completed",
    );
    const upcoming = adventureList
      .filter((item) => item.status === "unlocked" || item.status === "in_progress")
      .slice(0, 5);

    const uniqueObjects = new Set(memoryList.map((item) => item.objectName));
    const learningProgress =
      adventureList.length === 0
        ? 0
        : completedAdventures.length / adventureList.length;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyCurrent = discoveryList.filter(
      (item) => new Date(item.createdAt).getTime() >= weekAgo,
    ).length;

    const collections = (
      Object.keys(COLLECTION_TITLES) as MemoryCategory[]
    )
      .map((category) => ({
        id: `col_${category}`,
        category,
        title: COLLECTION_TITLES[category],
        count: memoryList.filter((item) => item.category === category).length,
      }))
      .filter((item) => item.count > 0);

    const badges = [];
    if (discoveryList.length >= 1) {
      badges.push({
        id: "badge_first",
        title: "First Discovery",
        earnedAt: discoveryList[discoveryList.length - 1]?.createdAt ?? new Date().toISOString(),
      });
    }
    if (uniqueObjects.size >= 3) {
      badges.push({
        id: "badge_collector",
        title: "Curious Collector",
        earnedAt: new Date().toISOString(),
      });
    }
    if (completedAdventures.length >= 1) {
      badges.push({
        id: "badge_learner",
        title: "Adventure Starter",
        earnedAt: completedAdventures[0]?.completedAt ?? new Date().toISOString(),
      });
    }

    return {
      streakDays: Math.min(discoveryList.length, 7) || 0,
      totalDiscoveries: discoveryList.length,
      badges,
      learningProgress,
      animalsDiscovered: memoryList.filter((item) => item.category === "animals")
        .length,
      vehiclesDiscovered: memoryList.filter(
        (item) => item.category === "vehicles" || item.category === "construction",
      ).length,
      plantsDiscovered: memoryList.filter(
        (item) => item.category === "plants" || item.category === "food",
      ).length,
      weeklyGoal: {
        current: weeklyCurrent,
        target: 5,
      },
      favoriteMemories: memoryList.filter((item) => item.isFavorite).slice(0, 5),
      upcomingAdventures: upcoming,
      recentlyCompletedAdventures: completedAdventures.slice(0, 5),
      collections,
    };
  }
}
