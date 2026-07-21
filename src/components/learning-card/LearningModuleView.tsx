import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import type { LearningModule } from "@/domain/learning/card";
import {
  AnimatedProgressBar,
  PlayfulPressable,
  SoftCard,
} from "@/components/ui";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  module: LearningModule;
  index?: number;
};

/**
 * Renders one Learning Card module. Add new `type` cases without redesigning the card shell.
 */
export function LearningModuleView({ module, index = 0 }: Props) {
  switch (module.type) {
    case "hero":
      return <HeroModule module={module} />;
    case "hear_word":
      return <HearWordModule module={module} index={index} />;
    case "fun_fact":
      return <FunFactModule module={module} index={index} />;
    case "quiz":
      return <QuizModule module={module} index={index} />;
    case "wonder":
      return <WonderModule module={module} index={index} />;
    case "challenge":
      return <ChallengeModule module={module} index={index} />;
    case "progress":
      return <ProgressModule module={module} index={index} />;
    case "related":
      return <RelatedModule module={module} index={index} />;
    case "save_status":
      return <SaveStatusModule module={module} />;
    case "future":
      return <FutureModule module={module} />;
    default:
      return null;
  }
}

const TINTS: NonNullable<ComponentProps<typeof SoftCard>["tint"]>[] = [
  "blue",
  "yellow",
  "green",
  "coral",
  "lavender",
  "aqua",
];

function CardShell({
  children,
  eyebrow,
  index = 0,
}: {
  children: ReactNode;
  eyebrow?: string;
  index?: number;
}) {
  return (
    <SoftCard tint={TINTS[index % TINTS.length]} enterDelay={index * 60}>
      <View style={styles.card}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {children}
      </View>
    </SoftCard>
  );
}

function HeroModule({ module }: { module: Extract<LearningModule, { type: "hero" }> }) {
  const showPhoto =
    !!module.photoUri && !module.photoUri.startsWith("mock-");
  return (
    <Animated.View entering={FadeInDown.duration(380).springify()} style={styles.hero}>
      {showPhoto ? (
        <Image source={{ uri: module.photoUri! }} style={styles.heroPhoto} />
      ) : (
        <View style={styles.heroFallback}>
          <Text style={styles.heroEmoji}>{module.emoji}</Text>
        </View>
      )}
      <Text style={styles.heroName}>
        {module.emoji} {module.name}
      </Text>
      <View style={styles.heroCategoryPill}>
        <Text style={styles.heroCategory}>{module.categoryLabel}</Text>
      </View>
    </Animated.View>
  );
}

function HearWordModule({
  module,
  index,
}: {
  module: Extract<LearningModule, { type: "hear_word" }>;
  index: number;
}) {
  return (
    <CardShell eyebrow="🔊 Hear the word" index={index}>
      <Text style={styles.word}>{module.word}</Text>
      <Text style={styles.pronunciation}>{module.pronunciation}</Text>
      <Text style={styles.hint}>Say it together out loud</Text>
    </CardShell>
  );
}

function FunFactModule({
  module,
  index,
}: {
  module: Extract<LearningModule, { type: "fun_fact" }>;
  index: number;
}) {
  return (
    <CardShell eyebrow="💡 Fun fact" index={index}>
      <Text style={styles.body}>{module.fact}</Text>
    </CardShell>
  );
}

