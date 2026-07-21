import { type ReactNode, useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors, radii, shadows } from "@/constants/theme";

type Props = {
  uri?: string | null;
  source?: ImageSourcePropType;
  /** Fallback when no photo (emoji / glyph) */
  children?: ReactNode;
  height?: number;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Photo inside a playful colorful rounded frame with soft shadow.
 */
export function PhotoFrame({
  uri,
  source,
  children,
  height = 168,
  borderColor = colors.skyBlue,
  style,
}: Props) {
  const scale = useSharedValue(0.92);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 180 });
  }, [scale, uri]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const showPhoto = !!uri && !uri.startsWith("mock-");

  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      style={[
        styles.frame,
        shadows.soft,
        { borderColor, height },
        anim,
        style,
      ]}
    >
      {showPhoto ? (
        <Image source={{ uri }} style={styles.image} />
      ) : source ? (
        <Image source={source} style={styles.image} />
      ) : (
        <View style={styles.fallback}>{children}</View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.xl,
    borderWidth: 4,
    overflow: "hidden",
    backgroundColor: colors.pastelBlue,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
