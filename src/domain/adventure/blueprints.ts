import type { AdventureBlueprint } from "@/domain/adventure/types";

/**
 * Blueprints are data-driven generators.
 * Future AI can replace or extend this list per child profile.
 */
export const ADVENTURE_BLUEPRINTS: AdventureBlueprint[] = [
  {
    kind: "language",
    titleFor: (object) => `Learn ${object} in Spanish`,
    points: 20,
  },
  {
    kind: "video",
    titleFor: (object) => `Watch a 20-second ${object} video`,
    points: 15,
  },
  {
    kind: "quiz",
    titleFor: (object) => `${object} quiz`,
    points: 25,
  },
  {
    kind: "draw",
    titleFor: (object) => `Draw a ${object}`,
    points: 20,
  },
  {
    kind: "seek",
    titleFor: (object) => `Find another ${object}`,
    points: 30,
  },
  {
    kind: "habitat",
    titleFor: (object) => `Learn ${object} habitat`,
    points: 20,
  },
  {
    kind: "sound",
    titleFor: (object) => `Listen to ${object} sounds`,
    points: 15,
  },
];
