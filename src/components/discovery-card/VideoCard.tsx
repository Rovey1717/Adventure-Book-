import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlayfulPressable } from "@/components/ui";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  objectName: string;
  childName?: string;
  description?: string;
  onPlay?: () => void;
};

export function VideoCard({
  objectName,
  childName = "your explorer",
  description,
  onPlay,
}: Props) {
  const caption =
    description ??
    `A short ${objectName.toLowerCase()} video helps ${childName} learn from the real world.`;

  return (
    <View style={[styles.card, shadows.float]}>
      <PlayfulPressable
        style={styles.stage}
        onPress={onPlay}
        accessibilityRole="button"
        accessibilityLabel={`Play ${objectName} video`}
        tilt
      >
        <LinearGradient
          colors={[colors.pastelBlue, colors.pastelPurple]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.stageEmoji}>🎬</Text>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </PlayfulPressable>
      <View style={styles.caption}>
        <Text style={styles.captionText}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xxl,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: colors.stroke,
  },
  stage: {
    height: 188,
    alignItems: "center",
    justifyContent: "center",
  },
  stageEmoji: {
    position: "absolute",
    top: 16,
    left: 18,
    fontSize: 26,
    opacity: 0.85,
  },
  playButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.float,
  },
  playIcon: {
    fontSize: 28,
    color: colors.lavenderDeep,
    marginLeft: 4,
  },
  caption: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.surfaceRaised,
  },
  captionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.navySoft,
  },
});
