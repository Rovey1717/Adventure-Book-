import { StyleSheet, Text, View } from "react-native";
import { PlayfulPressable } from "@/components/ui";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { RelatedDiscovery } from "@/services/graph/LearningGraphService";

type Props = {
  items: RelatedDiscovery[];
  onSelect: (id: string) => void;
};

const ROW_TINTS = [
  colors.pastelBlue,
  colors.pastelGreen,
  colors.pastelPink,
  colors.pastelYellow,
];

/** Graph neighbors — never hardcoded related lists. */
export function RelatedDiscoveries({ items, onSelect }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Connected discoveries</Text>
      <Text style={styles.subtitle}>
        Linked through the Garden learning graph
      </Text>
      <View style={styles.list}>
        {items.map((item, index) => (
          <PlayfulPressable
            key={item.id}
            style={[styles.row, shadows.soft]}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}
          >
            <View
              style={[
                styles.emojiWrap,
                { backgroundColor: ROW_TINTS[index % ROW_TINTS.length] },
              ]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.reason} numberOfLines={2}>
                {item.reason}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </PlayfulPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navySoft,
    marginBottom: 2,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.stroke,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.navy,
  },
  reason: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.navySoft,
  },
  chevron: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.grass,
  },
});
