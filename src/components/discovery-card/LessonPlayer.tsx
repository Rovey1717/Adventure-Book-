import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  AnimatedProgressBar,
  PlayfulPressable,
  SoftCard,
} from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import {
  buildInteractiveLesson,
  type InteractiveLessonContext,
  type LessonChoice,
  type LessonInteraction,
  type LessonPhase,
  type LessonTapTarget,
} from "@/domain/discovery-card/interactiveLesson";
import type { LearningJourneyStep } from "@/domain/discovery-card/learningJourneyPath";

type Props = {
  step: LearningJourneyStep;
  context: InteractiveLessonContext;
  onComplete: (stepId: LearningJourneyStep["id"]) => void;
  onBack: () => void;
  onOpenDiscover?: () => void;
};

/**
 * Duolingo-style lesson player.
 * Tap a journey step → immediately begin intro → activity → challenge → celebrate.
 * Completes automatically — never "Mark Complete."
 */
export function LessonPlayer({
  step,
  context,
  onComplete,
  onBack,
  onOpenDiscover,
}: Props) {
  const lesson = useMemo(
    () => buildInteractiveLesson(step, context),
    [step, context],
  );
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = lesson.phases[phaseIndex] ?? lesson.phases[0];
  const progress =
    lesson.phases.length <= 1
      ? 100
      : (phaseIndex / (lesson.phases.length - 1)) * 100;

  const advance = () => {
    if (phaseIndex >= lesson.phases.length - 1) {
      onComplete(step.id);
      return;
    }
    setPhaseIndex((value) => value + 1);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <PlayfulPressable
          onPress={onBack}
          accessibilityLabel="Back to journey"
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </PlayfulPressable>
        <View style={styles.topCopy}>
          <Text style={styles.kicker}>Lesson</Text>
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {step.title}
          </Text>
        </View>
        <Text style={styles.emoji}>{lesson.emoji}</Text>
      </View>

      <AnimatedProgressBar progress={progress} />

      <Animated.View
        key={`${step.id}-${phaseIndex}`}
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(120)}
        style={styles.phaseWrap}
      >
        <SoftCard tint={tintForPhase(phase)} shimmer={phase.kind === "celebrate"}>
          <View style={styles.phaseCard}>
            <Text style={styles.phaseEmoji}>{phase.emoji}</Text>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            {phase.body ? (
              <Text style={styles.phaseBody}>{phase.body}</Text>
            ) : null}
            <PhaseInteraction
              interaction={phase.interaction}
              onAdvance={advance}
              onOpenDiscover={onOpenDiscover}
            />
          </View>
        </SoftCard>
      </Animated.View>
    </View>
  );
}

function tintForPhase(
  phase: LessonPhase,
): "lavender" | "yellow" | "aqua" | "coral" | "blue" {
  switch (phase.kind) {
    case "intro":
      return "lavender";
    case "activity":
      return "blue";
    case "challenge":
      return "coral";
    case "celebrate":
      return "yellow";
  }
}

function PhaseInteraction({
  interaction,
  onAdvance,
  onOpenDiscover,
}: {
  interaction: LessonInteraction;
  onAdvance: () => void;
  onOpenDiscover?: () => void;
}) {
  switch (interaction.type) {
    case "tap_continue":
      return (
        <PlayfulPressable
          style={styles.primaryCta}
          onPress={onAdvance}
          accessibilityRole="button"
          accessibilityLabel={interaction.label}
        >
          <Text style={styles.primaryCtaText}>{interaction.label}</Text>
        </PlayfulPressable>
      );

    case "tap_hear":
      return (
        <View style={styles.stack}>
          <Text style={styles.pronunciation}>{interaction.pronunciation}</Text>
          <PlayfulPressable
            style={styles.hearBtn}
            onPress={onAdvance}
            accessibilityRole="button"
            accessibilityLabel={interaction.label}
          >
            <Text style={styles.hearEmoji}>🔊</Text>
            <Text style={styles.hearLabel}>
              {interaction.label}: {interaction.word}
            </Text>
          </PlayfulPressable>
        </View>
      );

    case "tap_targets":
      return (
        <TapTargets
          prompt={interaction.prompt}
          targets={interaction.targets}
          onDone={onAdvance}
        />
      );

    case "pick_one":
      return (
        <PickOne
          prompt={interaction.prompt}
          choices={interaction.choices}
          onCorrect={onAdvance}
        />
      );

    case "parent_confirm":
      return (
        <View style={styles.stack}>
          <Text style={styles.prompt}>{interaction.prompt}</Text>
          <PlayfulPressable
            style={styles.primaryCta}
            onPress={onAdvance}
            accessibilityRole="button"
            accessibilityLabel={interaction.confirmLabel}
          >
            <Text style={styles.primaryCtaText}>{interaction.confirmLabel}</Text>
          </PlayfulPressable>
        </View>
      );

    case "real_world":
      return (
        <View style={styles.stack}>
          <Text style={styles.prompt}>{interaction.prompt}</Text>
          {interaction.tips.map((tip) => (
            <Text key={tip} style={styles.tip}>
              · {tip}
            </Text>
          ))}
          {interaction.openDiscover && onOpenDiscover ? (
            <PlayfulPressable
              style={styles.secondaryCta}
              onPress={onOpenDiscover}
              accessibilityRole="button"
              accessibilityLabel="Open Discover"
            >
              <Text style={styles.secondaryCtaText}>📷 Open Discover</Text>
            </PlayfulPressable>
          ) : null}
          <PlayfulPressable
            style={styles.primaryCta}
            onPress={onAdvance}
            accessibilityRole="button"
            accessibilityLabel={interaction.completeLabel}
          >
            <Text style={styles.primaryCtaText}>{interaction.completeLabel}</Text>
          </PlayfulPressable>
        </View>
      );

    case "celebrate":
      return (
        <View style={styles.stack}>
          <Text style={styles.praise}>{interaction.praise}</Text>
          <Text style={styles.unlock}>{interaction.unlockHint}</Text>
          <PlayfulPressable
            style={styles.primaryCta}
            onPress={onAdvance}
            accessibilityRole="button"
            accessibilityLabel="Back to Learning Journey"
          >
            <Text style={styles.primaryCtaText}>✨ Continue journey</Text>
          </PlayfulPressable>
        </View>
      );
  }
}

