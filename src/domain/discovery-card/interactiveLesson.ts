/**
 * Interactive lesson flows — Duolingo-style levels for Discovery Cards.
 *
 * Every lesson: intro → activity → mini-challenge → celebration → unlock next.
 * Completes automatically when the child finishes — never "Mark Complete."
 */

import type {
  LearningJourneyStep,
  LearningJourneyStepId,
} from "@/domain/discovery-card/learningJourneyPath";
import {
  celebrationFirstName,
  pickLessonCelebration,
} from "@/domain/celebration/messages";

/** Weave the child's first name into lesson praise when missing. */
function personalizeLessonPraise(praise: string, childName: string): string {
  const name = celebrationFirstName(childName);
  if (praise.includes(name)) return praise;
  if (praise.endsWith("!")) return `${praise.slice(0, -1)}, ${name}!`;
  return `${praise}, ${name}!`;
}

export type LessonPhaseKind =
  | "intro"
  | "activity"
  | "challenge"
  | "celebrate";

export type LessonChoice = {
  id: string;
  label: string;
  emoji?: string;
  correct: boolean;
};

export type LessonTapTarget = {
  id: string;
  label: string;
  emoji: string;
};

export type LessonInteraction =
  | {
      type: "tap_continue";
      label: string;
    }
  | {
      type: "tap_hear";
      word: string;
      pronunciation: string;
      label: string;
    }
  | {
      type: "tap_targets";
      prompt: string;
      targets: LessonTapTarget[];
    }
  | {
      type: "pick_one";
      prompt: string;
      choices: LessonChoice[];
    }
  | {
      type: "parent_confirm";
      prompt: string;
      confirmLabel: string;
    }
  | {
      type: "real_world";
      prompt: string;
      tips: string[];
      completeLabel: string;
      /** When true, primary action opens Discover camera. */
      openDiscover?: boolean;
    }
  | {
      type: "celebrate";
      praise: string;
      unlockHint: string;
    };

export type LessonPhase = {
  kind: LessonPhaseKind;
  emoji: string;
  title: string;
  body?: string;
  interaction: LessonInteraction;
};

export type InteractiveLesson = {
  stepId: LearningJourneyStepId;
  discoveryTitle: string;
  emoji: string;
  phases: LessonPhase[];
};

export type InteractiveLessonContext = {
  discoveryTitle: string;
  emoji: string;
  pronunciation: string;
  vocabulary: string[];
  facts: string[];
  quiz?: { question: string; choices: string[]; answerIndex: number }[];
  childName: string;
  connectionName?: string;
  connectionEmoji?: string;
};

function vocabParts(
  vocabulary: string[],
  discoveryTitle: string,
): LessonTapTarget[] {
  const defaults: LessonTapTarget[] = [
    { id: "part_1", label: "Look closely", emoji: "👀" },
    { id: "part_2", label: "Notice shape", emoji: "✨" },
    { id: "part_3", label: "Find color", emoji: "🎨" },
  ];
  if (vocabulary.length === 0) return defaults;
  const emojis = ["🌸", "🌿", "💛", "🍃", "✨", "🌱"];
  return vocabulary.slice(0, 3).map((word, index) => ({
    id: `part_${word}`,
    label: word,
    emoji: emojis[index] ?? "✨",
  }));
}

function colorChoices(discoveryTitle: string): LessonChoice[] {
  const lower = discoveryTitle.toLowerCase();
  const isFlower =
    lower.includes("flower") ||
    lower.includes("daisy") ||
    lower.includes("rose") ||
    lower.includes("sunflower");
  if (isFlower) {
    return [
      { id: "yellow", label: "Yellow", emoji: "💛", correct: true },
      { id: "blue", label: "Blue", emoji: "💙", correct: false },
      { id: "green", label: "Green", emoji: "💚", correct: false },
    ];
  }
  return [
    { id: "bright", label: "Bright", emoji: "✨", correct: true },
    { id: "invisible", label: "Invisible", emoji: "👻", correct: false },
    { id: "square", label: "Square", emoji: "⬛", correct: false },
  ];
}

function matchChoices(
  emoji: string,
  discoveryTitle: string,
): LessonChoice[] {
  return [
    { id: "correct", label: discoveryTitle, emoji, correct: true },
    { id: "wrong_a", label: "Rocket", emoji: "🚀", correct: false },
    { id: "wrong_b", label: "Cloud", emoji: "☁️", correct: false },
  ];
}

