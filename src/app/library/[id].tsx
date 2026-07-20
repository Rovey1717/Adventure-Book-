import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { emojiForLibraryEntry } from "@/domain/library/emoji";
import type { LibraryQuizQuestion } from "@/domain/library/types";

/**
 * Library card — universal knowledge only.
 * Never creates Memories, Adventures, or Journey progress.
 */
export default function LibraryDiscoveryCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { library } = useApp();
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const entry = useMemo(
    () => (id ? library.getEntry(id) : null),
    [id, library],
  );

  const category = useMemo(() => {
    if (!entry) return null;
    return (
      library.getCategories().find((item) => item.id === entry.categoryId) ??
      null
    );
  }, [entry, library]);

  if (!entry) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.missingTitle}>Card not found</Text>
        <Pressable style={styles.primary} onPress={() => router.back()}>
          <Text style={styles.primaryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const accent = category?.accent ?? colors.moss;
  const emoji = emojiForLibraryEntry(entry.title, entry.categoryId);
  const question: LibraryQuizQuestion | undefined = entry.quiz[quizIndex];
  const answered = selectedChoice !== null;
  const correct = answered && selectedChoice === question?.answerIndex;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[accent, colors.skyMid, colors.skyBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>Close</Text>
        </Pressable>

        <Text style={styles.eyebrow}>
          {category?.title ?? "Library"} · Encyclopedia
        </Text>

        <View style={styles.hero}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.pronunciation}>{entry.pronunciation}</Text>
        <Text style={styles.lead}>
          Universal knowledge for everyone — this does not save a memory or
          unlock adventures.
        </Text>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Pronunciation</Text>
          <Text style={styles.panelBody}>{entry.pronunciation}</Text>
        </View>

        {entry.vocabulary.length > 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Vocabulary</Text>
            <Text style={styles.panelBody}>{entry.vocabulary.join(" · ")}</Text>
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Fun facts</Text>
          {entry.facts.map((fact) => (
            <View key={fact} style={styles.factRow}>
              <Text style={styles.factBullet}>✦</Text>
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>

        <View style={styles.activities}>
          {entry.hasVideo ? (
            <View style={styles.activityChip}>
              <Text style={styles.activityText}>Video</Text>
            </View>
          ) : null}
          {entry.hasSound ? (
            <View style={styles.activityChip}>
              <Text style={styles.activityText}>Sounds</Text>
            </View>
          ) : null}
          <View style={styles.activityChip}>
            <Text style={styles.activityText}>Facts</Text>
          </View>
          {entry.hasQuiz ? (
            <View style={styles.activityChip}>
              <Text style={styles.activityText}>Quiz</Text>
            </View>
          ) : null}
        </View>

        {entry.hasVideo ? (
          <View style={styles.mediaStub}>
            <Text style={styles.mediaTitle}>Video</Text>
            <Text style={styles.mediaBody}>
              Watch a short {entry.title} video (coming soon).
            </Text>
          </View>
        ) : null}

        {entry.hasSound ? (
          <View style={styles.mediaStub}>
            <Text style={styles.mediaTitle}>Sounds</Text>
            <Text style={styles.mediaBody}>
              Listen to {entry.title} sounds (coming soon).
            </Text>
          </View>
        ) : null}

        {entry.hasQuiz && entry.quiz.length > 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{entry.title} Quiz</Text>
            <Text style={styles.quizHint}>
              Generic quiz — same for everyone, not personalized.
            </Text>

            {!showQuiz ? (
              <Pressable
                style={styles.secondary}
                onPress={() => {
                  setShowQuiz(true);
                  setQuizIndex(0);
                  setSelectedChoice(null);
                }}
              >
                <Text style={styles.secondaryText}>Take Quiz</Text>
              </Pressable>
            ) : question ? (
              <View style={styles.quizBlock}>
                <Text style={styles.question}>{question.question}</Text>
                {question.choices.map((choice, index) => {
                  const isSelected = selectedChoice === index;
                  const isAnswer = index === question.answerIndex;
                  return (
                    <Pressable
                      key={choice}
                      style={[
                        styles.choice,
                        isSelected && styles.choiceSelected,
                        answered && isAnswer && styles.choiceCorrect,
                        answered && isSelected && !isAnswer && styles.choiceWrong,
                      ]}
                      disabled={answered}
                      onPress={() => setSelectedChoice(index)}
                    >
                      <Text style={styles.choiceText}>{choice}</Text>
                    </Pressable>
                  );
                })}
                {answered ? (
                  <Text style={styles.feedback}>
                    {correct ? "Nice!" : "Good try — keep learning!"}
                  </Text>
                ) : null}
                {answered ? (
                  <Pressable
                    style={styles.secondary}
                    onPress={() => {
                      if (quizIndex < entry.quiz.length - 1) {
                        setQuizIndex((current) => current + 1);
                        setSelectedChoice(null);
                      } else {
                        setShowQuiz(false);
                        setQuizIndex(0);
                        setSelectedChoice(null);
                      }
                    }}
                  >
                    <Text style={styles.secondaryText}>
                      {quizIndex < entry.quiz.length - 1
                        ? "Next question"
                        : "Finish quiz"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.footnote}>
          Capture something in Discover to create a Memory, unlock Adventures,
          and grow your Journey.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyMid,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 16,
  },
  content: {
    paddingHorizontal: space.lg,
    gap: 12,
  },
  back: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.mossDeep,
    marginBottom: 4,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.mossDeep,
  },
  hero: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 46,
    color: colors.ink,
    textAlign: "center",
  },
  pronunciation: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.inkMuted,
    textAlign: "center",
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 4,
  },
  panel: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  panelTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
  },
  panelBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  factRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  factBullet: {
    fontFamily: fonts.bodyBold,
    color: colors.orange,
    marginTop: 2,
  },
  factText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  activities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  activityChip: {
    backgroundColor: colors.mossSoft,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activityText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.mossDeep,
  },
  mediaStub: {
    backgroundColor: "rgba(255,255,255,0.55)",
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  mediaTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.ink,
  },
  mediaBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
  },
  quizHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  quizBlock: {
    gap: 10,
  },
  question: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 22,
  },
  choice: {
    backgroundColor: colors.mossSoft,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  choiceSelected: {
    borderColor: colors.moss,
  },
  choiceCorrect: {
    borderColor: colors.success,
    backgroundColor: "#D8F3E5",
  },
  choiceWrong: {
    borderColor: colors.orangeDeep,
  },
  choiceText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  feedback: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.mossDeep,
  },
  secondary: {
    backgroundColor: colors.moss,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
  primary: {
    backgroundColor: colors.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 4,
  },
  missingTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: "center",
  },
});
