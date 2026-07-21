import {
  LEARNING_LEVELS,
  learningLevelForAge,
  type LearningLevel,
} from "@/intelligence/types/progression";

export type LearningStage = {
  age: number;
  level: LearningLevel;
  mode: string;
  title: string;
  description: string;
  accent: string;
  soft: string;
  glyph: string;
};

const STAGE_STYLE: Record<
  LearningLevel,
  { accent: string; soft: string; glyph: string }
> = {
  1: { accent: "#E45A5A", soft: "#FDE4E4", glyph: "●" },
  2: { accent: "#F08A24", soft: "#FFE8D1", glyph: "?" },
  3: { accent: "#3D6FBF", soft: "#D9E6FA", glyph: "✦" },
  4: { accent: "#6B4FA0", soft: "#EDE4F8", glyph: "◎" },
  5: { accent: "#2F6B4F", soft: "#D8F0E4", glyph: "◈" },
};

/**
 * Age progression copy — discovery-tied; never random subject matter.
 * Levels align with Learning Progression Engine (1–5).
 */
export function learningStagesForObject(objectName: string): LearningStage[] {
  const lower = objectName.toLowerCase();
  return LEARNING_LEVELS.map((def) => {
    const style = STAGE_STYLE[def.level];
    return {
      age: def.ageMin,
      level: def.level,
      mode: def.label,
      title: stageTitle(objectName, lower, def.level),
      description: `${def.focus.slice(0, 3).join(", ")} — connected to this ${lower}.`,
      accent: style.accent,
      soft: style.soft,
      glyph: style.glyph,
    };
  });
}

function stageTitle(
  objectName: string,
  lower: string,
  level: LearningLevel,
): string {
  switch (level) {
    case 1:
      return `Colors, sounds, "${objectName}!"`;
    case 2:
      return `Who helps with a ${lower}?`;
    case 3:
      return `How does a ${lower} work?`;
    case 4:
      return `Investigate the ${lower}`;
    case 5:
      return `${objectName} in your community`;
  }
}

export function learningStageForAge(
  objectName: string,
  age: number,
): LearningStage {
  const level = learningLevelForAge(age);
  return learningStagesForObject(objectName).find((s) => s.level === level)!;
}
