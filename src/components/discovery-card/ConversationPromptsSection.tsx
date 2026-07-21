import { StyleSheet, Text, View } from "react-native";
import { SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import { parentCoachStartersFor } from "@/domain/learning/parentCoach";

type Props = {
  objectName: string;
  childName?: string;
  /** Tapers with age — omit to show the full coach pack. */
  promptCount?: number;
};

/**
 * Parent coaching prompts — teach the parent how to teach.
 * Count tapers as the child develops toward independence.
 */
export function ConversationPromptsSection({
  objectName,
  childName,
  promptCount,
}: Props) {
  const coach = parentCoachStartersFor(objectName);
  const who = childName?.trim() || "your child";
  const starters =
    promptCount == null
      ? coach.starters
      : coach.starters.slice(0, Math.max(0, promptCount));

  if (starters.length === 0) return null;

  return (
    <SoftCard tint="blue">
      <View style={styles.card}>
        <Text style={styles.title}>
          {promptCount != null && promptCount <= 2
            ? "A few conversation starters"
            : "How to teach this moment"}
        </Text>
        <Text style={styles.hint}>
          {coach.coachingFrame} These starters help you guide {who} — the app
          does not replace you.
        </Text>
        {starters.map((prompt) => (
          <View key={prompt} style={styles.row}>
            <Text style={styles.bullet}>💬</Text>
            <Text style={styles.prompt}>{prompt}</Text>
          </View>
        ))}
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 16,
    lineHeight: 24,
  },
  prompt: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    lineHeight: 24,
    color: colors.navy,
  },
});
