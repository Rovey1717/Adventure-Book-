import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

/**
 * Decision screen after a discovery is permanently saved.
 * Celebrate Now → short celebration → Learning Card
 * Continue Exploring → back to Discover with a lightweight toast
 */
export default function DiscoverySavedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memories, lastCapture, continueExploring } = useApp();

  const memory = useMemo(
    () => memories.find((item) => item.id === id) ?? lastCapture?.memory ?? null,
    [id, lastCapture?.memory, memories],
  );

  const name = memory?.objectName ?? "Discovery";

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.skyTop, "#FFE7B8", colors.skyBottom]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 36,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <Text style={styles.badge}>✓ Saved to Adventure Book</Text>
        <Text style={styles.eyebrow}>Great Discovery!</Text>
        <Text style={styles.title}>You found a {name}!</Text>
        <Text style={styles.body}>
          Your discovery has been saved. Would you like to celebrate it now or
          continue exploring?
        </Text>
        <Text style={styles.support}>
          Real life comes first — you can always open this later in Adventure
          Book.
        </Text>

        <Pressable
          style={styles.primary}
          onPress={() => {
            if (!memory?.id) return;
            // Push (not replace) so the stack stays coherent; Learning Card
            // Back goes to Discover via replace("/(tabs)").
            router.push({
              pathname: "/learning/[id]",
              params: { id: memory.id, celebrate: "1" },
            });
          }}
        >
          <Text style={styles.primaryText}>🎉 Celebrate Now</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => {
            if (!memory) {
              router.replace("/");
              return;
            }
            continueExploring(memory.objectName);
            router.replace("/");
          }}
        >
          <Text style={styles.secondaryText}>Continue Exploring</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.mossDeep,
    backgroundColor: colors.pastelGreen,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    marginBottom: 4,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.moss,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.inkMuted,
    marginTop: 4,
  },
  support: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
    marginBottom: 10,
  },
  primary: {
    backgroundColor: colors.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
  secondary: {
    backgroundColor: colors.mossSoft,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.mossDeep,
  },
});