function QuizModule({
  module,
  index,
}: {
  module: Extract<LearningModule, { type: "quiz" }>;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = answered && selected === module.answerIndex;

  return (
    <CardShell eyebrow="❓ Mini quiz" index={index}>
      <Text style={styles.question}>{module.question}</Text>
      {module.choices.map((choice, choiceIdx) => {
        const isSelected = selected === choiceIdx;
        const isAnswer = choiceIdx === module.answerIndex;
        return (
          <QuizChoiceButton
            key={choice}
            choice={choice}
            disabled={answered}
            isSelected={isSelected}
            isAnswer={isAnswer}
            answered={answered}
            onPress={() => setSelected(choiceIdx)}
          />
        );
      })}
      {answered ? (
        <Text style={styles.feedback}>
          {correct ? "🎉 Nice!" : "Almost — try noticing again next time."}
        </Text>
      ) : null}
    </CardShell>
  );
}

function QuizChoiceButton({
  choice,
  disabled,
  isSelected,
  isAnswer,
  answered,
  onPress,
}: {
  choice: string;
  disabled: boolean;
  isSelected: boolean;
  isAnswer: boolean;
  answered: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const showCorrect = answered && isAnswer;

  useEffect(() => {
    if (showCorrect) {
      scale.value = withSequence(
        withSpring(1.05, { damping: 8, stiffness: 260 }),
        withSpring(1, { damping: 10, stiffness: 220 }),
      );
    }
  }, [scale, showCorrect]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <PlayfulPressable
        style={[
          styles.choice,
          isSelected && styles.choiceSelected,
          showCorrect && styles.choiceCorrect,
          answered && isSelected && !isAnswer && styles.choiceWrong,
        ]}
        disabled={disabled}
        bounce={!disabled}
        onPress={onPress}
      >
        <Text style={styles.choiceText}>
          {showCorrect ? "✓ " : ""}
          {choice}
        </Text>
      </PlayfulPressable>
    </Animated.View>
  );
}

function WonderModule({
  module,
  index,
}: {
  module: Extract<LearningModule, { type: "wonder" }>;
  index: number;
}) {
  return (
    <CardShell eyebrow="🌟 Wonder question" index={index}>
      <Text style={styles.body}>{module.prompt}</Text>
    </CardShell>
  );
}

function ChallengeModule({
  module,
  index,
}: {
  module: Extract<LearningModule, { type: "challenge" }>;
  index: number;
}) {
  return (
    <CardShell eyebrow="🎯 Challenge" index={index}>
      <Text style={styles.body}>{module.text}</Text>
    </CardShell>
  );
}

function ProgressModule({
  module,
  index,
}: {
  module: Extract<LearningModule, { type: "progress" }>;
  index: number;
}) {
  const ratio = module.total > 0 ? (module.completed / module.total) * 100 : 0;
  return (
    <CardShell eyebrow="📈 Learning progress" index={index}>
      <Text style={styles.progressTitle}>{module.label}</Text>
      <AnimatedProgressBar progress={ratio} color={colors.coral} height={16} />
      <Text style={styles.hint}>
        {module.completed} of {module.total} found
      </Text>
    </CardShell>
  );
}

function RelatedModule({
  module,
  index,
}: {
  module: Extract<LearningModule, { type: "related" }>;
  index: number;
}) {
  return (
    <CardShell eyebrow={module.title} index={index}>
      {module.items.map((item) => (
        <Text key={item.id} style={styles.relatedLine}>
          {item.emoji} {item.name}
        </Text>
      ))}
    </CardShell>
  );
}

function SaveStatusModule({
  module,
}: {
  module: Extract<LearningModule, { type: "save_status" }>;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(320)} style={styles.saveBadge}>
      <Text style={styles.saveText}>✓ {module.message}</Text>
    </Animated.View>
  );
}

function FutureModule({
  module,
}: {
  module: Extract<LearningModule, { type: "future" }>;
}) {
  return (
    <View style={styles.futureCard}>
      <Text style={styles.eyebrow}>{module.title}</Text>
      <Text style={styles.hint}>{module.teaser}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.grass,
  },
  hero: {
    gap: 10,
    marginBottom: 4,
    alignItems: "center",
  },
  heroPhoto: {
    width: "100%",
    height: 230,
    borderRadius: radii.xxl,
    backgroundColor: colors.pastelBlue,
  },
  heroFallback: {
    width: "100%",
    height: 190,
    borderRadius: radii.xxl,
    backgroundColor: colors.pastelYellow,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: {
    fontSize: 72,
  },
  heroName: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.navy,
    textAlign: "center",
  },
  heroCategoryPill: {
    backgroundColor: colors.pastelGreen,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroCategory: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.grassDeep,
  },
  word: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.navy,
  },
  pronunciation: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.lavenderInk,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.navy,
  },
  question: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.navy,
    marginBottom: 4,
  },
  choice: {
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceRaised,
    minHeight: 48,
    justifyContent: "center",
  },
  choiceSelected: {
    borderColor: colors.coral,
  },
  choiceCorrect: {
    borderColor: colors.grassDeep,
    backgroundColor: colors.pastelGreen,
  },
  choiceWrong: {
    opacity: 0.65,
  },
  choiceText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.navy,
  },
  feedback: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.grass,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
  },
  progressTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.navy,
  },
  relatedLine: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.navy,
    lineHeight: 26,
  },
  saveBadge: {
    backgroundColor: colors.pastelGreen,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.soft,
  },
  saveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.grassDeep,
    textAlign: "center",
  },
  futureCard: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.stroke,
    borderStyle: "dashed",
    padding: 18,
    gap: 6,
    opacity: 0.75,
  },
});
