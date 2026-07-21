import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import {
  learningStagesForObject,
  type LearningStage,
} from "@/domain/library/learningStages";

type Props = {
  objectName: string;
  childName: string;
  stages?: LearningStage[];
};

export function LearningStages({
  objectName,
  childName,
  stages,
}: Props) {
  const items = stages ?? learningStagesForObject(objectName);

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>✨ This grows with {childName}</Text>
      <View style={styles.list}>
        {items.map((stage, index) => (
          <Animated.View
            key={stage.age}
            entering={FadeInDown.delay(index * 90)
              .duration(360)
              .springify()}
            style={[
              styles.card,
              shadows.soft,
              { backgroundColor: `${stage.soft}` },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: colors.surfaceRaised }]}>
              <Text style={[styles.glyph, { color: stage.accent }]}>
                {stage.glyph}
              </Text>
            </View>
            <View style={styles.copy}>
              <View style={styles.row}>
                <View
                  style={[styles.agePill, { backgroundColor: stage.accent }]}
                >
                  <Text style={styles.ageText}>Age {stage.age}</Text>
                </View>
                <Text style={[styles.mode, { color: stage.accent }]}>
                  {stage.mode.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.title}>{stage.title}</Text>
              <Text style={styles.description}>{stage.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  heading: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.lavenderInk,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: radii.xl,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  glyph: {
    fontSize: 20,
    fontFamily: fonts.display,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  agePill: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  ageText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.surfaceRaised,
  },
  mode: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
    lineHeight: 22,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.navySoft,
  },
});
