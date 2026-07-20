import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { Adventure } from "@/domain/adventure/types";
import type { Memory } from "@/domain/memory/types";
import { accentForCategory } from "@/domain/shared/categories";

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getMemory, getAdventuresForMemory, toggleFavorite } = useApp();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [adventures, setAdventures] = useState<Adventure[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    const next = await getMemory(id);
    setMemory(next);
    if (next) {
      setAdventures(await getAdventuresForMemory(next.id));
    }
  }, [getAdventuresForMemory, getMemory, id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!memory) {
    return (
      <View style={styles.loading}>
        <Text style={styles.meta}>Loading memory…</Text>
      </View>
    );
  }

  const accent = accentForCategory(memory.category);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View style={[styles.hero, { backgroundColor: accent, paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.heroGlyph}>{memory.objectName.charAt(0)}</Text>
        <Text style={styles.heroTitle}>{memory.objectName}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.meta}>
          Found {new Date(memory.discoveredAt).toLocaleDateString()}
          {memory.locationLabel ? ` · ${memory.locationLabel}` : ""}
        </Text>
        <Text style={styles.meta}>
          Discovered {memory.discoveryCount} time
          {memory.discoveryCount === 1 ? "" : "s"} · {memory.adventuresCompleted}{" "}
          adventures completed
        </Text>

        <Pressable
          style={styles.favorite}
          onPress={() => {
            void (async () => {
              await toggleFavorite(memory.id);
              await load();
            })();
          }}
        >
          <Text style={styles.favoriteText}>
            {memory.isFavorite ? "Favorited" : "Add to Favorites"}
          </Text>
        </Pressable>

        <Text style={styles.section}>Completed adventures</Text>
        {adventures.length === 0 ? (
          <Text style={styles.meta}>No adventures unlocked yet.</Text>
        ) : (
          adventures.map((adventure) => (
            <Text key={adventure.id} style={styles.adventure}>
              {adventure.status === "completed" ? "✓ " : "○ "}
              {adventure.title}
            </Text>
          ))
        )}

        <Text style={styles.section}>Notes</Text>
        <Text style={styles.meta}>
          {memory.notes ?? "Family notes will live here."}
        </Text>

        <Text style={styles.section}>AI story</Text>
        <Text style={styles.meta}>
          {memory.story ?? "A personalized story will appear here in a future update."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    paddingHorizontal: space.screen,
    paddingBottom: 28,
    gap: 8,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    fontFamily: fonts.bodyBold,
    color: colors.surfaceRaised,
  },
  heroGlyph: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: "rgba(255,255,255,0.92)",
    marginTop: 12,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.surfaceRaised,
  },
  body: {
    padding: space.screen,
    gap: 8,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  favorite: {
    alignSelf: "flex-start",
    backgroundColor: colors.orangeSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginVertical: 10,
  },
  favoriteText: {
    fontFamily: fonts.bodyBold,
    color: colors.orangeDeep,
  },
  section: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
    marginTop: 16,
  },
  adventure: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 4,
  },
});
