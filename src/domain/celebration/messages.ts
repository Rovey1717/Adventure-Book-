/**
 * Personalized celebration copy — rotates naturally, celebrates the child.
 * Family AI surfaces these at every celebration moment; never school-grade tone.
 */

export type CelebrationContext =
  | "burst"
  | "decision"
  | "lesson"
  | "unlock"
  | "toast"
  | "growth";

export type CelebrationProgressKind =
  | "explorer_xp"
  | "explorer_level"
  | "new_badge"
  | "adventure_progress"
  | "collection_progress"
  | "learning_journey"
  | "memory_added";

export type CelebrationProgress = {
  kind: CelebrationProgressKind;
  emoji: string;
  label: string;
};

export type CelebrationPick = {
  emoji: string;
  /** Primary cheer — already includes the child's name when appropriate */
  headline: string;
  /** Secondary line about the discovery or growth */
  subline: string;
  progress: CelebrationProgress;
};

type Template = {
  emoji: string;
  /** Use {name} and optional {discovery} */
  headline: string;
  subline: string;
};

const PERSONAL: Template[] = [
  { emoji: "🎉", headline: "Amazing, {name}!", subline: "You found something wonderful." },
  { emoji: "🌟", headline: "Great job, {name}!", subline: "Your Adventure Book just grew." },
  { emoji: "🦋", headline: "Nice discovery, {name}!", subline: "You noticed something new." },
  { emoji: "🚀", headline: "You're becoming an amazing explorer, {name}!", subline: "Keep that curious spark going." },
  { emoji: "🌎", headline: "{name}, your world just got a little bigger!", subline: "Another real-world wonder saved." },
  { emoji: "🌸", headline: "You discovered something new today, {name}!", subline: "That curiosity is growing." },
  { emoji: "🐝", headline: "Another adventure completed, {name}!", subline: "You're filling your book with wonders." },
  { emoji: "✨", headline: "You did it, {name}!", subline: "Look how far you've come." },
  { emoji: "🌈", headline: "Way to go, {name}!", subline: "Explorers like you make magic happen." },
  { emoji: "💫", headline: "You're on a roll, {name}!", subline: "Every discovery makes you stronger." },
  { emoji: "🌻", headline: "Wow, {name}!", subline: "You looked carefully and found something special." },
  { emoji: "🦁", headline: "Brave exploring, {name}!", subline: "You kept going and found a treasure." },
  { emoji: "🎈", headline: "Hip hip hooray, {name}!", subline: "This one belongs in your Adventure Book." },
  { emoji: "🍀", headline: "Lucky find, {name}!", subline: "Or maybe just sharp explorer eyes." },
  { emoji: "🌙", headline: "{name}, you lit up a new page!", subline: "Your story keeps getting brighter." },
  { emoji: "🧩", headline: "You found a missing piece, {name}!", subline: "Your collection of wonders is growing." },
  { emoji: "🔥", headline: "You're on fire, {name}!", subline: "Curiosity looks great on you." },
  { emoji: "🐣", headline: "Look at you grow, {name}!", subline: "Every discovery teaches something new." },
  { emoji: "🎯", headline: "Nailed it, {name}!", subline: "You spotted something worth saving." },
  { emoji: "💛", headline: "So proud of you, {name}!", subline: "Your Adventure Book is becoming uniquely yours." },
];

const CURIOSITY: Template[] = [
  { emoji: "👀", headline: "You kept exploring!", subline: "That's how great discoveries happen." },
  { emoji: "💭", headline: "You asked a great question!", subline: "Curious minds grow the fastest." },
  { emoji: "🔍", headline: "You noticed something new!", subline: "Sharp eyes make amazing explorers." },
  { emoji: "🧐", headline: "You looked carefully!", subline: "Details turn into discoveries." },
  { emoji: "🪄", headline: "That was an awesome discovery!", subline: "Wonder starts with paying attention." },
  { emoji: "🌿", headline: "You found something amazing!", subline: "The real world is full of surprises." },
  { emoji: "📚", headline: "Look how much you've learned!", subline: "Every page makes you wiser." },
  { emoji: "📖", headline: "Your Adventure Book is growing!", subline: "This chapter is all about you." },
  { emoji: "🔓", headline: "You unlocked something new!", subline: "More adventures are waiting." },
  { emoji: "🗂", headline: "One more discovery for your collection!", subline: "Collectors of wonder never stop." },
  { emoji: "🧭", headline: "You've become a better explorer today!", subline: "Practice turns into skill." },
  { emoji: "🌊", headline: "You followed your curiosity!", subline: "That's the explorer way." },
  { emoji: "🎨", headline: "You saw the world in a new way!", subline: "Every find changes the picture." },
  { emoji: "🦶", headline: "One more step on your journey!", subline: "Little steps become big adventures." },
  { emoji: "🪐", headline: "Your curiosity sky got brighter!", subline: "Keep noticing. Keep wondering." },
];

