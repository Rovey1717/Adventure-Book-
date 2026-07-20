import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";

export type QuickActionId =
  | "watch"
  | "sounds"
  | "languages"
  | "facts"
  | "quiz"
  | "activities";

export type QuickAction = {
  id: QuickActionId;
  label: string;
  icon: string;
  tint: string;
  soft: string;
};

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "watch",
    label: "Watch",
    icon: "▶",
    tint: "#3D7BD1",
    soft: colors.pastelBlue,
  },
  {
    id: "sounds",
    label: "Sounds",
    icon: "🔊",
    tint: "#2F9E6B",
    soft: colors.pastelGreen,
  },
  {
    id: "languages",
    label: "Languages",
    icon: "🌍",
    tint: "#6B4FA0",
    soft: colors.pastelPurple,
  },
  {
    id: "facts",
    label: "Fun Facts",
    icon: "💡",
    tint: "#F08A24",
    soft: colors.pastelOrange,
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: "❓",
    tint: "#D6457A",
    soft: colors.pastelPink,
  },
  {
    id: "activities",
    label: "Activities",
    icon: "🎯",
    tint: "#C9A227",
    soft: colors.pastelYellow,
  },
];

type Props = {
  actions?: QuickAction[];
  onPress: (id: QuickActionId) => void;
};

export function QuickActionGrid({
  actions = DEFAULT_QUICK_ACTIONS,
  onPress,
}: Props) {
  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          style={({ pressed }) => [
            styles.tile,
            shadows.soft,
            pressed && styles.pressed,
          ]}
          onPress={() => onPress(action.id)}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <View style={[styles.iconWrap, { backgroundColor: action.soft }]}>
            <Text style={[styles.icon, { color: action.tint }]}>
              {action.icon}
            </Text>
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "47.5%",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 10,
    minHeight: 108,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.navy,
  },
});
