import { StyleSheet, Text, View } from "react-native";
import { AnimatedProgressBar, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import {
  learningJourneySummary,
  type LearningJourneyStep,
} from "@/domain/discovery-card/learningJourneyPath";

type Props = {
  discoveryTitle: string;
  steps: LearningJourneyStep[];
  onSelectStep?: (step: LearningJourneyStep) => void;
};

/**
 * 📖 Continue Learning — joyful sequential path.
 * Completing a step unlocks the next. Age-gated steps keep the journey endless.
 */
export function DiscoveryCardLearningJourneySection({
  discoveryTitle,
  steps,
  onSelectStep,
}: Props) {
  const summary = learningJourneySummary(steps);
  const compact = steps.length <= 1;

  return (
    <View style={styles.stack}>
      <SoftCard tint="lavender">
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>📖 Learning Path</Text>
          <Text style={styles.title}>
            {compact
              ? `Your next step with ${discoveryTitle}`
              : `Your endless journey with ${discoveryTitle}`}
          </Text>
          {!compact ? (
            <Text style={styles.body}>
              Family AI picks one next lesson. Digital lessons and real-world
              missions feel equally magical — tap Ready to play.
            </Text>
          ) : null}
          {!compact ? (
            <>
              <AnimatedProgressBar progress={summary.progress * 100} />
              <Text style={styles.meta}>
                {summary.completed} of {summary.availableNow} explorer steps
                {summary.current
                  ? ` · Next: ${summary.current.title}`
                  : " · Keep exploring"}
              </Text>
            </>
          ) : null}
        </View>
      </SoftCard>

      <View style={styles.path}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const interactive =
            step.status === "available" ||
            step.status === "completed" ||
            step.status === "mastered";

          return (
            <View key={step.id} style={styles.node}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    step.status === "locked" && styles.dotLocked,
                    step.status === "coming_soon" && styles.dotSoon,
                    step.status === "available" && styles.dotAvailable,
                    (step.status === "completed" ||
                      step.status === "mastered") &&
                      styles.dotDone,
                  ]}
                >
                  <Text style={styles.dotGlyph}>
                    {statusGlyph(step.status)}
                  </Text>
                </View>
                {!isLast ? (
                  <View
                    style={[
                      styles.connector,
                      (step.status === "completed" ||
                        step.status === "mastered") &&
                        styles.connectorDone,
                    ]}
                  />
                ) : null}
              </View>

              <PlayfulPressable
                disabled={!interactive}
                onPress={() => onSelectStep?.(step)}
                style={[
                  styles.step,
                  step.status === "locked" && styles.stepLocked,
                  step.status === "coming_soon" && styles.stepSoon,
                  step.status === "available" && styles.stepAvailable,
                  (step.status === "completed" ||
                    step.status === "mastered") &&
                    styles.stepDone,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !interactive }}
                accessibilityLabel={`${step.title}, ${step.status}`}
              >
                <View style={styles.stepCopy}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  <Text style={styles.stepKind}>
                    {activityLabel(step.activityKind)}
                  </Text>
                </View>
              </PlayfulPressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function statusGlyph(status: LearningJourneyStep["status"]): string {
  switch (status) {
    case "locked":
      return "🔒";
    case "coming_soon":
      return "🌱";
    case "available":
      return "⭐";
    case "completed":
      return "✅";
    case "mastered":
      return "🏆";
  }
}

function activityLabel(kind: LearningJourneyStep["activityKind"]): string {
  switch (kind) {
    case "discover":
      return "🌍 Real world";
    case "name":
    case "sound":
    case "lesson":
      return "📖 Tiny lesson";
    case "match":
    case "quiz_picture":
    case "quiz_colors":
    case "quiz_sound":
    case "quiz_true_false":
    case "quiz_memory":
    case "quiz_sort":
    case "quiz_sequence":
    case "quiz_drag":
      return "⭐ Challenge";
    case "seek":
    case "count":
    case "senses":
    case "grow":
      return "🌍 Mission";
    case "connection":
      return "🔗 Connection";
    case "draw":
      return "✏️ Create";
    case "conversation":
      return "💬 Teach";
    case "challenge":
      return "🗺 Adventure";
    case "mastery":
      return "🏆 Mastery";
    case "future":
      return "🌱 Growing into";
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  intro: {
    padding: 18,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.lavenderDeep,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
  path: {
    gap: 0,
  },
  node: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  rail: {
    width: 36,
    alignItems: "center",
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.stroke,
  },
  dotLocked: {
    opacity: 0.5,
  },
  dotSoon: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
  },
  dotAvailable: {
    borderColor: colors.lavenderDeep,
    backgroundColor: colors.pastelPurple,
  },
  dotDone: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
  },
  dotGlyph: {
    fontSize: 14,
  },
  connector: {
    flex: 1,
    width: 3,
    minHeight: 16,
    marginVertical: 4,
    borderRadius: 2,
    backgroundColor: colors.stroke,
  },
  connectorDone: {
    backgroundColor: colors.grass,
  },
  step: {
    flex: 1,
    padding: 14,
    marginBottom: 10,
    borderRadius: radii.lg,
    borderWidth: 2,
    backgroundColor: colors.surfaceRaised,
  },
  stepLocked: {
    borderColor: colors.stroke,
    opacity: 0.55,
  },
  stepSoon: {
    borderColor: colors.grass,
    borderStyle: "dashed",
    backgroundColor: colors.pastelGreen,
    opacity: 0.85,
  },
  stepAvailable: {
    borderColor: colors.lavenderDeep,
    backgroundColor: colors.pastelPurple,
  },
  stepDone: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
  },
  stepCopy: {
    gap: 4,
  },
  stepTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  stepSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  stepKind: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2,
  },
});
