import { useCallback, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlayfulPressable } from "@/components/ui";
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
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 32,
        flexGrow: 1,
      }}
    >
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <LinearGradient
          colors={[accent, colors.cream]}
          style={StyleSheet.absoluteFill}
        />
        <PlayfulPressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </PlayfulPressable>
        {showPhoto ? (
          <Image source={{ uri: memory.photoUri! }} style={styles.heroPhoto} />
        ) : (
          <View style={styles.heroGlyphWrap}>
            <Text style={styles.heroGlyph}>{memory.objectName.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.heroTitle}>{memory.objectName}</Text>
        <View style={styles.heroMetaPill}>
          <Text style={styles.heroMeta}>{statusLabel}</Text>
        </View>
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

        <PlayfulPressable
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
        </PlayfulPressable>

        <PlayfulPressable
          style={styles.favorite}
          onPress={() => {
            void (async () => {
              await toggleFavorite(memory.id);
              await load();
            })();
          }}
        >
          <Text style={styles.favoriteText}>
            {memory.isFavorite ? "♥ Favorited" : "♡ Add to Favorites"}
          </Text>
        </PlayfulPressable>

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
    paddingBottom: 32,
    gap: 8,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    overflow: "hidden",
  },
  heroPhoto: {
    width: "100%",
    height: 220,
    borderRadius: radii.xxl,
    marginTop: 8,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  heroGlyphWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    alignSelf: "center",
  },
  heroGlyph: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.navy,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.navy,
    textAlign: "center",
  },
  heroMetaPill: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroMeta: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.navySoft,
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
    backgroundColor: colors.coral,
    borderRadius: radii.pill,
    paddingVertical: 17,
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
    backgroundColor: colors.pastelPink,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radii.pill,
    marginVertical: 10,
  },
  favoriteText: {
    fontFamily: fonts.bodyBold,
    color: colors.coralDeep,
  },
  section: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
    marginTop: 16,
  },
});
