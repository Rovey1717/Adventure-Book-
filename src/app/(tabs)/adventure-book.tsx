import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MagicalBackground,
  PhotoFrame,
  PlayfulPressable,
  SoftCard,
} from "@/components/ui";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { accentForCategory } from "@/domain/shared/categories";
import type { Memory } from "@/domain/memory/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_META: Record<
  Memory["learningViewStatus"],
  { label: string; emoji: string; bg: string; fg: string }
> = {
  completed: {
    label: "Learning completed",
    emoji: "🏆",
    bg: colors.mossSoft,
    fg: colors.mossDeep,
  },
  viewed: {
    label: "Learning started",
    emoji: "📖",
    bg: colors.pastelBlue,
    fg: colors.skyBlue,
  },
  never_viewed: {
    label: "Saved · ready to celebrate",
    emoji: "🎉",
    bg: colors.pastelYellow,
    fg: colors.sunshineDeep,
  },
};

function MemoryCard({
  memory,
  onPress,
  index,
}: {
  memory: Memory;
  onPress: () => void;
  index: number;
}) {
  const accent = accentForCategory(memory.category);
  const status =
    STATUS_META[memory.learningViewStatus] ?? STATUS_META.never_viewed;

  return (
    <PlayfulPressable
      tilt
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open memory of ${memory.objectName}`}
    >
      <SoftCard
        tint="white"
        enterDelay={Math.min(index * 70, 420)}
        style={styles.card}
      >
        <PhotoFrame
          uri={memory.photoUri}
          borderColor={accent}
          height={170}
          style={styles.photoFrame}
        >
          <View style={[styles.photoFallback, { backgroundColor: accent }]}>
            <Text style={styles.photoGlyph}>
              {memory.objectName.charAt(0)}
            </Text>
          </View>
        </PhotoFrame>
        <View style={styles.copy}>
          <Text style={styles.objectName}>{memory.objectName}</Text>
          <Text style={styles.meta}>📅 {formatDate(memory.discoveredAt)}</Text>
          {memory.locationLabel ? (
            <Text style={styles.meta}>📍 {memory.locationLabel}</Text>
          ) : null}

          <View style={styles.pillRow}>
            <View
              style={[styles.statusPill, { backgroundColor: status.bg }]}
            >
              <Text style={[styles.statusPillText, { color: status.fg }]}>
                {status.emoji} {status.label}
              </Text>
            </View>
            {memory.isFavorite ? (
              <View style={styles.favoritePill}>
                <Text style={styles.favoritePillText}>★ Favorite</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.notes}>
            {memory.notes?.trim() ? memory.notes : "Notes · coming soon"}
          </Text>
        </View>
      </SoftCard>
    </PlayfulPressable>
  );
}

/**
 * Adventure Book tab — family memory book.
 * Only capture creates memories; Library knowledge never appears here.
 */
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
    <MagicalBackground variant="cream">
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.header}>
          <Text style={styles.heading}>📖 Adventure Book</Text>
          <Text style={styles.subheading}>
            Every real-world discovery — celebrate now or come back anytime
          </Text>
        </View>

        {data.length === 0 ? (
          <View style={styles.empty}>
            <SoftCard tint="yellow" float style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📸✨</Text>
              <Text style={styles.emptyTitle}>No memories yet!</Text>
              <Text style={styles.emptyBody}>
                Take a picture in Discover. It saves here immediately — even if
                you keep exploring.
              </Text>
            </SoftCard>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + 40 },
            ]}
            renderItem={({ item, index }) => (
              <MemoryCard
                memory={item}
                index={index}
                onPress={() => router.push(`/memory/${item.id}`)}
              />
            )}
          />
        )}
      </View>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
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
    gap: 18,
  },
  card: {
    padding: 14,
    gap: 0,
  },
  photoFrame: {
    marginBottom: 4,
  },
  photoFallback: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  photoGlyph: {
    fontFamily: fonts.display,
    fontSize: 60,
    color: "rgba(255,255,255,0.92)",
  },
  copy: {
    paddingTop: 14,
    paddingHorizontal: 4,
    gap: 5,
  },
  objectName: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.inkMuted,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  statusPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  favoritePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.orangeSoft,
  },
  favoritePillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.orangeDeep,
  },
  notes: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: 10,
    fontStyle: "italic",
  },
  empty: {
    paddingHorizontal: space.screen,
    paddingTop: 24,
  },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 24,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
