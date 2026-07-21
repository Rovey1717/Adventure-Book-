import {
  DEFAULT_QUICK_ACTIONS,
  type QuickAction,
  type QuickActionId,
} from "@/components/discovery-card/QuickActionGrid";
import type { LearningModeFeatures } from "@/domain/learning/mode";

const TALK_ACTION: QuickAction = {
  id: "quiz",
  label: "Coach",
  icon: "💬",
  tint: "#3D7BD1",
  soft: "#D6EEFF",
};

const PROJECT_ACTION: QuickAction = {
  id: "activities",
  label: "Project",
  icon: "🛠️",
  tint: "#C9A227",
  soft: "#FFF3C4",
};

/**
 * Quick actions adapt to learning mode (quiz → talk for Parent Guided).
 */
export function quickActionsForMode(
  features: LearningModeFeatures,
): QuickAction[] {
  return DEFAULT_QUICK_ACTIONS.map((action) => {
    if (action.id === "quiz" && !features.quizzes) {
      return features.conversationPrompts ? TALK_ACTION : action;
    }
    if (action.id === "activities" && features.projects) {
      return PROJECT_ACTION;
    }
    return action;
  }).filter((action) => {
    if (action.id === "quiz") {
      return features.quizzes || features.conversationPrompts;
    }
    return true;
  }) as Array<QuickAction & { id: QuickActionId }>;
}