const DISCOVERY: Template[] = [
  { emoji: "⭐", headline: "You found a {discovery}!", subline: "A forever memory for your book." },
  { emoji: "🏷", headline: "{name} found a {discovery}!", subline: "Saved to your Adventure Book." },
  { emoji: "📸", headline: "Say hello to your {discovery}, {name}!", subline: "Real life, captured forever." },
  { emoji: "🗺", headline: "{name} mapped a new {discovery}!", subline: "Your explorer map just expanded." },
  { emoji: "💎", headline: "A {discovery} treasure for {name}!", subline: "Rare finds belong in your book." },
];

const UNLOCK: Template[] = [
  { emoji: "🎉", headline: "Adventure unlocked, {name}!", subline: "Your learning just opened a new door." },
  { emoji: "🚀", headline: "{name}, a new adventure awaits!", subline: "You earned this by exploring." },
  { emoji: "🏅", headline: "You unlocked something big, {name}!", subline: "Progress feels this good for a reason." },
  { emoji: "🌟", headline: "New path ahead, {name}!", subline: "Your Adventure Book keeps growing with you." },
  { emoji: "🔓", headline: "You opened a new adventure!", subline: "Curiosity unlocked this for you." },
];

const LESSON: Template[] = [
  { emoji: "🎉", headline: "Amazing, {name}!", subline: "You learned something new." },
  { emoji: "🌟", headline: "Great job, {name}!", subline: "Your learning journey just grew." },
  { emoji: "🧠", headline: "You figured it out, {name}!", subline: "Thinking carefully pays off." },
  { emoji: "💪", headline: "You're getting stronger, {name}!", subline: "Practice makes explorers." },
  { emoji: "✨", headline: "You did it, {name}!", subline: "Another step on your path." },
  { emoji: "🦋", headline: "Nice work, {name}!", subline: "Curiosity turned into knowing." },
  { emoji: "🌈", headline: "Way to go, {name}!", subline: "You're building real explorer skills." },
  { emoji: "🔍", headline: "You noticed something new!", subline: "Sharp thinking, explorer." },
  { emoji: "🚀", headline: "Leveling up, {name}!", subline: "Your Learning Journey is moving." },
  { emoji: "💛", headline: "Proud of you, {name}!", subline: "Keep exploring at your pace." },
];

const TOAST: Template[] = [
  { emoji: "⭐", headline: "Great job, {name}!", subline: "Saved to your Adventure Book." },
  { emoji: "✨", headline: "You did it, {name}!", subline: "Another wonder in the book." },
  { emoji: "🌟", headline: "Nice find, {name}!", subline: "Your collection grew." },
  { emoji: "📖", headline: "Book page added!", subline: "Your story continues." },
  { emoji: "🚀", headline: "Keep exploring, {name}!", subline: "The next wonder is waiting." },
  { emoji: "💛", headline: "Saved forever, {name}!", subline: "This moment is yours." },
];

const PROGRESS_BY_CONTEXT: Record<
  CelebrationContext,
  CelebrationProgress[]
> = {
  burst: [
    { kind: "memory_added", emoji: "📖", label: "Memory Added" },
    { kind: "new_badge", emoji: "🏅", label: "Discovery Star" },
    { kind: "explorer_xp", emoji: "⚡", label: "Explorer XP +" },
    { kind: "adventure_progress", emoji: "🗺", label: "Adventure Progress" },
  ],
  decision: [
    { kind: "memory_added", emoji: "📖", label: "Memory Added" },
    { kind: "collection_progress", emoji: "🗂", label: "Collection Progress" },
    { kind: "explorer_xp", emoji: "⚡", label: "Explorer XP +" },
    { kind: "adventure_progress", emoji: "🗺", label: "Adventure Progress" },
  ],
  lesson: [
    { kind: "learning_journey", emoji: "🌱", label: "Learning Journey Progress" },
    { kind: "explorer_xp", emoji: "⚡", label: "Explorer XP +" },
    { kind: "explorer_level", emoji: "⭐", label: "Explorer Level" },
    { kind: "new_badge", emoji: "🏅", label: "New Badge" },
  ],
  unlock: [
    { kind: "adventure_progress", emoji: "🗺", label: "Adventure Progress" },
    { kind: "new_badge", emoji: "🏅", label: "New Badge" },
    { kind: "explorer_xp", emoji: "⚡", label: "Explorer XP +" },
    { kind: "learning_journey", emoji: "🌱", label: "Learning Journey Progress" },
  ],
  toast: [
    { kind: "memory_added", emoji: "📖", label: "Memory Added" },
    { kind: "collection_progress", emoji: "🗂", label: "Collection Progress" },
    { kind: "explorer_xp", emoji: "⚡", label: "Explorer XP +" },
  ],
  growth: [
    { kind: "explorer_level", emoji: "⭐", label: "Explorer Level" },
    { kind: "learning_journey", emoji: "🌱", label: "Learning Journey Progress" },
    { kind: "explorer_xp", emoji: "⚡", label: "Explorer XP +" },
  ],
};