function TapTargets({
  prompt,
  targets,
  onDone,
}: {
  prompt: string;
  targets: LessonTapTarget[];
  onDone: () => void;
}) {
  const [found, setFound] = useState<string[]>([]);

  const toggle = (id: string) => {
    setFound((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      if (next.length >= targets.length) {
        setTimeout(onDone, 280);
      }
      return next;
    });
  };

  return (
    <View style={styles.stack}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.targetRow}>
        {targets.map((target) => {
          const done = found.includes(target.id);
          return (
            <PlayfulPressable
              key={target.id}
              style={[styles.target, done && styles.targetDone]}
              onPress={() => toggle(target.id)}
              accessibilityRole="button"
              accessibilityLabel={target.label}
              accessibilityState={{ selected: done }}
            >
              <Text style={styles.targetEmoji}>{target.emoji}</Text>
              <Text style={styles.targetLabel}>{target.label}</Text>
              {done ? <Text style={styles.check}>✓</Text> : null}
            </PlayfulPressable>
          );
        })}
      </View>
      <Text style={styles.meta}>
        {found.length} of {targets.length} found
      </Text>
    </View>
  );
}

function PickOne({
  prompt,
  choices,
  onCorrect,
}: {
  prompt: string;
  choices: LessonChoice[];
  onCorrect: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const onPick = (choice: LessonChoice) => {
    setPicked(choice.id);
    if (choice.correct) {
      setWrong(null);
      setTimeout(onCorrect, 320);
      return;
    }
    setWrong(choice.id);
  };

  return (
    <View style={styles.stack}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.choiceCol}>
        {choices.map((choice) => {
          const selected = picked === choice.id;
          const isWrong = wrong === choice.id;
          const isRight = selected && choice.correct;
          return (
            <PlayfulPressable
              key={choice.id}
              style={[
                styles.choice,
                isRight && styles.choiceRight,
                isWrong && styles.choiceWrong,
              ]}
              onPress={() => onPick(choice)}
              accessibilityRole="button"
              accessibilityLabel={choice.label}
            >
              {choice.emoji ? (
                <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
              ) : null}
              <Text style={styles.choiceLabel}>{choice.label}</Text>
            </PlayfulPressable>
          );
        })}
      </View>
      {wrong ? (
        <Text style={styles.tryAgain}>Try again — you can do it!</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  backText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.navy,
  },
  topCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.lavenderDeep,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  lessonTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.navy,
  },
  emoji: {
    fontSize: 28,
  },
  phaseWrap: {
    minHeight: 320,
  },
  phaseCard: {
    padding: 22,
    gap: 12,
    alignItems: "center",
  },
  phaseEmoji: {
    fontSize: 64,
  },
  phaseTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 28,
    lineHeight: 34,
    color: colors.navy,
    textAlign: "center",
  },
  phaseBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
  },
  stack: {
    width: "100%",
    gap: 10,
    alignItems: "center",
    marginTop: 4,
  },
  primaryCta: {
    marginTop: 8,
    backgroundColor: colors.coral,
    borderRadius: radii.pill,
    paddingVertical: 16,
    paddingHorizontal: 28,
    minWidth: "80%",
    alignItems: "center",
  },
  primaryCtaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.cameraInk,
  },
  secondaryCta: {
    backgroundColor: colors.pastelBlue,
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 22,
    minWidth: "80%",
    alignItems: "center",
  },
  secondaryCtaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  hearBtn: {
    backgroundColor: colors.pastelPurple,
    borderRadius: radii.xl,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  hearEmoji: {
    fontSize: 36,
  },
  hearLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.navy,
    textAlign: "center",
  },
  pronunciation: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.lavenderDeep,
  },
  prompt: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    textAlign: "center",
  },
  tip: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    alignSelf: "flex-start",
  },
  targetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  target: {
    width: "30%",
    minWidth: 96,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.stroke,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 6,
  },
  targetDone: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
  },
  targetEmoji: {
    fontSize: 28,
  },
  targetLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.navy,
    textAlign: "center",
    textTransform: "capitalize",
  },
  check: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.grassDeep,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  choiceCol: {
    width: "100%",
    gap: 10,
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.stroke,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  choiceRight: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
  },
  choiceWrong: {
    borderColor: colors.coral,
    backgroundColor: colors.peach,
  },
  choiceEmoji: {
    fontSize: 24,
  },
  choiceLabel: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.navy,
  },
  tryAgain: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.coralDeep,
  },
  praise: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
    textAlign: "center",
  },
  unlock: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.lavenderDeep,
    textAlign: "center",
  },
});
