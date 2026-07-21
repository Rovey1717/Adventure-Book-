import { StyleSheet, Text, View } from "react-native";
import { SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import type { lifelongTimeline } from "@/domain/adventure-book/adventureEntry";

type Timeline = ReturnType<typeof lifelongTimeline>;

type Props = {
  timeline: Timeline;
};

/**
 * Lifelong growth timeline — revisit adventures by age.
 */
export function LifelongTimelineSection({ timeline }: Props) {
  if (timeline.length === 0) return null;

  return (
    <SoftCard tint="green">
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>🌱 Lifelong Timeline</Text>
        <Text style={styles.title}>Watch how curiosity grows</Text>
        {timeline.map((group) => (
          <View key={group.age} style={styles.group}>
            <Text style={styles.age}>{group.label}</Text>
            {group.entries.map((memory) => (
              <Text key={memory.id} style={styles.entry}>
                · {memory.objectName}
                {memory.locationLabel ? ` — ${memory.locationLabel}` : ""}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  inner: {
    padding: 18,
    gap: 12,
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
  group: {
    gap: 4,
  },
  age: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  entry: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
