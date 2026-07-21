import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/theme";
import { SkyDecorations } from "./SkyDecorations";

type Variant = "sky" | "cream" | "celebration" | "lavender" | "garden";

type Props = {
  variant?: Variant;
  children?: React.ReactNode;
  /**
   * Applied to the outer full-bleed root. Prefer layout props only (flex, etc.).
   * Do NOT put safe-area padding here — pad content / ScrollView instead so the
   * gradient stays edge-to-edge under the status bar.
   */
  style?: StyleProp<ViewStyle>;
  /** Soft floating ornaments (clouds, stars, etc.) */
  decorated?: boolean;
};

const GRADIENTS: Record<Variant, readonly [string, string, string]> = {
  sky: [colors.skyTop, colors.skyMid, colors.skyBottom],
  cream: [colors.pastelYellow, colors.cream, colors.pastelBlue],
  celebration: [colors.pastelPink, colors.pastelYellow, colors.pastelBlue],
  lavender: [colors.pastelPurple, colors.cream, colors.pastelYellow],
  garden: [colors.pastelGreen, colors.skyMid, colors.cream],
};

/**
 * Soft full-bleed gradient sky with optional gentle decorations.
 * Always fills the screen edge-to-edge; safe-area padding belongs on children.
 */
export function MagicalBackground({
  variant = "sky",
  children,
  style,
  decorated = true,
}: Props) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[...GRADIENTS[variant]]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {decorated ? <SkyDecorations variant={variant} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
});
