import type { ReactNode } from "react";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { LearningModule } from "@/domain/learning/card";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  module: LearningModule;
};

/**
 * Renders one Learning Card module. Add new `type` cases without redesigning the card shell.
 */
export function LearningModuleView({ module }: Props) {
  switch (module.type) {
    case "hero":
      return <HeroModule module={module} />;
    case "hear_word":
      return <HearWordModule module={module} />;
    case "fun_fact":
      return <FunFactModule module={module} />;
    case "quiz":
      return <QuizModule module={module} />;
    case "wonder":
      return <WonderModule module={module} />;
    case "challenge":
      return <ChallengeModule module={module} />;
    case "progress":
      return <ProgressModule module={module} />;
    case "related":
      return <RelatedModule module={module} />;
    case "save_status":
      return <SaveStatusModule module={module} />;
    case "future":
      return <FutureModule module={module} />;
    default:
      return null;
  }
}

function CardShell({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <View style={[styles.card, shadows.soft]}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {children}
    </View>
  );
}

function HeroModule({ module }: { module: Extract<LearningModule, { type: "hero" }> }) {
  const showPhoto =
    !!module.photoUri && !module.photoUri.startsWith("mock-");
  return (
    <View style={styles.hero}>
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
      <Text style={styles.heroCategory}>{module.categoryLabel}</Text>
    </View>
  );
}

function HearWordModule({
  module,
}: {
  module: Extract<LearningModule, { type: "hear_word" }>;
}) {
  return (
    <CardShell eyebrow="Hear the word">
      <Text style={styles.word}>{module.word}</Text>
      <Text style={styles.pronunciation}>{module.pronunciation}</Text>
      <Text style={styles.hint}>Say it together out loud</Text>
    </CardShell>
  );
}

function FunFactModule({
  module,
}: {
  module: Extract<LearningModule, { type: "fun_fact" }>;
}) {
  return (
    <CardShell eyebrow="Fun fact">
      <Text style={styles.body}>{module.fact}</Text>
    </CardShell>
  );
}

function QuizModule({
  module,
}: {
  module: Extract<LearningModule, { type: "quiz" }>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = answered && selected === module.answerIndex;

  return (
    <CardShell eyebrow="Mini quiz">
      <Text style={styles.question}>{module.question}</Text>
      {module.choices.map((choice, index) => {
        const isSelected = selected === index;
        const isAnswer = index === module.answerIndex;
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
            onPress={() => setSelected(index)}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </Pressable>
        );
      })}
      {answered ? (
        <Text style={styles.feedback}>
          {correct ? "Nice!" : "Almost — try noticing again next time."}
        </Text>
      ) : null}
    </CardShell>
  );
}

function WonderModule({
  module,
}: {
  module: Extract<LearningModule, { type: "wonder" }>;
}) {
  return (
    <CardShell eyebrow="Wonder question">
      <Text style={styles.body}>{module.prompt}</Text>
    </CardShell>
  );
}

function ChallengeModule({
  module,
}: {
  module: Extract<LearningModule, { type: "challenge" }>;
}) {
  return (
    <CardShell eyebrow="Challenge">
      <Text style={styles.body}>{module.text}</Text>
    </CardShell>
  );
}

function ProgressModule({
  module,
}: {
  module: Extract<LearningModule, { type: "progress" }>;
}) {
  const ratio = module.total > 0 ? module.completed / module.total : 0;
  return (
    <CardShell eyebrow="Learning progress">
      <Text style={styles.progressTitle}>{module.label}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.hint}>
        {module.completed} of {module.total} found
      </Text>
    </CardShell>
  );
}

function RelatedModule({
  module,
}: {
  module: Extract<LearningModule, { type: "related" }>;
}) {
  return (
    <CardShell eyebrow={module.title}>
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
    <View style={styles.saveBadge}>
      <Text style={styles.saveText}>✓ {module.message}</Text>
    </View>
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
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.moss,
  },
  hero: {
    gap: 8,
    marginBottom: 4,
  },
  heroPhoto: {
    width: "100%",
    height: 220,
    borderRadius: radii.xl,
    backgroundColor: colors.pastelBlue,
  },
  heroFallback: {
    height: 180,
    borderRadius: radii.xl,
    backgroundColor: colors.pastelYellow,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroName: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.navy,
  },
  heroCategory: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.inkMuted,
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
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.cream,
  },
  choiceSelected: {
    borderColor: colors.orange,
  },
  choiceCorrect: {
    borderColor: colors.success,
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
    color: colors.moss,
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
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.mossSoft,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.orange,
  },
  relatedLine: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.navy,
    lineHeight: 26,
  },
  saveBadge: {
    backgroundColor: colors.pastelGreen,
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  saveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.mossDeep,
    textAlign: "center",
  },
  futureCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderStyle: "dashed",
    padding: 18,
    gap: 6,
    opacity: 0.75,
  },
});
