import { StyleSheet, Text, View } from "react-native";
import { NextMeaningfulExperienceCard } from "@/components/family/NextMeaningfulExperienceCard";
import { PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import type { LearningJourneyStep } from "@/domain/discovery-card/learningJourneyPath";
import type { NextMeaningfulExperience } from "@/domain/family/nextMeaningfulExperience";

type Props = {
  discoveryTitle: string;
  /** Always the next lesson on this card's Learning Journey — never random. */
  nextLesson: LearningJourneyStep | null;
  experience: NextMeaningfulExperience | null;
  onOpenLesson?: (step: LearningJourneyStep) => void;
};

/**
 * 🌱 What's Next — Family AI always knows the next lesson.
 */
export function DiscoveryCardWhatsNextSection({
  discoveryTitle,
  nextLesson,
  experience,
  onOpenLesson,
}: Props) {
  return (
    <View style={styles.stack}>
      <SoftCard tint="green">
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>🌱 What's Next</Text>
          <Text style={styles.title}>What should I learn next?</Text>
          <Text style={styles.body}>
            Family AI recommends the next lesson on your {discoveryTitle} path —
            based on what you have already completed, never at random.
          </Text>
        </View>
      </SoftCard>

      {nextLesson ? (
        <PlayfulPressable
          onPress={() => onOpenLesson?.(nextLesson)}
          disabled={
            nextLesson.status === "locked" ||
            nextLesson.status === "coming_soon"
          }
          style={[
            styles.lessonCard,
            nextLesson.status === "coming_soon" && styles.lessonSoon,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Next lesson: ${nextLesson.title}`}
        >
          <Text style={styles.lessonEyebrow}>
            {nextLesson.status === "coming_soon"
              ? "Growing into"
              : "Next lesson"}
          </Text>
          <Text style={styles.lessonTitle}>{nextLesson.title}</Text>
          <Text style={styles.lessonBody}>{nextLesson.subtitle}</Text>
        </PlayfulPressable>
      ) : null}

      {experience ? (
        <>
          <Text style={styles.moreLabel}>Also meaningful right now</Text>
          <NextMeaningfulExperienceCard experience={experience} />
        </>
      ) : !nextLesson ? (
        <SoftCard tint="aqua">
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Recommendations appear as this Family AI profile grows with your
              discoveries.
            </Text>
          </View>
        </SoftCard>
      ) : null}
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
    color: colors.grassDeep,
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
  lessonCard: {
    padding: 18,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.lavenderDeep,
    backgroundColor: colors.pastelPurple,
    gap: 6,
  },
  lessonSoon: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
    borderStyle: "dashed",
  },
  lessonEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.lavenderDeep,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  lessonTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  lessonBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  moreLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.navy,
  },
  empty: {
    padding: 18,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
});
