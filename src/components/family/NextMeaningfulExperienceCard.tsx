import { StyleSheet, Text, View } from "react-native";
import { SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import type {
  NextMeaningfulExperience,
  ReasonedRecommendation,
} from "@/domain/family/nextMeaningfulExperience";

type Props = {
  experience: NextMeaningfulExperience;
};

/**
 * Family AI answer card — every row includes why it was selected.
 * Never shows random encyclopedia picks.
 */
export function NextMeaningfulExperienceCard({ experience }: Props) {
  return (
    <SoftCard tint="green" shimmer>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Family AI</Text>
        <Text style={styles.question}>{experience.question}</Text>
        <Text style={styles.meta}>
          For {experience.childName} · age {experience.age} ·{" "}
          {experience.learningMode.replace(/_/g, " ")}
          {experience.currentDiscovery
            ? ` · from ${experience.currentDiscovery}`
            : ""}
        </Text>

        <RecRow
          label="Recommended Discovery"
          item={experience.recommendedDiscovery}
        />
        <RecRow
          label="Recommended Learning Activity"
          item={experience.recommendedLearningActivity}
        />
        <RecRow
          label="Recommended Adventure"
          item={experience.recommendedAdventure}
        />
        <RecRow
          label="Recommended Conversation"
          item={experience.recommendedConversation}
        />
        <RecRow
          label="Recommended Real-World Experience"
          item={experience.recommendedRealWorldExperience}
        />
      </View>
    </SoftCard>
  );
}

function RecRow({
  label,
  item,
}: {
  label: string;
  item: ReasonedRecommendation;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.detail}>{item.detail}</Text>
      <Text style={styles.why}>Why: {item.reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 14,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.grassDeep,
  },
  question: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    lineHeight: 26,
    color: colors.navy,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  row: {
    gap: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: colors.inkSoft,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.navy,
  },
  detail: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  why: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.grassDeep,
    fontStyle: "italic",
  },
});
