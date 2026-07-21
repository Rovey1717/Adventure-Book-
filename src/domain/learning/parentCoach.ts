/**
 * Parent Guided coaching — teach the parent how to teach the child.
 * Family AI never quizzes the child directly in this mode.
 * The app facilitates connection; it does not replace it.
 */

export type ParentCoachPack = {
  /** Short coaching frame for the parent */
  coachingFrame: string;
  /** Conversation starters addressed to the parent */
  starters: string[];
};

/**
 * Build parent-facing conversation starters for a discovery.
 * Example (Fire Truck):
 *  - "Ask your child if they can find the ladder."
 *  - "Can they hear the siren?"
 *  - "What other red things can you see?"
 */
export function parentCoachStartersFor(objectName: string): ParentCoachPack {
  const name = objectName.trim() || "this discovery";
  const lower = name.toLowerCase();

  const coachingFrame =
    "You are the teacher. Family AI coaches you — ask these out loud and follow your child’s curiosity.";

  if (isFireTruck(lower)) {
    return {
      coachingFrame,
      starters: [
        "Ask your child if they can find the ladder.",
        "Can they hear the siren?",
        "What other red things can you see?",
        "Ask them who rides in the fire truck.",
        "Can you point to the wheels together?",
      ],
    };
  }

  if (isVehicle(lower)) {
    return {
      coachingFrame,
      starters: [
        `Ask your child if they can find something special on the ${name}.`,
        `Can they make the sound the ${name} makes?`,
        `What color do they notice on the ${name}?`,
        `Ask them who might drive or use the ${name}.`,
        "What other things that go can you spot nearby?",
      ],
    };
  }

  if (isAnimal(lower)) {
    return {
      coachingFrame,
      starters: [
        `Ask your child what sound a ${name} makes.`,
        `Can they show you how a ${name} moves?`,
        `What do they think a ${name} likes to eat?`,
        `Ask them gently: “Where might a ${name} live?”`,
        "Can you find something soft or fuzzy together?",
      ],
    };
  }

  if (isNature(lower)) {
    return {
      coachingFrame,
      starters: [
        `Ask your child what they notice first about the ${name}.`,
        `Can they touch it carefully with you (if it’s safe)?`,
        `What colors can you find together on the ${name}?`,
        `Ask them: “Does it smell like anything?”`,
        "What else outside looks a little like this?",
      ],
    };
  }

  if (isHelper(lower)) {
    return {
      coachingFrame,
      starters: [
        `Ask your child who this ${name} helps.`,
        `Can they show you what tool or gear they notice?`,
        `Ask: “How could we be helpers too?”`,
        `What sound might you hear near a ${name}?`,
        "Who else in our neighborhood helps people?",
      ],
    };
  }

  // Generic parent-coach pack — still addressed to the parent
  return {
    coachingFrame,
    starters: [
      `Ask your child if they can find something interesting on the ${name}.`,
      `Can they tell you what they notice first?`,
      `What other things nearby look a little like the ${name}?`,
      `Ask them gently: “What do you wonder about the ${name}?”`,
      `Can you explore one detail of the ${name} together?`,
    ],
  };
}

/** @deprecated Prefer parentCoachStartersFor — kept as a thin alias for call sites. */
export function conversationPromptsFor(objectName: string): string[] {
  return parentCoachStartersFor(objectName).starters;
}

function isFireTruck(lower: string): boolean {
  return lower.includes("fire truck") || lower.includes("firetruck") || lower.includes("fire engine");
}

function isVehicle(lower: string): boolean {
  return (
    lower.includes("truck") ||
    lower.includes("car") ||
    lower.includes("bus") ||
    lower.includes("train") ||
    lower.includes("ambulance") ||
    lower.includes("boat") ||
    lower.includes("bike")
  );
}

function isAnimal(lower: string): boolean {
  return (
    lower.includes("dog") ||
    lower.includes("cat") ||
    lower.includes("bird") ||
    lower.includes("duck") ||
    lower.includes("cow") ||
    lower.includes("bee") ||
    lower.includes("butterfly") ||
    lower.includes("turtle") ||
    lower.includes("bear")
  );
}

function isNature(lower: string): boolean {
  return (
    lower.includes("tree") ||
    lower.includes("flower") ||
    lower.includes("rock") ||
    lower.includes("rainbow") ||
    lower.includes("leaf") ||
    lower.includes("ocean")
  );
}

function isHelper(lower: string): boolean {
  return (
    lower.includes("firefighter") ||
    lower.includes("police") ||
    lower.includes("doctor") ||
    lower.includes("nurse") ||
    lower.includes("mail")
  );
}
