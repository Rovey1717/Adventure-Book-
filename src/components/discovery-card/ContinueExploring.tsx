import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PlayfulPressable } from "@/components/ui";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { ContinueExploringItem } from "@/services/graph/LearningGraphService";

type Props = {
  items: ContinueExploringItem[];
  onSelect: (id: string) => void;
};

const CHIP_TINTS = [
  colors.pastelPink,
  colors.pastelBlue,
  colors.pastelYellow,
  colors.pastelGreen,
  colors.pastelPurple,
];

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
        {items.map((item, index) => (
          <PlayfulPressable
            key={item.id}
            style={[
              styles.chip,
              shadows.soft,
              { backgroundColor: CHIP_TINTS[index % CHIP_TINTS.length] },
            ]}
            tilt
            onPress={() => onSelect(item.id)}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </PlayfulPressable>
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
    width: 112,
    borderRadius: radii.xl,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  emoji: {
    fontSize: 34,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.navy,
    textAlign: "center",
  },
});
