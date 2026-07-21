import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MagicalBackground, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii, space } from "@/constants/theme";
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
      <MagicalBackground variant="celebration">
        <View style={styles.center}>
          <Text style={styles.body}>Loading adventure…</Text>
        </View>
      </MagicalBackground>
    );
  }

  return (
    <MagicalBackground variant="celebration">
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <PlayfulPressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.back}>← Back</Text>
        </PlayfulPressable>

        <SoftCard tint="coral" float style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.eyebrow}>
              From your {adventure.objectName} discovery
            </Text>
            <Text style={styles.title}>{adventure.title}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>
                {adventure.status.replace("_", " ")} · {adventure.points} pts
              </Text>
            </View>
            <Text style={styles.body}>
              This activity is about your {adventure.objectName} discovery —
              chosen for your child's age and learning goals, never a random
              quiz.
            </Text>

            {adventure.status !== "completed" ? (
              <PlayfulPressable
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
                <Text style={styles.buttonText}>🎉 Mark Complete</Text>
              </PlayfulPressable>
            ) : (
              <View style={styles.done}>
                <Text style={styles.buttonText}>✓ Completed</Text>
              </View>
            )}
          </View>
        </SoftCard>

        <PlayfulPressable
          style={styles.link}
          onPress={() => router.push(`/(tabs)/adventure-book`)}
        >
          <Text style={styles.linkText}>View in Adventure Book</Text>
        </PlayfulPressable>
      </View>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space.screen,
    gap: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  back: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.grassDeep,
  },
  card: {
    marginTop: 4,
  },
  cardInner: {
    padding: 22,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.coralDeep,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.navy,
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.sunshine,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 4,
  },
  statusText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.navy,
    textTransform: "capitalize",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.navySoft,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.coral,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
  },
  done: {
    marginTop: 16,
    backgroundColor: colors.grassDeep,
    borderRadius: radii.pill,
    paddingVertical: 16,
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
    color: colors.grassDeep,
  },
});
