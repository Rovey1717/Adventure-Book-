import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

/**
 * Celebration after a real-world Memory is saved.
 * Adventures unlock from this capture — Library search never reaches here.
 */
export default function CelebrateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memories, lastCapture, celebrateMemory, adventureBoard } = useApp();

  const memory = useMemo(
    () => memories.find((item) => item.id === id) ?? lastCapture?.memory ?? null,
    [id, lastCapture?.memory, memories],
  );

  const unlockedCount =
    lastCapture?.memory.id === id
      ? lastCapture.adventures.length
      : adventureBoard.recentlyUnlocked.filter(
          (item) => item.memoryId === id,
        ).length;

  const firstAdventureId =
    lastCapture?.memory.id === id
      ? lastCapture.adventures[0]?.id
      : adventureBoard.recentlyUnlocked.find((item) => item.memoryId === id)?.id;

  const markCelebrated = async () => {
    if (memory) await celebrateMemory(memory.id);
  };

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
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <Text style={styles.party}>🎉</Text>
        <Text style={styles.eyebrow}>You discovered...</Text>
        <Text style={styles.title}>{memory?.objectName ?? "Discovery"}</Text>
        <Text style={styles.body}>
          {unlockedCount > 0
            ? `Adventure unlocked! ${unlockedCount} learning adventure${unlockedCount === 1 ? "" : "s"} ready to explore.`
            : "Saved forever in Adventure Book."}
        </Text>

        <Pressable
          style={styles.primary}
          onPress={() => {
            void (async () => {
              await markCelebrated();
              if (firstAdventureId) {
                router.replace(`/adventure/${firstAdventureId}`);
              } else {
                router.replace("/(tabs)/adventures");
              }
            })();
          }}
        >
          <Text style={styles.primaryText}>Continue Adventure</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => {
            void (async () => {
              await markCelebrated();
              router.replace("/");
            })();
          }}
        >
          <Text style={styles.secondaryText}>Keep Exploring</Text>
        </Pressable>

        <Pressable
          style={styles.tertiary}
          onPress={() => {
            void (async () => {
              await markCelebrated();
              router.replace("/(tabs)/adventure-book");
            })();
          }}
        >
          <Text style={styles.tertiaryText}>View Adventure Book</Text>
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
    gap: 14,
  },
  party: {
    fontSize: 40,
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
    fontSize: 48,
    lineHeight: 54,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    marginBottom: 8,
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
    backgroundColor: colors.moss,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
  tertiary: {
    backgroundColor: colors.mossSoft,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  tertiaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.mossDeep,
  },
});
