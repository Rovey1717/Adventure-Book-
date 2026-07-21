/**
 * Explorer XP & levels — continuous progress across every discovery.
 *
 * Completing lessons earns XP. Levels unlock richer adventures,
 * collections, harder lessons, badges, and story chapters.
 * Separate from age bands (developmental readiness).
 */

export type ExplorerUnlockKind =
  | "adventures"
  | "collections"
  | "harder_lessons"
  | "badges"
  | "story_chapters"
  | "hidden_discoveries";

export type ExplorerLevelDef = {
  level: number;
  title: string;
  /** XP required to REACH this level (cumulative). */
  xpRequired: number;
  unlocks: ExplorerUnlockKind[];
  emoji: string;
};

/** Cumulative XP thresholds — endless feel with clear early wins. */
export const EXPLORER_LEVELS: ExplorerLevelDef[] = [
  {
    level: 1,
    title: "Curious Spark",
    xpRequired: 0,
    unlocks: [],
    emoji: "✨",
  },
  {
    level: 2,
    title: "Little Explorer",
    xpRequired: 30,
    unlocks: ["badges"],
    emoji: "🌱",
  },
  {
    level: 3,
    title: "Garden Wanderer",
    xpRequired: 80,
    unlocks: ["collections", "adventures"],
    emoji: "🗺",
  },
  {
    level: 4,
    title: "Nature Detective",
    xpRequired: 160,
    unlocks: ["harder_lessons", "story_chapters"],
    emoji: "🔍",
  },
  {
    level: 5,
    title: "World Connector",
    xpRequired: 280,
    unlocks: ["hidden_discoveries"],
    emoji: "🌍",
  },
  {
    level: 6,
    title: "Master Explorer",
    xpRequired: 420,
    unlocks: ["adventures", "story_chapters", "hidden_discoveries"],
    emoji: "🏆",
  },
];

export type ExplorerProgress = {
  totalXp: number;
  level: number;
  title: string;
  emoji: string;
  /** Progress 0–1 toward next level */
  progressToNext: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  unlocks: ExplorerUnlockKind[];
  justLeveledUp?: boolean;
  previousLevel?: number;
};

export type LessonXpKind = "digital" | "real_world" | "connection" | "mastery";

/** Tiny lessons → small XP; real-world & connections feel equally valuable. */
export function xpForLessonKind(kind: LessonXpKind): number {
  switch (kind) {
    case "digital":
      return 10;
    case "real_world":
      return 12;
    case "connection":
      return 14;
    case "mastery":
      return 20;
  }
}

export function explorerProgressFromXp(
  totalXp: number,
  previousXp?: number,
): ExplorerProgress {
  const xp = Math.max(0, Math.floor(totalXp));
  let current = EXPLORER_LEVELS[0];
  for (const def of EXPLORER_LEVELS) {
    if (xp >= def.xpRequired) current = def;
  }

  const next =
    EXPLORER_LEVELS.find((def) => def.level === current.level + 1) ?? null;
  const floor = current.xpRequired;
  const ceiling = next?.xpRequired ?? floor + 100;
  const span = Math.max(1, ceiling - floor);
  const xpIntoLevel = xp - floor;
  const progressToNext = next ? Math.min(1, xpIntoLevel / span) : 1;

  const previousLevel =
    previousXp != null
      ? explorerProgressFromXp(previousXp).level
      : current.level;

  return {
    totalXp: xp,
    level: current.level,
    title: current.title,
    emoji: current.emoji,
    progressToNext,
    xpIntoLevel,
    xpForNextLevel: next ? ceiling - xp : 0,
    unlocks: current.unlocks,
    justLeveledUp: previousXp != null && current.level > previousLevel,
    previousLevel:
      previousXp != null && current.level > previousLevel
        ? previousLevel
        : undefined,
  };
}

export function unlockLabel(kind: ExplorerUnlockKind): string {
  switch (kind) {
    case "adventures":
      return "New Adventures";
    case "collections":
      return "New Collections";
    case "harder_lessons":
      return "Harder Lessons";
    case "badges":
      return "Special Badges";
    case "story_chapters":
      return "Story Chapters";
    case "hidden_discoveries":
      return "Hidden Discoveries";
  }
}
