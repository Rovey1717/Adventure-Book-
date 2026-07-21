import { StyleSheet, Text, View } from "react-native";
import { DiscoveryMemoryStatsBar } from "@/components/discovery-card/DiscoveryMemoryStatsBar";
import { FamilyMemoryCard } from "@/components/discovery-card/FamilyMemoryCard";
import { MemoryTimeline } from "@/components/discovery-card/MemoryTimeline";
import { SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import type { Memory } from "@/domain/memory/types";
import type { DiscoveryMemoryTimeline } from "@/intelligence/types/discoveryMemoryTimeline";

type Props = {
  discoveryTitle: string;
  timeline: DiscoveryMemoryTimeline | null;
  memories: Memory[];
  adventuresCompleted: number;
};

/**
 * ❤️ My Journey — personal history that grows over months and years.
 */
export function DiscoveryCardMyJourneySection({
  discoveryTitle,
  timeline,
  memories,
  adventuresCompleted,
}: Props) {
  const first = timeline?.stats.firstSeenAt
    ? new Date(timeline.stats.firstSeenAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : timeline?.stats.firstSeenLabel ?? null;

  return (
    <View style={styles.stack}>
      <SoftCard tint="coral">
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>❤️ My Journey</Text>
          <Text style={styles.title}>Your history with {discoveryTitle}</Text>
          <Text style={styles.body}>
            This timeline keeps growing — photos, memories, and adventures over
            months and years. You never finish a Discovery Card.
          </Text>
          {first ? (
            <Text style={styles.meta}>First discovery · {first}</Text>
          ) : (
            <Text style={styles.meta}>
              Capture {discoveryTitle} in the real world to start this journey.
            </Text>
          )}
          <Text style={styles.meta}>
            Adventures completed · {adventuresCompleted}
          </Text>
        </View>
      </SoftCard>

      {timeline ? <DiscoveryMemoryStatsBar stats={timeline.stats} /> : null}

      {memories.map((memory) => (
        <FamilyMemoryCard key={memory.id} memory={memory} />
      ))}

      {timeline && timeline.entries.length > 0 ? (
        <MemoryTimeline timeline={timeline} />
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
    color: colors.coralDeep,
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
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
});
