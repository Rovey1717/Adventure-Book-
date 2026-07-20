import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { ContinueExploringItem } from "@/services/graph/LearningGraphService";

type Props = {
  items: ContinueExploringItem[];
  onSelect: (id: string) => void;
};

/** Continue Exploring — graph neighbors of the current node. */
export function ContinueExploring({ items, onSelect }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Continue Exploring</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.chip,
              shadows.soft,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  row: {
    gap: 10,
    paddingVertical: 2,
  },
  chip: {
    width: 108,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  pressed: {
    opacity: 0.9,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.navy,
    textAlign: "center",
  },
});
