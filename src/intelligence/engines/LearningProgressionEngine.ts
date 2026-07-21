import type { AdventureKind } from "@/domain/adventure/types";
import type { GraphRepository } from "@/intelligence/core/GraphRepository";
import type { LearningEngine } from "@/intelligence/engines/LearningEngine";
import type { ChildEngine } from "@/intelligence/engines/ChildEngine";
import type { WorldEngine } from "@/intelligence/engines/WorldEngine";
import type { ChildNode } from "@/intelligence/types/child";
import type {
  AgeLearningVariant,
  LearningNode,
  QuizQuestion,
} from "@/intelligence/types/learning";
import type {
  LearningActivityKind,
  LearningLevel,
  ProgressionContext,
  ProgressionResult,
  SelectedLearningActivity,
} from "@/intelligence/types/progression";
import {
  definitionForLevel,
  isSpanishEnabled,
  learningLevelForAge,
} from "@/intelligence/types/progression";

type Candidate = SelectedLearningActivity;

const SPANISH_WORDS: Record<string, { spanish: string; pronunciation: string }> =
  {
    "fire truck": {
      spanish: "camión de bomberos",
      pronunciation: "kah-MYOHN deh boh-MEH-rohs",
    },
    firefighter: {
      spanish: "bombero",
      pronunciation: "boh-MEH-roh",
    },
    ambulance: {
      spanish: "ambulancia",
      pronunciation: "ahm-boo-LAHN-syah",
    },
    "police car": {
      spanish: "coche de policía",
      pronunciation: "KOH-cheh deh poh-lee-SEE-ah",
    },
  };

/**
 * Learning Progression Engine
 *
 * Answers: "What is the NEXT BEST thing for THIS child to learn?"
 *
 * Never picks random educational content. Every activity is tied to
 * age level, current discovery/adventure, parent goals, and mastery.
 */
export class LearningProgressionEngine {
  constructor(
    private readonly _graphs: GraphRepository,
    private readonly learning: LearningEngine,
    private readonly child: ChildEngine,
    private readonly world: WorldEngine,
  ) {}