function quizChoices(
  quiz: InteractiveLessonContext["quiz"],
  discoveryTitle: string,
  emoji: string,
): { prompt: string; choices: LessonChoice[] } {
  const first = quiz?.[0];
  if (first) {
    return {
      prompt: first.question,
      choices: first.choices.map((label, index) => ({
        id: `q_${index}`,
        label,
        correct: index === first.answerIndex,
      })),
    };
  }
  return {
    prompt: `What did you learn about a ${discoveryTitle}?`,
    choices: [
      {
        id: "ok",
        label: `Something wonderful about a ${discoveryTitle}`,
        emoji,
        correct: true,
      },
      { id: "no", label: "Nothing at all", emoji: "🙈", correct: false },
    ],
  };
}

function whyChoices(
  facts: string[],
  discoveryTitle: string,
): { prompt: string; choices: LessonChoice[] } {
  const fact = facts[0] ?? `${discoveryTitle}s are part of the living world.`;
  return {
    prompt: `Why do explorers care about a ${discoveryTitle}?`,
    choices: [
      { id: "fact", label: fact, emoji: "🌍", correct: true },
      {
        id: "nope",
        label: "Because it is made of metal cars",
        emoji: "🚗",
        correct: false,
      },
      {
        id: "nope2",
        label: "Because it lives on the moon",
        emoji: "🌙",
        correct: false,
      },
    ],
  };
}

/**
 * Build a fully interactive lesson from a journey step.
 * Discovery-agnostic templates — Family AI can specialize later.
 */
