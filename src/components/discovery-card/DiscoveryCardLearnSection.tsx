import { StyleSheet, Text, View } from "react-native";
import { ConversationPromptsSection } from "@/components/discovery-card/ConversationPromptsSection";
import { FactSection } from "@/components/discovery-card/FactSection";
import { QuizSection } from "@/components/discovery-card/QuizSection";
import { RelatedDiscoveries } from "@/components/discovery-card/RelatedDiscoveries";
import { VideoCard } from "@/components/discovery-card/VideoCard";
import { SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import type { LibraryEntry } from "@/domain/library/types";
import type { DevelopmentalFeaturePlan } from "@/domain/learning/developmentalFeatures";
import type { RelatedDiscovery } from "@/services/graph/LearningGraphService";

type Props = {
  entry: LibraryEntry;
  features: DevelopmentalFeaturePlan;
  childName: string;
  related: RelatedDiscovery[];
  onOpenRelated: (id: string) => void;
  onVideoPlay?: () => void;
  onQuizComplete?: () => void;
};

/**
 * 📚 Learn — modular educational content.
 * New media formats plug in here without redesigning the Discovery Card.
 */
export function DiscoveryCardLearnSection({
  entry,
  features,
  childName,
  related,
  onOpenRelated,
  onVideoPlay,
  onQuizComplete,
}: Props) {
  return (
    <View style={styles.stack}>
      <SoftCard tint="blue">
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>📚 Learn</Text>
          <Text style={styles.title}>What is a {entry.title}?</Text>
          <Text style={styles.body}>
            Name, pronunciation, sounds, vocabulary, and facts — building blocks
            for a lifelong understanding. Richer media can grow here over time.
          </Text>
          {entry.pronunciation ? (
            <Text style={styles.pronunciation}>
              Say it · {entry.pronunciation}
            </Text>
          ) : null}
        </View>
      </SoftCard>

      {entry.hasVideo ? (
        <VideoCard
          objectName={entry.title}
          childName={childName}
          onPlay={onVideoPlay}
        />
      ) : null}

      <FactSection facts={entry.facts} vocabulary={entry.vocabulary} />

      {features.quizzes && entry.hasQuiz ? (
        <QuizSection
          objectName={entry.title}
          questions={entry.quiz}
          onComplete={onQuizComplete}
        />
      ) : null}

      {features.conversationPrompts && features.parentPromptCount > 0 ? (
        <ConversationPromptsSection
          objectName={entry.title}
          childName={childName}
          promptCount={features.parentPromptCount}
        />
      ) : null}

      <RelatedDiscoveries items={related} onSelect={onOpenRelated} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  intro: {
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.skyBlue,
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
  pronunciation: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.navy,
  },
});
