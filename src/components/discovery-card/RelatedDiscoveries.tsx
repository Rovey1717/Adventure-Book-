import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { RelatedDiscovery } from "@/services/graph/LearningGraphService";

type Props = {
  items: RelatedDiscovery[];
  onSelect: (id: string) => void;
};

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
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.row,
              shadows.soft,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.reason} numberOfLines={2}>
                {item.reason}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
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
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 28,
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
    color: colors.moss,
  },
});
