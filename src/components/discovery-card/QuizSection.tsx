import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";
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
    <View style={[styles.card, shadows.soft]}>
      <Text style={styles.title}>{objectName} Quiz</Text>
      <Text style={styles.hint}>
        A friendly practice quiz for everyone — not a personalized Adventure.
      </Text>

      {!started ? (
        <Pressable style={styles.cta} onPress={() => setStarted(true)}>
          <Text style={styles.ctaText}>Take Quiz</Text>
        </Pressable>
      ) : (
        <View style={styles.block}>
          <Text style={styles.question}>{question.question}</Text>
          {question.choices.map((choice, choiceIndex) => {
            const isSelected = selected === choiceIndex;
            const isAnswer = choiceIndex === question.answerIndex;
            return (
              <Pressable
                key={choice}
                disabled={answered}
                onPress={() => setSelected(choiceIndex)}
                style={[
                  styles.choice,
                  isSelected && styles.choiceSelected,
                  answered && isAnswer && styles.choiceCorrect,
                  answered && isSelected && !isAnswer && styles.choiceWrong,
                ]}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </Pressable>
            );
          })}
          {answered ? (
            <Text style={styles.feedback}>
              {correct ? "Nice!" : "Good try — keep exploring!"}
            </Text>
          ) : null}
          {answered ? (
            <Pressable
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
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
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
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 48,
    justifyContent: "center",
  },
  choiceSelected: {
    borderColor: colors.navy,
  },
  choiceCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.pastelGreen,
  },
  choiceWrong: {
    borderColor: colors.orangeDeep,
  },
  choiceText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.navy,
  },
  feedback: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.lavenderInk,
  },
  cta: {
    backgroundColor: colors.navy,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
});
