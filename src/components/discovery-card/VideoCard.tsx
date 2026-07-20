import { Pressable, StyleSheet, Text, View } from "react-native";
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
    <View style={[styles.card, shadows.soft]}>
      <Pressable
        style={styles.stage}
        onPress={onPlay}
        accessibilityRole="button"
        accessibilityLabel={`Play ${objectName} video`}
      >
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </Pressable>
      <View style={styles.caption}>
        <Text style={styles.captionText}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
  },
  stage: {
    height: 180,
    backgroundColor: colors.peach,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  playIcon: {
    fontSize: 26,
    color: colors.navy,
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
