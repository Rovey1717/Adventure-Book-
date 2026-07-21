import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import type { LibraryQuizQuestion } from "@/domain/library/types";

type Props = {
  objectName: string;
  questions: LibraryQuizQuestion[];
  onComplete?: () => void;
};

/** Generic Library quiz — same for everyone; not personalized Adventures. */
export function QuizSection({ objectName, questions, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  if (questions.length === 0) return null;

  const question = questions[index];
  const answered = selected !== null;
  const correct = answered && selected === question.answerIndex;

  return (
    <SoftCard tint="lavender">
      <View style={styles.card}>
        <Text style={styles.title}>{objectName} Quiz</Text>
        <Text style={styles.hint}>
          A friendly practice quiz for everyone — not a personalized Adventure.
        </Text>

        {!started ? (
          <PlayfulPressable style={styles.cta} onPress={() => setStarted(true)}>
            <Text style={styles.ctaText}>Take Quiz 🎯</Text>
          </PlayfulPressable>
        ) : (
          <View style={styles.block}>
            <Text style={styles.question}>{question.question}</Text>
            {question.choices.map((choice, choiceIndex) => {
              const isSelected = selected === choiceIndex;
              const isAnswer = choiceIndex === question.answerIndex;
              return (
                <QuizChoice
                  key={choice}
                  choice={choice}
                  disabled={answered}
                  onPress={() => setSelected(choiceIndex)}
                  isSelected={isSelected}
                  isAnswer={isAnswer}
                  answered={answered}
                />
              );
            })}
            {answered ? (
              <Text style={styles.feedback}>
                {correct ? "🎉 Nice!" : "Good try — keep exploring!"}
              </Text>
            ) : null}
            {answered ? (
              <PlayfulPressable
                style={styles.cta}
                onPress={() => {
                  if (index < questions.length - 1) {
                    setIndex((current) => current + 1);
                    setSelected(null);
                  } else {
                    onComplete?.();
                    setStarted(false);
                    setIndex(0);
                    setSelected(null);
                  }
                }}
              >
                <Text style={styles.ctaText}>
                  {index < questions.length - 1 ? "Next question" : "Finish quiz"}
                </Text>
              </PlayfulPressable>
            ) : null}
          </View>
        )}
      </View>
    </SoftCard>
  );
}

function QuizChoice({
  choice,
  disabled,
  onPress,
  isSelected,
  isAnswer,
  answered,
}: {
  choice: string;
  disabled: boolean;
  onPress: () => void;
  isSelected: boolean;
  isAnswer: boolean;
  answered: boolean;
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
        disabled={disabled}
        bounce={!disabled}
        onPress={onPress}
        style={[
          styles.choice,
          isSelected && styles.choiceSelected,
          showCorrect && styles.choiceCorrect,
          answered && isSelected && !isAnswer && styles.choiceWrong,
        ]}
      >
        <Text style={styles.choiceText}>
          {showCorrect ? "✓ " : ""}
          {choice}
        </Text>
      </PlayfulPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.navySoft,
  },
  block: {
    gap: 10,
    marginTop: 4,
  },
  question: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  choice: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 48,
    justifyContent: "center",
  },
  choiceSelected: {
    borderColor: colors.lavenderDeep,
  },
  choiceCorrect: {
    borderColor: colors.grassDeep,
    backgroundColor: colors.pastelGreen,
  },
  choiceWrong: {
    borderColor: colors.coralDeep,
  },
  choiceText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.navy,
  },
  feedback: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.lavenderInk,
  },
  cta: {
    backgroundColor: colors.lavenderDeep,
    borderRadius: radii.pill,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
});
