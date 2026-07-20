import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { Adventure } from "@/domain/adventure/types";
import { adventureRepository } from "@/data/adventure/AdventureRepository";
import { memoryRepository } from "@/data/memory/MemoryRepository";

export default function AdventureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refresh } = useApp();
  const [adventure, setAdventure] = useState<Adventure | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setAdventure(await adventureRepository.getById(id));
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!adventure) {
    return (
      <View style={styles.center}>
        <Text style={styles.body}>Loading adventure…</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
      <Text style={styles.eyebrow}>From your {adventure.objectName} discovery</Text>
      <Text style={styles.title}>{adventure.title}</Text>
      <Text style={styles.body}>
        Status: {adventure.status.replace("_", " ")} · {adventure.points} points
      </Text>
      <Text style={styles.body}>
        Personalized from your real-world Memory. Future AI will tailor these by
        age, interests, season, and learning goals.
      </Text>

      {adventure.status !== "completed" ? (
        <Pressable
          style={styles.button}
          onPress={() => {
            void (async () => {
              await adventureRepository.update(adventure.id, {
                status: "completed",
                completedAt: new Date().toISOString(),
              });
              const refreshed = await adventureRepository.getByMemoryId(
                adventure.memoryId,
              );
              await memoryRepository.update(adventure.memoryId, {
                adventuresCompleted: refreshed.filter(
                  (item) => item.status === "completed",
                ).length,
              });
              await refresh();
              await load();
            })();
          }}
        >
          <Text style={styles.buttonText}>Mark Complete</Text>
        </Pressable>
      ) : (
        <View style={styles.done}>
          <Text style={styles.buttonText}>Completed</Text>
        </View>
      )}

      <Pressable
        style={styles.link}
        onPress={() => router.push(`/(tabs)/adventure-book`)}
      >
        <Text style={styles.linkText}>View in Adventure Book</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: space.screen,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    fontFamily: fonts.bodyBold,
    color: colors.moss,
    marginBottom: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.orange,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  done: {
    marginTop: 16,
    backgroundColor: colors.moss,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.surfaceRaised,
  },
  link: {
    marginTop: 8,
    alignItems: "center",
    padding: 12,
  },
  linkText: {
    fontFamily: fonts.bodyBold,
    color: colors.moss,
  },
});
