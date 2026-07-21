import { StyleSheet, Text, View } from "react-native";
import { AnimatedProgressBar, SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import type { AdventureCollectionDef } from "@/domain/learning/card";

export type CollectionProgressView = {
  collection: AdventureCollectionDef;
  completed: number;
  total: number;
  remaining: string[];
  isPrimary: boolean;
};

type Props = {
  discoveryTitle: string;
  collections: CollectionProgressView[];
};

/**
 * 🏆 Collections — real-world exploration progress sets.
 */
export function DiscoveryCardCollectionsSection({
  discoveryTitle,
  collections,
}: Props) {
  return (
    <View style={styles.stack}>
      <SoftCard tint="yellow">
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>🏆 Collections</Text>
          <Text style={styles.title}>Collect the world around you</Text>
          <Text style={styles.body}>
            Collections grow when you find related discoveries outside — not by
            finishing an app checklist alone.
          </Text>
        </View>
      </SoftCard>

      {collections.length === 0 ? (
        <SoftCard tint="aqua">
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {discoveryTitle} will join collections as Family AI connects it to
              broader journeys.
            </Text>
          </View>
        </SoftCard>
      ) : (
        collections.map(({ collection, completed, total, remaining, isPrimary }) => (
          <SoftCard
            key={collection.id}
            tint={isPrimary ? "green" : "lavender"}
          >
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>{collection.emoji}</Text>
              <Text style={styles.cardTitle}>{collection.title}</Text>
              <Text style={styles.cardSubtitle}>{collection.subtitle}</Text>
              <AnimatedProgressBar
                progress={total === 0 ? 0 : (completed / total) * 100}
              />
              <Text style={styles.cardMeta}>
                {completed} of {total} found
                {isPrimary ? ` · includes ${discoveryTitle}` : ""}
              </Text>
              {remaining.length > 0 ? (
                <Text style={styles.remaining}>
                  Still to find · {remaining.slice(0, 4).join(", ")}
                  {remaining.length > 4 ? "…" : ""}
                </Text>
              ) : (
                <Text style={styles.remaining}>Collection complete — keep exploring deeper</Text>
              )}
            </View>
          </SoftCard>
        ))
      )}
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
    color: colors.sunshineDeep,
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
  empty: {
    padding: 18,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  card: {
    padding: 18,
    gap: 8,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  cardMeta: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
  remaining: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.navy,
  },
});
