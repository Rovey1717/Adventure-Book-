import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Variant = "sky" | "cream" | "celebration" | "lavender" | "garden";

type Props = {
  variant?: Variant;
};

type Ornament = {
  glyph: string;
  top: `${number}%`;
  left?: `${number}%`;
  right?: `${number}%`;
  size: number;
  delay: number;
  drift: number;
};

const ORNAMENTS: Record<Variant, Ornament[]> = {
  sky: [
    { glyph: "☁️", top: "6%", left: "8%", size: 28, delay: 0, drift: 8 },
    { glyph: "☁️", top: "12%", right: "10%", size: 22, delay: 400, drift: 6 },
    { glyph: "⭐", top: "22%", left: "18%", size: 16, delay: 200, drift: 5 },
    { glyph: "🦋", top: "18%", right: "22%", size: 18, delay: 600, drift: 10 },
    { glyph: "☁️", top: "78%", left: "6%", size: 24, delay: 300, drift: 7 },
    { glyph: "🌈", top: "70%", right: "8%", size: 22, delay: 500, drift: 4 },
  ],
  cream: [
    { glyph: "⭐", top: "8%", left: "12%", size: 18, delay: 0, drift: 6 },
    { glyph: "🌸", top: "14%", right: "14%", size: 20, delay: 350, drift: 8 },
    { glyph: "✨", top: "75%", left: "10%", size: 16, delay: 200, drift: 5 },
    { glyph: "🍃", top: "68%", right: "12%", size: 18, delay: 450, drift: 7 },
  ],
  celebration: [
    { glyph: "✨", top: "8%", left: "10%", size: 20, delay: 0, drift: 8 },
    { glyph: "🌟", top: "12%", right: "12%", size: 22, delay: 200, drift: 10 },
    { glyph: "🎈", top: "70%", left: "8%", size: 24, delay: 400, drift: 12 },
    { glyph: "🎈", top: "66%", right: "10%", size: 20, delay: 550, drift: 11 },
    { glyph: "⭐", top: "22%", left: "40%", size: 16, delay: 300, drift: 6 },
  ],
  lavender: [
    { glyph: "✨", top: "10%", left: "14%", size: 18, delay: 0, drift: 6 },
    { glyph: "🌙", top: "8%", right: "16%", size: 22, delay: 250, drift: 5 },
    { glyph: "⭐", top: "72%", left: "12%", size: 16, delay: 400, drift: 7 },
    { glyph: "🦋", top: "68%", right: "14%", size: 18, delay: 500, drift: 9 },
  ],
  garden: [
    { glyph: "🍃", top: "10%", left: "10%", size: 20, delay: 0, drift: 7 },
    { glyph: "🌸", top: "14%", right: "12%", size: 18, delay: 300, drift: 6 },
    { glyph: "🐞", top: "74%", left: "14%", size: 16, delay: 200, drift: 5 },
    { glyph: "🌻", top: "68%", right: "10%", size: 22, delay: 450, drift: 8 },
  ],
};

function FloatingGlyph({ item }: { item: Ornament }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    y.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(-item.drift, {
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(item.drift, {
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      item.delay,
      withRepeat(
        withSequence(
          withTiming(0.75, { duration: 1800 }),
          withTiming(0.45, { duration: 1800 }),
        ),
        -1,
        true,
      ),
    );
  }, [item.delay, item.drift, opacity, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ornament,
        { top: item.top, left: item.left, right: item.right },
        style,
      ]}
    >
      <Text style={{ fontSize: item.size }}>{item.glyph}</Text>
    </Animated.View>
  );
}

/**
 * Subtle floating decorations — never blocks taps, always behind content.
 */
export function SkyDecorations({ variant = "sky" }: Props) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {ORNAMENTS[variant].map((item, index) => (
        <FloatingGlyph key={`${item.glyph}-${index}`} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ornament: {
    position: "absolute",
  },
});
