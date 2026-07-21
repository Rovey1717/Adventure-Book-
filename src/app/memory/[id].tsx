import { useCallback, useEffect, useMemo, useState } from "react";
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
import { MagicalBackground, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { buildAdventureEntry } from "@/domain/adventure-book/adventureEntry";
import type { Memory } from "@/domain/memory/types";
import { CO_EXPLORER_OPTIONS } from "@/domain/onboarding/types";
import { accentForCategory } from "@/domain/shared/categories";
import { useFamilyAIProfile } from "@/hooks/useFamilyAIProfile";

/**
 * Adventure Entry page — a collectible storybook chapter for one memory.
 */
export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getMemory, memories, toggleFavorite, openLearningFromBook } =
    useApp();
  const { profile } = useFamilyAIProfile();
  const [memory, setMemory] = useState<Memory | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setMemory(await getMemory(id));
  }, [getMemory, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const coExplorerLabel = useMemo(() => {
    if (profile.coExplorers.length === 0) return "family";
    return (
      profile.coExplorers
        .map(
          (role) =>
            CO_EXPLORER_OPTIONS.find((option) => option.id === role)?.label ??
            role,
        )
        .join(" & ") || "family"
    );
  }, [profile.coExplorers]);

  const entry = useMemo(() => {
    if (!memory) return null;
    return buildAdventureEntry(memory, {
      childName: profile.childName,
      childAge: profile.currentAge,
      coExplorerLabel,
      allMemories: memories.length > 0 ? memories : [memory],
    });
  }, [memory, memories, profile.childName, profile.currentAge, coExplorerLabel]);

  if (!memory || !entry) {
    return (
      <MagicalBackground variant="cream">
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Opening this adventure…</Text>
        </View>
      </MagicalBackground>
    );
  }

  const accent = accentForCategory(memory.category);
  const showPhoto =
    !!memory.photoUri && !memory.photoUri.startsWith("mock-");

  return (
    <MagicalBackground variant="cream" decorated={false}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 36,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>
          <LinearGradient
            colors={[accent, colors.cream]}
            style={StyleSheet.absoluteFill}
          />
          <PlayfulPressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back to book</Text>
          </PlayfulPressable>

          {showPhoto ? (
            <Image source={{ uri: memory.photoUri! }} style={styles.heroPhoto} />
          ) : (
            <View style={[styles.heroGlyphWrap, { backgroundColor: accent }]}>
              <Text style={styles.heroGlyph}>{memory.objectName.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔎 {entry.discoveryBadge}</Text>
            </View>
            {entry.adventureBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🗺 {entry.adventureBadge}</Text>
              </View>
            ) : null}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                ⭐ Explorer Level {entry.explorerLevel}
              </Text>
            </View>
            {entry.childAge != null ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Age {entry.childAge}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.storyTitle}>{entry.storyTitle}</Text>
          <Text style={styles.dateLine}>
            {entry.dateLabel}
            {entry.locationLabel ? ` · ${entry.locationLabel}` : ""}
          </Text>
        </View>

        <View style={styles.body}>
          <SoftCard tint="yellow" shimmer>
            <View style={styles.block}>
              <Text style={styles.blockEyebrow}>📖 Family AI story</Text>
              <Text style={styles.storyBody}>{entry.storyBody}</Text>
            </View>
          </SoftCard>

          <SoftCard tint="coral">
            <View style={styles.block}>
              <Text style={styles.blockEyebrow}>💛 Family moment</Text>
              <Text style={styles.blockBody}>{entry.familyMoment}</Text>
            </View>
          </SoftCard>

          <SoftCard tint="blue">
            <View style={styles.block}>
              <Text style={styles.blockEyebrow}>📚 Things learned</Text>
              {entry.thingsLearned.map((item) => (
                <Text key={item} style={styles.bullet}>
                  · {item}
                </Text>
              ))}
            </View>
          </SoftCard>

          <SoftCard tint="green">
            <View style={styles.block}>
              <Text style={styles.blockEyebrow}>🌱 Curiosity seeds planted</Text>
              <Text style={styles.blockBody}>
                Future journeys waiting to bloom:
              </Text>
              {entry.curiositySeeds.map((seed) => (
                <Text key={seed} style={styles.bullet}>
                  · {seed}
                </Text>
              ))}
            </View>
          </SoftCard>

          {entry.collectionTitle ? (
            <SoftCard tint="lavender">
              <View style={styles.block}>
                <Text style={styles.blockEyebrow}>🏆 Collection</Text>
                <Text style={styles.blockBody}>
                  {entry.collectionTitle}
                  {entry.collectionProgressLabel
                    ? ` · ${entry.collectionProgressLabel}`
                    : ""}
                </Text>
              </View>
            </SoftCard>
          ) : null}

          {entry.celebrations.length > 0 ? (
            <SoftCard tint="aqua">
              <View style={styles.block}>
                <Text style={styles.blockEyebrow}>✨ Celebrations</Text>
                {entry.celebrations.map((item) => (
                  <Text key={item} style={styles.bullet}>
                    {item}
                  </Text>
                ))}
              </View>
            </SoftCard>
          ) : null}

          <PlayfulPressable
            style={styles.primary}
            onPress={() => router.push(openLearningFromBook(memory.id))}
          >
            <Text style={styles.primaryText}>
              {memory.learningViewStatus === "never_viewed"
                ? "🎉 Celebrate & continue learning"
                : "Open this discovery’s Learning Journey"}
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
              {memory.isFavorite
                ? "♥ Kept as a treasured page"
                : "♡ Mark as treasured"}
            </Text>
          </PlayfulPressable>
        </View>
      </ScrollView>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkMuted,
  },
  hero: {
    paddingHorizontal: space.screen,
    paddingBottom: 28,
    gap: 10,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    overflow: "hidden",
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  heroPhoto: {
    width: "100%",
    height: 240,
    borderRadius: radii.xxl,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.7)",
  },
  heroGlyphWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8,
  },
  heroGlyph: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: colors.cameraInk,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.navy,
  },
  storyTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: colors.navy,
  },
  dateLine: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.inkMuted,
  },
  body: {
    paddingHorizontal: space.screen,
    paddingTop: 18,
    gap: 14,
  },
  block: {
    padding: 18,
    gap: 8,
  },
  blockEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.inkSoft,
  },
  storyBody: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.navy,
  },
  blockBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.inkMuted,
  },
  bullet: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 23,
    color: colors.navy,
  },
  primary: {
    backgroundColor: colors.coral,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.cameraInk,
  },
  favorite: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.pastelPink,
  },
  favoriteText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.navy,
  },
});