export function buildInteractiveLesson(
  step: LearningJourneyStep,
  ctx: InteractiveLessonContext,
): InteractiveLesson {
  const { discoveryTitle, emoji, pronunciation, vocabulary, facts, quiz, childName } =
    ctx;
  const connectionName = ctx.connectionName ?? "related wonder";
  const connectionEmoji = ctx.connectionEmoji ?? "✨";
  const parts = vocabParts(vocabulary, discoveryTitle);
  const celebrate = (
    praise: string,
    unlockHint = "Next lesson unlocked!",
  ): LessonPhase => {
    const picked = pickLessonCelebration({
      childName,
      discoveryTitle,
      seed: `${step.id}:${praise}`,
      unlockHint,
    });
    const personalized = personalizeLessonPraise(praise, childName);
    return {
      kind: "celebrate",
      emoji: "🎉",
      title: picked.title,
      body: personalized,
      interaction: {
        type: "celebrate",
        praise: personalized,
        unlockHint: picked.unlockHint,
      },
    };
  };

  const intro = (
    title: string,
    body: string,
    introEmoji = emoji,
  ): LessonPhase => ({
    kind: "intro",
    emoji: introEmoji,
    title,
    body,
    interaction: { type: "tap_continue", label: "Let's go!" },
  });

  switch (step.activityKind) {
    case "discover":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro(`Find a ${discoveryTitle}`, "Go outside and discover one in the real world."),
          {
            kind: "activity",
            emoji: "📷",
            title: "Ready to explore?",
            body: "Open Discover and capture what you find.",
            interaction: {
              type: "real_world",
              prompt: `Find a real ${discoveryTitle}`,
              tips: [
                "Look carefully around you",
                "Ask a grown-up to help",
                "Take a photo when you find it",
              ],
              completeLabel: "I found one!",
              openDiscover: true,
            },
          },
          {
            kind: "challenge",
            emoji: "👀",
            title: "Look once more",
            body: "Notice one special detail before you finish.",
            interaction: {
              type: "tap_continue",
              label: "I noticed something!",
            },
          },
          celebrate(`You discovered a ${discoveryTitle}!`, "Name lesson unlocked!"),
        ],
      };

    case "name":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro(`Meet the ${discoveryTitle}`, `This is a ${discoveryTitle}!`, emoji),
          {
            kind: "activity",
            emoji,
            title: `This is a ${discoveryTitle}!`,
            body: "Tap to hear the name.",
            interaction: {
              type: "tap_hear",
              word: discoveryTitle,
              pronunciation,
              label: "Tap to hear",
            },
          },
          {
            kind: "challenge",
            emoji: "🗣️",
            title: "Say it with me",
            body: `Can you say "${discoveryTitle}"?`,
            interaction: {
              type: "parent_confirm",
              prompt: `${childName} said the name`,
              confirmLabel: "We said it!",
            },
          },
          celebrate(`You met the ${discoveryTitle}!`, "Pronunciation unlocked!"),
        ],
      };

    case "sound":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro("Hear the name", "Listen carefully, then say it aloud."),
          {
            kind: "activity",
            emoji: "🔊",
            title: pronunciation,
            body: `That's how we say ${discoveryTitle}.`,
            interaction: {
              type: "tap_hear",
              word: discoveryTitle,
              pronunciation,
              label: "Play again",
            },
          },
          {
            kind: "challenge",
            emoji: "🎤",
            title: "Your turn",
            body: "Say it three times!",
            interaction: {
              type: "parent_confirm",
              prompt: "Said it three times",
              confirmLabel: "We did it!",
            },
          },
          celebrate("Beautiful pronunciation!", "Picture match unlocked!"),
        ],
      };

    case "match":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro("Match the picture", `Which one is the ${discoveryTitle}?`),
          {
            kind: "activity",
            emoji,
            title: "Find it",
            body: "Tap the matching picture.",
            interaction: {
              type: "pick_one",
              prompt: `Which one is a ${discoveryTitle}?`,
              choices: matchChoices(emoji, discoveryTitle),
            },
          },
          {
            kind: "challenge",
            emoji: "⭐",
            title: "Quick check",
            body: "Tap the right one once more.",
            interaction: {
              type: "pick_one",
              prompt: `Point to the ${discoveryTitle}`,
              choices: matchChoices(emoji, discoveryTitle),
            },
          },
          celebrate("Perfect match!", "Parts lesson unlocked!"),
        ],
      };

    case "lesson":
      if (step.id === "learn_parts") {
        return {
          stepId: step.id,
          discoveryTitle,
          emoji,
          phases: [
            intro(`${discoveryTitle} parts`, "Tap each part to explore."),
            {
              kind: "activity",
              emoji: "🔍",
              title: "Find the parts",
              body: "Tap every glowing part.",
              interaction: {
                type: "tap_targets",
                prompt: `Explore the ${discoveryTitle}`,
                targets: parts,
              },
            },
            {
              kind: "challenge",
              emoji: "🧠",
              title: "Remember one",
              body: "Which part did you like most?",
              interaction: {
                type: "pick_one",
                prompt: "Pick a part you found",
                choices: parts.map((part, index) => ({
                  id: part.id,
                  label: part.label,
                  emoji: part.emoji,
                  correct: true,
                })),
              },
            },
            celebrate("You know the parts!", "Why-it-matters unlocked!"),
          ],
        };
      }
      // learn_why / connection
      {
        const why = whyChoices(facts, discoveryTitle);
        return {
          stepId: step.id,
          discoveryTitle,
          emoji,
          phases: [
            intro("Why it matters", `How a ${discoveryTitle} connects to the world.`),
            {
              kind: "activity",
              emoji: "🌍",
              title: "A little wonder",
              body: facts[0] ?? `${discoveryTitle}s help the living world.`,
              interaction: { type: "tap_continue", label: "Cool!" },
            },
            {
              kind: "challenge",
              emoji: "🐝",
              title: "Connection challenge",
              body: why.prompt,
              interaction: {
                type: "pick_one",
                prompt: why.prompt,
                choices: why.choices,
              },
            },
            celebrate("Beautiful connection!", "Real-world seek unlocked!"),
          ],
        };
      }

    case "seek":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro(
            step.id === "find_three"
              ? "Find a different color"
              : `Find another ${discoveryTitle}`,
            "Go outside — real-world missions are as valuable as digital lessons.",
          ),
          {
            kind: "activity",
            emoji: "🗺",
            title: "Treasure hunt",
            body: "Look, smell, touch (gently), and notice something new.",
            interaction: {
              type: "real_world",
              prompt:
                step.id === "find_three"
                  ? `Find a ${discoveryTitle} in a different color`
                  : `Find another ${discoveryTitle}`,
              tips: [
                "Count what you see",
                "Notice a new detail",
                "Take a photo if you can",
              ],
              completeLabel: "Adventure complete!",
              openDiscover: true,
            },
          },
          {
            kind: "challenge",
            emoji: "📷",
            title: "One more look",
            body: "Did you notice something different this time?",
            interaction: {
              type: "parent_confirm",
              prompt: "We noticed something new",
              confirmLabel: "Yes!",
            },
          },
          celebrate("Real-world explorer!", "Next lesson unlocked!"),
        ],
      };

    case "count":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro("Count three", `Find three ${discoveryTitle}s in the real world.`),
          {
            kind: "activity",
            emoji: "3️⃣",
            title: "Count with me",
            body: "One… two… three!",
            interaction: {
              type: "real_world",
              prompt: `Count three ${discoveryTitle}s`,
              tips: ["Point to each one", "Say the numbers aloud", "Celebrate three!"],
              completeLabel: "I counted three!",
              openDiscover: true,
            },
          },
          {
            kind: "challenge",
            emoji: "🔢",
            title: "Quick check",
            body: "How many did you find?",
            interaction: {
              type: "pick_one",
              prompt: "How many?",
              choices: [
                { id: "3", label: "Three", emoji: "3️⃣", correct: true },
                { id: "1", label: "One", emoji: "1️⃣", correct: false },
                { id: "0", label: "Zero", emoji: "0️⃣", correct: false },
              ],
            },
          },
          celebrate("Counting champion!", "Connection unlocked!"),
        ],
      };

    case "senses":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro("Sense it", "Gently explore with touch, smell, or sound."),
          {
            kind: "activity",
            emoji: "👂",
            title: "Use your senses",
            body: "Pick one: touch, smell, or listen.",
            interaction: {
              type: "real_world",
              prompt: `Sense a real ${discoveryTitle}`,
              tips: [
                "Touch gently (with a grown-up)",
                "Smell carefully",
                "Listen for nearby sounds",
              ],
              completeLabel: "I sensed it!",
            },
          },
          {
            kind: "challenge",
            emoji: "💛",
            title: "What did you notice?",
            body: "Tell a grown-up one sensory detail.",
            interaction: {
              type: "parent_confirm",
              prompt: "We shared a sensory detail",
              confirmLabel: "Shared!",
            },
          },
          celebrate("Super senses!", "Keep exploring!"),
        ],
      };

    case "connection":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji: connectionEmoji,
        phases: [
          intro(
            `${connectionName} Mission`,
            `A ${discoveryTitle} connects to a ${connectionName}.`,
            connectionEmoji,
          ),
          {
            kind: "activity",
            emoji: connectionEmoji,
            title: "Follow the connection",
            body: `Why might a ${connectionName} care about a ${discoveryTitle}?`,
            interaction: {
              type: "tap_continue",
              label: "I wonder…",
            },
          },
          {
            kind: "challenge",
            emoji: "🌍",
            title: "World expands",
            body: `Your next discovery path may include a ${connectionName}.`,
            interaction: {
              type: "pick_one",
              prompt: `Who visits or helps a ${discoveryTitle}?`,
              choices: [
                {
                  id: "conn",
                  label: connectionName,
                  emoji: connectionEmoji,
                  correct: true,
                },
                { id: "car", label: "A car", emoji: "🚗", correct: false },
                { id: "sofa", label: "A sofa", emoji: "🛋", correct: false },
              ],
            },
          },
          celebrate(
            `Connection unlocked: ${connectionName}!`,
            "More discoveries = more learning.",
          ),
        ],
      };

    case "grow":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro(
            step.title,
            "Growing takes time — come back and notice change.",
          ),
          {
            kind: "activity",
            emoji: "🌱",
            title: "Real-world growing",
            body:
              step.id === "plant_seed"
                ? "Plant a seed with a grown-up, or plan where one could grow."
                : "Visit again tomorrow and notice what changed.",
            interaction: {
              type: "real_world",
              prompt: step.title,
              tips: [
                "Ask a grown-up to help",
                "Take a photo for Adventure Book",
                "Come back later to compare",
              ],
              completeLabel: "Mission started!",
              openDiscover: step.id === "watch_grow" || step.id === "come_back",
            },
          },
          {
            kind: "challenge",
            emoji: "⏳",
            title: "Patience explorer",
            body: "Growing is part of the journey.",
            interaction: {
              type: "parent_confirm",
              prompt: "We planted or planned a return visit",
              confirmLabel: "We did!",
            },
          },
          celebrate("Time explorer!", "Master Explorer awaits!"),
        ],
      };

    case "quiz_picture":
    case "quiz_colors":
    case "quiz_sound":
    case "quiz_true_false":
    case "quiz_memory":
    case "quiz_sort":
    case "quiz_sequence":
    case "quiz_drag": {
      if (step.activityKind === "quiz_colors") {
        return {
          stepId: step.id,
          discoveryTitle,
          emoji,
          phases: [
            intro("Color challenge", `What color is this ${discoveryTitle}?`),
            {
              kind: "activity",
              emoji: "🎨",
              title: "Look closely",
              body: `Tap the color of the ${discoveryTitle}.`,
              interaction: {
                type: "pick_one",
                prompt: `What color is this ${discoveryTitle}?`,
                choices: colorChoices(discoveryTitle),
              },
            },
            {
              kind: "challenge",
              emoji: "⭐",
              title: "Bonus round",
              body: "Pick the bright color again!",
              interaction: {
                type: "pick_one",
                prompt: "Which color feels right?",
                choices: colorChoices(discoveryTitle),
              },
            },
            celebrate("Explorer XP earned!", "Next challenge unlocked!"),
          ],
        };
      }

      if (step.activityKind === "quiz_true_false") {
        const fact = facts[0] ?? `A ${discoveryTitle} is real and wonderful.`;
        return {
          stepId: step.id,
          discoveryTitle,
          emoji,
          phases: [
            intro("Memory challenge", "Check what you remember."),
            {
              kind: "activity",
              emoji: "❓",
              title: "Is this true?",
              body: fact,
              interaction: {
                type: "pick_one",
                prompt: fact,
                choices: [
                  { id: "true", label: "True", emoji: "✅", correct: true },
                  { id: "false", label: "False", emoji: "❌", correct: false },
                ],
              },
            },
            {
              kind: "challenge",
              emoji: "🧠",
              title: "Memory spark",
              body: `A ${discoveryTitle} is made of chocolate.`,
              interaction: {
                type: "pick_one",
                prompt: `A ${discoveryTitle} is made of chocolate.`,
                choices: [
                  { id: "false", label: "False", emoji: "✅", correct: true },
                  { id: "true", label: "True", emoji: "🍫", correct: false },
                ],
              },
            },
            celebrate("Sharp memory!", "Create unlocked!"),
          ],
        };
      }

      const q = quizChoices(quiz, discoveryTitle, emoji);
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro("Mini challenge", "Show what you know — quick and fun."),
          {
            kind: "activity",
            emoji: "🧩",
            title: "Your challenge",
            body: q.prompt,
            interaction: {
              type: "pick_one",
              prompt: q.prompt,
              choices: q.choices,
            },
          },
          {
            kind: "challenge",
            emoji: "⚡",
            title: "One more!",
            body: "Keep your explorer streak going.",
            interaction: {
              type: "pick_one",
              prompt: `Point to the ${discoveryTitle}`,
              choices: matchChoices(emoji, discoveryTitle),
            },
          },
          celebrate("Challenge complete!", "Keep exploring!"),
        ],
      };
    }

    case "draw":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro("Create time", `Draw your favorite ${discoveryTitle}.`),
          {
            kind: "activity",
            emoji: "✏️",
            title: "Make it yours",
            body: "Draw on paper — big shapes, bright colors!",
            interaction: {
              type: "parent_confirm",
              prompt: "We drew it",
              confirmLabel: "Drawing done!",
            },
          },
          {
            kind: "challenge",
            emoji: "🖼",
            title: "Show someone",
            body: "Hold up your drawing and smile.",
            interaction: {
              type: "parent_confirm",
              prompt: "We showed our drawing",
              confirmLabel: "Shown!",
            },
          },
          celebrate("Artist explorer!", "Teach-someone unlocked!"),
        ],
      };

    case "conversation":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro(
            "Teach someone",
            `Tell a grown-up one thing about a ${discoveryTitle}.`,
          ),
          {
            kind: "activity",
            emoji: "💬",
            title: "Share a wonder",
            body:
              facts[0] ??
              `Tell them what you love about a ${discoveryTitle}.`,
            interaction: {
              type: "parent_confirm",
              prompt: `${childName} taught me something`,
              confirmLabel: "Parent confirms",
            },
          },
          {
            kind: "challenge",
            emoji: "🏆",
            title: "Explorer badge moment",
            body: "High five for teaching!",
            interaction: {
              type: "tap_continue",
              label: "High five!",
            },
          },
          celebrate("Explorer badge earned!", "Mastery path unlocked!"),
        ],
      };

    case "challenge":
    case "mastery":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro("Explorer mastery", `You're becoming a ${discoveryTitle} expert.`),
          {
            kind: "activity",
            emoji: "🗺",
            title: "Adventure awaits",
            body: "Start an adventure to deepen your journey.",
            interaction: {
              type: "tap_continue",
              label: "I'm ready!",
            },
          },
          {
            kind: "challenge",
            emoji: "⭐",
            title: "Confidence check",
            body: `Could you teach a friend about a ${discoveryTitle}?`,
            interaction: {
              type: "parent_confirm",
              prompt: "Ready to teach a friend",
              confirmLabel: "Yes!",
            },
          },
          celebrate("Master explorer energy!", "Future lessons await as you grow."),
        ],
      };

    case "future":
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro(step.title, "A deeper journey for growing explorers."),
          {
            kind: "activity",
            emoji: "🔬",
            title: "Think bigger",
            body: step.subtitle,
            interaction: { type: "tap_continue", label: "Explore the idea" },
          },
          {
            kind: "challenge",
            emoji: "🧪",
            title: "Curious mind",
            body: "What's one question you still have?",
            interaction: {
              type: "parent_confirm",
              prompt: "We asked a curious question",
              confirmLabel: "Question asked!",
            },
          },
          celebrate("Deeper curiosity unlocked!", "The journey continues."),
        ],
      };

    default:
      return {
        stepId: step.id,
        discoveryTitle,
        emoji,
        phases: [
          intro(step.title, step.subtitle),
          {
            kind: "activity",
            emoji,
            title: "Let's explore",
            body: `Play with this ${discoveryTitle} idea.`,
            interaction: { type: "tap_continue", label: "Continue" },
          },
          {
            kind: "challenge",
            emoji: "⭐",
            title: "Quick win",
            body: "One more joyful tap.",
            interaction: { type: "tap_continue", label: "Done!" },
          },
          celebrate("Level complete!", "Next lesson unlocked!"),
        ],
      };
  }
}

