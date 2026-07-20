import type { Adventure } from "@/domain/adventure/types";
import type { Memory } from "@/domain/memory/types";
import type { MemoryCategory } from "@/domain/shared/categories";

export type JourneyBadge = {
  id: string;
  title: string;
  earnedAt: string;
};

export type JourneyCollection = {
  id: string;
  category: MemoryCategory;
  title: string;
  count: number;
};

export type JourneySnapshot = {
  streakDays: number;
  totalDiscoveries: number;
  badges: JourneyBadge[];
  learningProgress: number;
  animalsDiscovered: number;
  vehiclesDiscovered: number;
  plantsDiscovered: number;
  weeklyGoal: {
    current: number;
    target: number;
  };
  favoriteMemories: Memory[];
  upcomingAdventures: Adventure[];
  recentlyCompletedAdventures: Adventure[];
  collections: JourneyCollection[];
};
