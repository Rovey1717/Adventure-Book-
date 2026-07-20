import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

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

  const points = lastCapture?.memory.id === id ? lastCapture.discoveryPoints : 50;
  const badge =
    lastCapture?.memory.id === id ? lastCapture.badgeTitle : "Curious Explorer";

  const firstAdventureId =
    lastCapture?.memory.id === id
      ? lastCapture.adventures[0]?.id
      : adventureBoard.recentlyUnlocked.find((item) => item.memoryId === id)?.id;

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
        <Text style={styles.eyebrow}>You Found...</Text>
        <Text style={styles.title}>{memory?.objectName ?? "Discovery"}</Text>
        <Text style={styles.body}>
          Saved to Adventure Book · {unlockedCount} adventure
          {unlockedCount === 1 ? "" : "s"} unlocked
        </Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>+{points}</Text>
            <Text style={styles.statLabel}>Discovery Points</Text>
          </View>
          {badge ? (
            <View style={styles.stat}>
              <Text style={styles.statValue}>{badge}</Text>
              <Text style={styles.statLabel}>Badge</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          style={styles.primary}
          onPress={() => {
            void (async () => {
              if (memory) await celebrateMemory(memory.id);
              if (router.canGoBack()) router.back();
              else router.replace("/");
            })();
          }}
        >
          <Text style={styles.primaryText}>Celebrate</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => {
            void (async () => {
              if (memory) await celebrateMemory(memory.id);
              if (firstAdventureId) {
                router.replace(`/adventure/${firstAdventureId}`);
              } else {
                router.replace("/adventures");
              }
            })();
          }}
        >
          <Text style={styles.secondaryText}>Start Adventure</Text>
        </Pressable>

        <Pressable
          style={styles.tertiary}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/");
          }}
        >
          <Text style={styles.tertiaryText}>Keep Exploring</Text>
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
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkMuted,
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
