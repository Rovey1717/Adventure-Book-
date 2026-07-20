import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

/**
 * Shown after a Learning Card is completed when an Adventure unlocks.
 */
export default function AdventureUnlockScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memories, lastCapture, markUnlockSeen, getAdventuresForMemory } =
    useApp();

  const memory = useMemo(
    () => memories.find((item) => item.id === id) ?? lastCapture?.memory ?? null,
    [id, lastCapture?.memory, memories],
  );

  const unlock = memory?.learningCard?.unlockCandidate;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.pastelPurple, colors.cream, colors.pastelYellow]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <Text style={styles.party}>🎉</Text>
        <Text style={styles.eyebrow}>Adventure Unlocked</Text>
        <Text style={styles.emoji}>{unlock?.emoji ?? "✨"}</Text>
        <Text style={styles.title}>{unlock?.title ?? "New Adventure"}</Text>
        <Text style={styles.body}>
          {unlock?.subtitle ??
            "Keep discovering in the real world to grow this adventure."}
        </Text>

        <Pressable
          style={styles.primary}
          onPress={() => {
            void (async () => {
              if (memory) await markUnlockSeen(memory.id);
              const adventures = memory
                ? await getAdventuresForMemory(memory.id)
                : [];
              const first = adventures[0];
              if (first) {
                router.replace(`/adventure/${first.id}`);
              } else {
                router.replace("/(tabs)/adventures");
              }
            })();
          }}
        >
          <Text style={styles.primaryText}>Explore Adventure →</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => {
            void (async () => {
              if (memory) await markUnlockSeen(memory.id);
              router.replace("/");
            })();
          }}
        >
          <Text style={styles.secondaryText}>Maybe Later</Text>
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
    alignItems: "center",
    gap: 10,
  },
  party: { fontSize: 36 },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.lavenderInk,
  },
  emoji: { fontSize: 64, marginVertical: 8 },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: colors.navy,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 12,
  },
  primary: {
    alignSelf: "stretch",
    backgroundColor: colors.orange,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
  secondary: {
    alignSelf: "stretch",
    backgroundColor: colors.mossSoft,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.mossDeep,
  },
});