const LIBRARY: Record<CelebrationContext, Template[]> = {
  burst: [...PERSONAL, ...CURIOSITY, ...DISCOVERY],
  decision: [...PERSONAL, ...DISCOVERY, ...CURIOSITY],
  lesson: LESSON,
  unlock: UNLOCK,
  toast: TOAST,
  growth: [...CURIOSITY, ...PERSONAL],
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickIndex(length: number, seed?: string): number {
  if (length <= 0) return 0;
  if (!seed) return Math.floor(Math.random() * length);
  return hashSeed(seed) % length;
}

/** First name only — celebrations should feel personal, not formal. */
export function celebrationFirstName(childName: string): string {
  const trimmed = childName.trim();
  if (!trimmed) return "Explorer";
  return trimmed.split(/\s+/)[0] ?? "Explorer";
}

function fill(
  template: string,
  vars: { name: string; discovery?: string },
): string {
  return template
    .replaceAll("{name}", vars.name)
    .replaceAll("{discovery}", vars.discovery ?? "discovery");
}

function withLevelLabel(
  progress: CelebrationProgress,
  explorerLevel?: number,
): CelebrationProgress {
  if (progress.kind === "explorer_level" && explorerLevel != null) {
    return { ...progress, label: `Explorer Level ${explorerLevel}` };
  }
  if (progress.kind === "explorer_xp") {
    return { ...progress, label: "Explorer XP +" };
  }
  return progress;
}

export type PickCelebrationInput = {
  childName: string;
  discoveryName?: string;
  context: CelebrationContext;
  /** Stable rotation key (e.g. memoryId + context). Omit for fresh random. */
  seed?: string;
  explorerLevel?: number;
  discoveryCount?: number;
};

/**
 * Pick a rotating, personalized celebration for the given moment.
 * Prefer a seed so the same discovery doesn't flicker on remount.
 */
export function pickCelebration(input: PickCelebrationInput): CelebrationPick {
  const name = celebrationFirstName(input.childName);
  const discovery = input.discoveryName?.trim() || undefined;
  const templates = LIBRARY[input.context];
  const seed =
    input.seed ??
    `${input.context}:${name}:${discovery ?? ""}:${Date.now()}`;

  const template = templates[pickIndex(templates.length, seed)]!;
  const progressPool = PROGRESS_BY_CONTEXT[input.context];
  const progress = withLevelLabel(
    progressPool[pickIndex(progressPool.length, `${seed}:progress`)]!,
    input.explorerLevel,
  );

  let subline = fill(template.subline, { name, discovery });
  if (input.discoveryCount != null && input.discoveryCount > 0) {
    if (progress.kind === "memory_added" || progress.kind === "collection_progress") {
      subline =
        input.discoveryCount === 1
          ? `${name}'s first Adventure Book page!`
          : `${input.discoveryCount} discoveries in ${name}'s book.`;
    }
  }

  return {
    emoji: template.emoji,
    headline: fill(template.headline, { name, discovery }),
    subline,
    progress,
  };
}

/** Short cheer string for toasts / compact UI. */
export function pickCelebrationCheer(input: {
  childName: string;
  seed?: string;
}): string {
  const picked = pickCelebration({
    childName: input.childName,
    context: "toast",
    seed: input.seed,
  });
  return `${picked.emoji} ${picked.headline}`;
}

/** Lesson-phase praise that always feels personal and growth-focused. */
export function pickLessonCelebration(input: {
  childName: string;
  discoveryTitle?: string;
  seed?: string;
  unlockHint?: string;
}): {
  title: string;
  praise: string;
  unlockHint: string;
  progressLabel: string;
} {
  const picked = pickCelebration({
    childName: input.childName,
    discoveryName: input.discoveryTitle,
    context: "lesson",
    seed: input.seed,
  });
  const progressLabel = `${picked.progress.emoji} ${picked.progress.label}`;
  return {
    title: picked.headline,
    praise: picked.subline,
    unlockHint: input.unlockHint
      ? `${progressLabel} · ${input.unlockHint}`
      : progressLabel,
    progressLabel,
  };
}
