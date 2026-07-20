import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { Memory } from "@/domain/memory/types";
import { accentForCategory } from "@/domain/shared/categories";

/**
 * Adventure Book memory entry — opens the same Learning Card as Celebrate Now.
 */
export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getMemory, toggleFavorite, openLearningFromBook } = useApp();
  const [memory, setMemory] = useState<Memory | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setMemory(await getMemory(id));
  }, [getMemory, id]);

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
  const showPhoto =
    !!memory.photoUri && !memory.photoUri.startsWith("mock-");
  const statusLabel =
    memory.learningViewStatus === "completed"
      ? "Learning completed"
      : memory.learningViewStatus === "viewed"
        ? "Learning started"
        : "Ready to celebrate";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View
        style={[
          styles.hero,
          { backgroundColor: accent, paddingTop: insets.top + 12 },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        {showPhoto ? (
          <Image source={{ uri: memory.photoUri! }} style={styles.heroPhoto} />
        ) : (
          <Text style={styles.heroGlyph}>{memory.objectName.charAt(0)}</Text>
        )}
        <Text style={styles.heroTitle}>{memory.objectName}</Text>
        <Text style={styles.heroMeta}>{statusLabel}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.meta}>
          Found {new Date(memory.discoveredAt).toLocaleDateString()}
          {memory.locationLabel ? ` · ${memory.locationLabel}` : ""}
        </Text>
        <Text style={styles.meta}>
          Discovered {memory.discoveryCount} time
          {memory.discoveryCount === 1 ? "" : "s"}
        </Text>

        <Pressable
          style={styles.primary}
          onPress={() => {
            router.push(openLearningFromBook(memory.id));
          }}
        >
          <Text style={styles.primaryText}>
            {memory.learningViewStatus === "never_viewed"
              ? "🎉 Celebrate & Learn"
              : "Open Learning Card"}
          </Text>
        </Pressable>

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

        <Text style={styles.section}>Saved status</Text>
        <Text style={styles.meta}>✓ Forever in Adventure Book</Text>
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
  heroPhoto: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginTop: 8,
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
  heroMeta: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
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
  primary: {
    backgroundColor: colors.orange,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
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
});