/** Maps a completed lesson step to progress field updates (for legacy flags). */
export function progressFlagsForCompletedStep(
  stepId: LearningJourneyStepId,
): Partial<{
  heardPronunciation: boolean;
  watchedVideo: boolean;
  completedMatch: boolean;
  learnedParts: boolean;
  learnedWhy: boolean;
  foundThree: boolean;
  completedPictureQuiz: boolean;
  completedColorsQuiz: boolean;
  completedSoundQuiz: boolean;
  completedTrueFalseQuiz: boolean;
  completedQuiz: boolean;
  completedDraw: boolean;
  completedCoachPrompts: boolean;
  taughtSomeone: boolean;
  completedChallenge: boolean;
}> {
  switch (stepId) {
    case "learn_name":
      return {};
    case "hear_pronunciation":
      return { heardPronunciation: true, watchedVideo: true };
    case "match_picture":
      return { completedMatch: true };
    case "learn_parts":
      return { learnedParts: true };
    case "learn_why":
      return { learnedWhy: true };
    case "find_three":
    case "find_another":
    case "count_three":
      return { foundThree: true };
    case "quiz_picture":
      return { completedPictureQuiz: true, completedQuiz: true };
    case "quiz_colors":
      return { completedColorsQuiz: true, completedQuiz: true };
    case "quiz_sound":
      return { completedSoundQuiz: true };
    case "quiz_true_false":
      return { completedTrueFalseQuiz: true };
    case "draw":
      return { completedDraw: true };
    case "conversation":
      return { taughtSomeone: true, completedCoachPrompts: true };
    case "mastery":
      return { completedChallenge: true };
    default:
      return {};
  }
}
