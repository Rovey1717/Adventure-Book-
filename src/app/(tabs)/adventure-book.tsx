import { useCallback, useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { accentForCategory } from "@/domain/shared/categories";
import type { Memory } from "@/domain/memory/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

function MemoryCard({
  memory,
  onPress,
}: {
  memory: Memory;
  onPress: () => void;
}) {
  const accent = accentForCategory(memory.category);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.photo, { backgroundColor: accent }]}>
        <Text style={styles.photoGlyph}>{memory.objectName.charAt(0)}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.objectName}>{memory.objectName}</Text>
        <Text style={styles.meta}>Found {formatDate(memory.discoveredAt)}</Text>
        {memory.locationLabel ? (
          <Text style={styles.meta}>{memory.locationLabel}</Text>
        ) : null}
        <Text style={styles.stats}>
          {memory.discoveryCount} discover
          {memory.discoveryCount === 1 ? "y" : "ies"} ·{" "}
          {memory.adventuresCompleted} adventures completed
        </Text>
        <View style={styles.flags}>
          {memory.isFavorite ? (
            <Text style={styles.flagFavorite}>Favorite</Text>
          ) : null}
          <Text style={styles.flagCelebrate}>
            {memory.celebrationStatus === "celebrated"
              ? "Celebrated"
              : "Ready to celebrate"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function AdventureBookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { memories, refresh } = useApp();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const data = useMemo(() => memories, [memories]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <LinearGradient
        colors={[colors.skyBottom, colors.surface]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <Text style={styles.heading}>Adventure Book</Text>
        <Text style={styles.subheading}>
          Your family's living scrapbook of real-world memories
        </Text>
      </View>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No memories yet</Text>
          <Text style={styles.emptyBody}>
            Capture something outside in Discover — it will appear here as a
            memory card, not a gallery photo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MemoryCard
              memory={item}
              onPress={() => router.push(`/memory/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: space.screen,
    marginBottom: 16,
    gap: 6,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: space.screen,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  pressed: {
    opacity: 0.92,
  },
  photo: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  photoGlyph: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: "rgba(255,255,255,0.92)",
  },
  copy: {
    padding: 16,
    gap: 4,
  },
  objectName: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
  },
  stats: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.moss,
    marginTop: 6,
  },
  flags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  flagFavorite: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.orangeDeep,
    backgroundColor: colors.orangeSoft,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  flagCelebrate: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.mossDeep,
    backgroundColor: colors.mossSoft,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  empty: {
    paddingHorizontal: 32,
    paddingTop: 48,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
