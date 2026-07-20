import type { AdventureBlueprint } from "@/domain/adventure/types";

/**
 * Blueprints generate personalized adventures from a Memory.
 * Future AI can replace or extend this list per child profile
 * (age, interests, season, learning goals, adventure history).
 */
export const ADVENTURE_BLUEPRINTS: AdventureBlueprint[] = [
  {
    kind: "language",
    titleFor: (object) => `Learn ${object} in Spanish`,
    points: 20,
  },
  {
    kind: "habitat",
    titleFor: (object) => `Explore ${object} habitat`,
    points: 20,
  },
  {
    kind: "video",
    titleFor: (object) => `Watch a ${object} video`,
    points: 15,
  },
  {
    kind: "sound",
    titleFor: (object) => `Listen to ${object} sounds`,
    points: 15,
  },
  {
    kind: "draw",
    titleFor: (object) => `Draw a ${object}`,
    points: 20,
  },
  {
    kind: "count",
    titleFor: (object) => `Count ${object} features`,
    points: 15,
  },
  {
    kind: "quiz",
    titleFor: (object) => `${object} adventure quiz`,
    points: 25,
  },
  {
    kind: "seek",
    titleFor: (object) => `Find another ${object}`,
    points: 30,
  },
];