  /**
   * Select the most appropriate next learning activity.
   */
  async selectNext(context: ProgressionContext): Promise<ProgressionResult> {
    const levelNum =
      (context.currentLevel as LearningLevel | undefined) ??
      learningLevelForAge(context.childAge);
    const level = definitionForLevel(levelNum);
    const spanishOk = isSpanishEnabled(context);

    const { worldNodeId, discoveryLabel, learningNode, variant } =
      await this.resolveDiscovery(context);

    const candidates = this.buildCandidates({
      context,
      level: levelNum,
      levelFocus: level.focus,
      spanishOk,
      worldNodeId,
      discoveryLabel,
      learningNode,
      variant,
    });

    const scored = candidates
      .map((c) => ({
        ...c,
        score: this.scoreCandidate(c, context, spanishOk),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    const activity =
      scored[0] ??
      this.fallbackActivity({
        context,
        level: levelNum,
        levelFocus: level.focus,
        worldNodeId,
        discoveryLabel,
      });

    return {
      activity,
      level,
      learningNode,
      variant,
      alternatives: scored.slice(1, 4),
      adventureKinds: this.adventureKindsFor({
        level: levelNum,
        spanishOk,
        trigger: context.trigger,
      }),
    };
  }

  /**
   * Build progression context from a Child Graph node.
   */
  contextFromChild(
    child: ChildNode,
    extras: Partial<ProgressionContext> = {},
  ): ProgressionContext {
    return {
      childAge: child.currentAge,
      currentLevel: (child.currentLevel as LearningLevel) || undefined,
      learningLanguages: child.learningLanguages,
      languages: [
        ...child.languages,
        ...(child.spanishEnabled ? ["es"] : []),
      ],
      parentGoals: [
        ...child.parentGoals.map((g) => g.title),
        ...child.goals.map((g) => g.title),
      ],
      masteredConcepts: child.masteredLearningObjectives.map(String),
      completedActivityIds: child.completedQuizzes,
      ...extras,
    };
  }

  async selectForChild(
    childId: string,
    extras: Partial<ProgressionContext> = {},
  ): Promise<ProgressionResult | null> {
    const child = await this.child.getById(childId);
    if (!child) return null;
    return this.selectNext(this.contextFromChild(child, extras));
  }

  /**
   * Adventure kinds that may unlock for this child/context.
   * Spanish is excluded unless explicitly enabled.
   */
  adventureKindsFor(input: {
    level: LearningLevel;
    spanishOk: boolean;
    trigger?: ProgressionContext["trigger"];
  }): AdventureKind[] {
    const byLevel: Record<LearningLevel, AdventureKind[]> = {
      1: ["sound", "count", "quiz", "seek"],
      2: ["sound", "count", "quiz", "draw", "seek", "habitat"],
      3: ["quiz", "habitat", "draw", "seek", "video", "count"],
      4: ["quiz", "habitat", "video", "draw", "seek"],
      5: ["quiz", "habitat", "video", "seek", "draw"],
    };

    const kinds: AdventureKind[] = [...byLevel[input.level]];
    if (input.spanishOk) {
      // Integrate Spanish naturally — never as the only / first interrupt.
      kinds.push("language");
    }

    // On adventure unlock, prefer discovery-tied play over language drills.
    if (input.trigger === "adventure_unlock") {
      const withoutLanguage = kinds.filter((k) => k !== "language");
      return input.spanishOk
        ? [...withoutLanguage, "language"]
        : withoutLanguage;
    }

    return kinds;
  }

  private async resolveDiscovery(context: ProgressionContext): Promise<{
    worldNodeId: string | null;
    discoveryLabel: string | null;
    learningNode: LearningNode | null;
    variant: AgeLearningVariant | null;
  }> {
    let worldNodeId = context.worldNodeId ? String(context.worldNodeId) : null;
    let discoveryLabel = context.discoveryLabel ?? null;

    if (!worldNodeId && discoveryLabel) {
      const world = await this.world.resolveByDiscoveryName(discoveryLabel);
      worldNodeId = world?.id ?? null;
      discoveryLabel = world?.name ?? discoveryLabel;
    } else if (worldNodeId && !discoveryLabel) {
      const world = await this.world.getById(worldNodeId);
      discoveryLabel = world?.name ?? null;
    }

    if (!worldNodeId) {
      return {
        worldNodeId: null,
        discoveryLabel,
        learningNode: null,
        variant: null,
      };
    }

    const resolved = await this.learning.resolveForAge(
      worldNodeId,
      context.childAge,
    );

    return {
      worldNodeId,
      discoveryLabel,
      learningNode: resolved?.node ?? null,
      variant: resolved?.variant ?? null,
    };
  }

  private buildCandidates(input: {
    context: ProgressionContext;
    level: LearningLevel;
    levelFocus: string[];
    spanishOk: boolean;
    worldNodeId: string | null;
    discoveryLabel: string | null;
    learningNode: LearningNode | null;
    variant: AgeLearningVariant | null;
  }): Candidate[] {
    const {
      context,
      level,
      levelFocus,
      spanishOk,
      worldNodeId,
      discoveryLabel,
      learningNode,
      variant,
    } = input;
    const name = discoveryLabel ?? "this discovery";
    const candidates: Candidate[] = [];

    const quiz = this.pickQuiz(variant, learningNode, context);
    if (quiz) {
      candidates.push(
        this.activity({
          kind: "quiz",
          adventureKind: "quiz",
          title: `${name} quiz`,
          prompt: quiz.question,
          rationale: `Age-appropriate quiz about ${name}`,
          level,
          levelFocus,
          worldNodeId,
          discoveryLabel,
          learningNodeId: learningNode?.id ?? null,
          estimatedDurationMinutes:
            variant?.estimatedDurationMinutes ??
            learningNode?.estimatedDurationMinutes ??
            5,
          languages: ["en"],
          quiz,
          spanish: null,
          relatedWorldNodeIds: learningNode?.relatedWorldNodeIds?.map(String) ?? [],
          learningObjectives:
            variant?.learningObjectives ??
            learningNode?.learningObjectives ??
            variant?.learningGoals ??
            [],
          reasonCodes: ["discovery_quiz", `level_${level}`],
        }),
      );
    }

    const wonder =
      variant?.wonderQuestions[0] ?? learningNode?.wonderQuestions[0] ?? null;
    if (wonder) {
      candidates.push(
        this.activity({
          kind: "wonder",
          adventureKind: null,
          title: `Wonder about ${name}`,
          prompt: wonder,
          rationale: `Curiosity prompt tied to ${name}`,
          level,
          levelFocus,
          worldNodeId,
          discoveryLabel,
          learningNodeId: learningNode?.id ?? null,
          estimatedDurationMinutes: 3,
          languages: ["en"],
          quiz: null,
          spanish: null,
          relatedWorldNodeIds: [],
          learningObjectives: variant?.learningObjectives ?? [],
          reasonCodes: ["discovery_wonder", `level_${level}`],
        }),
      );
    }

    const challenge =
      variant?.activities[0] ?? learningNode?.activities[0] ?? null;
    if (challenge) {
      candidates.push(
        this.activity({
          kind: "challenge",
          adventureKind: level <= 2 ? "seek" : "draw",
          title: `${name} challenge`,
          prompt: challenge,
          rationale: `Hands-on activity about ${name}`,
          level,
          levelFocus,
          worldNodeId,
          discoveryLabel,
          learningNodeId: learningNode?.id ?? null,
          estimatedDurationMinutes:
            variant?.estimatedDurationMinutes ?? 6,
          languages: ["en"],
          quiz: null,
          spanish: null,
          relatedWorldNodeIds: [],
          learningObjectives: variant?.learningObjectives ?? [],
          reasonCodes: ["discovery_challenge", `level_${level}`],
        }),
      );
    }

    // Level-shaped discovery activities (even without a learning node).
    candidates.push(...this.levelShapedFallbacks(input));

    // Spanish — only when enabled, and always about THIS discovery.
    if (spanishOk && discoveryLabel) {
      const fromVariant = variant?.spanish;
      const fromMap = SPANISH_WORDS[discoveryLabel.toLowerCase()];
      const spanishWord =
        fromVariant?.word ?? fromMap?.spanish ?? discoveryLabel;
      const pronunciation =
        fromVariant?.pronunciation ??
        fromMap?.pronunciation ??
        discoveryLabel;

      candidates.push(
        this.activity({
          kind: "spanish",
          adventureKind: "language",
          title: `${discoveryLabel} in Spanish`,
          prompt: `In Spanish, ${discoveryLabel} is "${spanishWord}". Can you say it?`,
          rationale: `Parent-enabled Spanish integrated into ${discoveryLabel}`,
          level,
          levelFocus,
          worldNodeId,
          discoveryLabel,
          learningNodeId: learningNode?.id ?? null,
          estimatedDurationMinutes: 4,
          languages: ["en", "es"],
          quiz: null,
          spanish: {
            english: discoveryLabel,
            spanish: spanishWord,
            pronunciation,
          },
          relatedWorldNodeIds: [],
          learningObjectives: ["spanish vocabulary for discovery"],
          reasonCodes: ["spanish_enabled", "discovery_spanish"],
        }),
      );
    }

    return candidates;
  }

  private levelShapedFallbacks(input: {
    context: ProgressionContext;
    level: LearningLevel;
    levelFocus: string[];
    worldNodeId: string | null;
    discoveryLabel: string | null;
    learningNode: LearningNode | null;
  }): Candidate[] {
    const name = input.discoveryLabel ?? "this discovery";
    const { level, levelFocus, worldNodeId, discoveryLabel, learningNode } =
      input;
    const base = {
      level,
      levelFocus,
      worldNodeId,
      discoveryLabel,
      learningNodeId: learningNode?.id ?? null,
      relatedWorldNodeIds: [] as string[],
      learningObjectives: [] as string[],
      languages: ["en"],
      quiz: null as QuizQuestion | null,
      spanish: null as SelectedLearningActivity["spanish"],
      estimatedDurationMinutes: 4,
    };

    const byLevel: Record<LearningLevel, Candidate[]> = {
      1: [
        this.activity({
          ...base,
          kind: "match",
          adventureKind: "quiz",
          title: `Point to the ${name}`,
          prompt: `Can you point to the ${name}? What color is it?`,
          rationale: "Level 1 naming & colors",
          reasonCodes: ["level_1_naming"],
        }),
        this.activity({
          ...base,
          kind: "sound",
          adventureKind: "sound",
          title: `Hear the ${name}`,
          prompt: `What sound does a ${name} make?`,
          rationale: "Level 1 sounds",
          reasonCodes: ["level_1_sound"],
        }),
      ],
      2: [
        this.activity({
          ...base,
          kind: "count",
          adventureKind: "count",
          title: `Count ${name} parts`,
          prompt: `How many wheels / legs / parts can you count on the ${name}?`,
          rationale: "Level 2 counting",
          reasonCodes: ["level_2_count"],
        }),
        this.activity({
          ...base,
          kind: "quiz",
          adventureKind: "quiz",
          title: `Who uses a ${name}?`,
          prompt: `Who drives or uses a ${name}?`,
          rationale: "Level 2 community helpers",
          reasonCodes: ["level_2_helpers"],
          quiz: {
            id: `q_level2_${name}`,
            question: `Who helps people with a ${name}?`,
            choices: ["A helper in our community", "A pirate", "A robot"],
            answerIndex: 0,
          },
        }),
      ],
      3: [
        this.activity({
          ...base,
          kind: "wonder",
          adventureKind: "quiz",
          title: `How does a ${name} work?`,
          prompt: `Why do we need a ${name}? How does it help?`,
          rationale: "Level 3 problem solving",
          reasonCodes: ["level_3_why"],
          estimatedDurationMinutes: 6,
        }),
      ],
      4: [
        this.activity({
          ...base,
          kind: "experiment",
          adventureKind: "habitat",
          title: `Investigate ${name}`,
          prompt: `How does a ${name} work? Design a simple experiment or comparison.`,
          rationale: "Level 4 critical thinking",
          reasonCodes: ["level_4_experiment"],
          estimatedDurationMinutes: 10,
        }),
      ],
      5: [
        this.activity({
          ...base,
          kind: "research",
          adventureKind: "seek",
          title: `Research ${name} in your community`,
          prompt: `Research how ${name} connects to real people and jobs near you.`,
          rationale: "Level 5 real-world research",
          reasonCodes: ["level_5_research"],
          estimatedDurationMinutes: 15,
        }),
      ],
    };

    return byLevel[level];
  }

  private pickQuiz(
    variant: AgeLearningVariant | null,
    node: LearningNode | null,
    context: ProgressionContext,
  ): QuizQuestion | null {
    const completed = new Set(context.completedActivityIds ?? []);
    const pool = [
      ...(variant?.quizQuestions ?? []),
      ...(node?.quizQuestions ?? []),
    ];
    return pool.find((q) => !completed.has(q.id)) ?? pool[0] ?? null;
  }

  private scoreCandidate(
    candidate: Candidate,
    context: ProgressionContext,
    spanishOk: boolean,
  ): number {
    let score = 0.4;

    // Must stay tied to current discovery / adventure.
    if (candidate.discoveryLabel || candidate.worldNodeId) score += 0.35;
    else score -= 0.5;

    if (context.trigger === "discovery" || context.trigger === "adventure_unlock") {
      if (candidate.kind === "spanish") {
        // Spanish is enrichment, not the interrupt after unlock.
        score -= context.trigger === "adventure_unlock" ? 0.25 : 0.05;
      } else {
        score += 0.2;
      }
    }

    if (candidate.kind === "spanish" && !spanishOk) return -1;
    if (candidate.kind === "spanish" && spanishOk) score += 0.15;

    if (candidate.quiz && (context.completedActivityIds ?? []).includes(candidate.quiz.id)) {
      score -= 0.4;
    }

    const mastered = new Set(
      (context.masteredConcepts ?? []).map((c) => c.toLowerCase()),
    );
    const objectives = candidate.learningObjectives.map((o) => o.toLowerCase());
    if (objectives.length > 0 && objectives.every((o) => mastered.has(o))) {
      score -= 0.35;
    }

    // Prefer activities whose focus overlaps parent goals.
    const goals = (context.parentGoals ?? []).map((g) => g.toLowerCase());
    if (
      goals.some((g) =>
        candidate.learningObjectives.some((o) => o.toLowerCase().includes(g)),
      )
    ) {
      score += 0.1;
    }

    if (candidate.level === learningLevelForAge(context.childAge)) {
      score += 0.1;
    }

    return score;
  }

  private fallbackActivity(input: {
    context: ProgressionContext;
    level: LearningLevel;
    levelFocus: string[];
    worldNodeId: string | null;
    discoveryLabel: string | null;
  }): SelectedLearningActivity {
    const name = input.discoveryLabel ?? "your discovery";
    return this.activity({
      kind: "wonder",
      adventureKind: "seek",
      title: `Keep exploring ${name}`,
      prompt: `What do you notice about the ${name}?`,
      rationale: "Discovery-tied fallback — never a random quiz",
      level: input.level,
      levelFocus: input.levelFocus,
      worldNodeId: input.worldNodeId,
      discoveryLabel: input.discoveryLabel,
      learningNodeId: null,
      estimatedDurationMinutes: 3,
      languages: ["en"],
      quiz: null,
      spanish: null,
      relatedWorldNodeIds: [],
      learningObjectives: [],
      reasonCodes: ["fallback_discovery"],
      score: 0.1,
    });
  }

  private activity(
    partial: Omit<SelectedLearningActivity, "score"> & { score?: number },
  ): SelectedLearningActivity {
    return {
      score: partial.score ?? 0,
      ...partial,
    };
  }
}
