import { StyleSheet, Text, View } from "react-native";
import { AnimatedProgressBar, SoftCard } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import type { bookCollectionViews } from "@/domain/adventure-book/adventureEntry";

type CollectionView = ReturnType<typeof bookCollectionViews>[number];

type Props = {
  collections: CollectionView[];
};

/**
 * Pokémon-style collections — found entries glow; missing stay silhouettes.
 */
export function BookCollectionsSection({ collections }: Props) {
  return (
    <SoftCard tint="yellow">
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>🏆 Living Collections</Text>
        <Text style={styles.title}>Fill your world like a treasure set</Text>
        <Text style={styles.body}>
          Found discoveries shine. Missing ones wait as silhouettes — go find
          them outside.
        </Text>
        {collections.map((collection) => (
          <View key={collection.id} style={styles.block}>
            <Text style={styles.collectionTitle}>
              {collection.emoji} {collection.title}
            </Text>
            <AnimatedProgressBar
              progress={
                collection.total === 0
                  ? 0
                  : (collection.completed / collection.total) * 100
              }
            />
            <Text style={styles.meta}>
              {collection.completed} of {collection.total}
            </Text>
            <View style={styles.silRow}>
              {collection.items.map((item) => (
                <View
                  key={item.name}
                  style={[
                    styles.sil,
                    item.found ? styles.silFound : styles.silMissing,
                  ]}
                >
                  <Text
                    style={[
                      styles.silText,
                      !item.found && styles.silTextMissing,
                    ]}
                  >
                    {item.found ? item.name : "· · ·"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  inner: {
    padding: 18,
    gap: 14,
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
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
  block: {
    gap: 8,
    paddingTop: 4,
  },
  collectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.inkSoft,
  },
  silRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sil: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  silFound: {
    backgroundColor: colors.pastelGreen,
  },
  silMissing: {
    backgroundColor: "rgba(26,43,74,0.08)",
  },
  silText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.navy,
  },
  silTextMissing: {
    color: colors.inkSoft,
  },
});
