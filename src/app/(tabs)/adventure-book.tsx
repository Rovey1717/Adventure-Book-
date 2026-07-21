import { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdventureEntryCard } from "@/components/adventure-book/AdventureEntryCard";
import { BookCollectionsSection } from "@/components/adventure-book/BookCollectionsSection";
import { BookSurprisesSection } from "@/components/adventure-book/BookSurprisesSection";
import { DiscoveryConstellationSection } from "@/components/adventure-book/DiscoveryConstellationSection";
import { ExplorerPassportSection } from "@/components/adventure-book/ExplorerPassportSection";
import { LifelongTimelineSection } from "@/components/adventure-book/LifelongTimelineSection";
import { MagicalBackground, SoftCard } from "@/components/ui";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import {
  bookCollectionViews,
  buildAdventureEntry,
  lifelongTimeline,
} from "@/domain/adventure-book/adventureEntry";
import { passportStamps } from "@/domain/adventure-book/passport";
import { surprisesForBook } from "@/domain/adventure-book/surprises";
import { CO_EXPLORER_OPTIONS } from "@/domain/onboarding/types";
import { progressiveDisclosureForAge } from "@/domain/ui/progressiveDisclosure";
import { useFamilyAIProfile } from "@/hooks/useFamilyAIProfile";

/**
 * Adventure Book — a living storybook of childhood exploration.
 * Scrapbook · treasure map · passport · museum — never a photo gallery.
 * Layers reveal as the explorer grows (progressive disclosure).
 */
export default function AdventureBookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { memories, refresh } = useApp();
  const { profile } = useFamilyAIProfile();
  const disclosure = useMemo(
    () => progressiveDisclosureForAge(profile.currentAge),
    [profile.currentAge],
  );

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

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

  const entries = useMemo(
    () =>
      memories.map((memory) =>
        buildAdventureEntry(memory, {
          childName: profile.childName,
          childAge: profile.currentAge,
          coExplorerLabel,
          allMemories: memories,
        }),
      ),
    [memories, profile.childName, profile.currentAge, coExplorerLabel],
  );

  const stamps = useMemo(() => passportStamps(memories), [memories]);
  const collections = useMemo(
    () => bookCollectionViews(memories.map((item) => item.objectName)),
    [memories],
  );
  const timeline = useMemo(
    () => lifelongTimeline(memories, profile.currentAge),
    [memories, profile.currentAge],
  );
  const surprises = useMemo(
    () => surprisesForBook(memories, profile.childName),
    [memories, profile.childName],
  );

  const bookIntro =
    disclosure.band === "toddler"
      ? `${profile.childName}'s magical pages of discoveries.`
      : disclosure.band === "early"
        ? `${profile.childName}'s scrapbook of real-world wonders.`
        : `${profile.childName}'s museum of curiosity — scrapbook, passport, and treasure map of every real-world discovery.`;

  return (
    <MagicalBackground variant="lavender">
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>A living storybook</Text>
          <Text style={styles.heading}>📖 Adventure Book</Text>
          <Text style={styles.subheading}>{bookIntro}</Text>
        </View>

        {memories.length === 0 ? (
          <SoftCard tint="yellow" float style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>✨📖✨</Text>
            <Text style={styles.emptyTitle}>Your first page awaits</Text>
            <Text style={styles.emptyBody}>
              Capture something wonderful in Discover. Adventure Book will turn
              it into a story your family keeps forever — not just a photo.
            </Text>
          </SoftCard>
        ) : (
          <>
            {disclosure.showSurprises ? (
              <BookSurprisesSection surprises={surprises} />
            ) : null}

            <Text style={styles.sectionHeading}>
              {disclosure.preferIconsOverText ? "✨ Pages" : "Adventure Entries"}
            </Text>
            {!disclosure.preferIconsOverText ? (
              <Text style={styles.sectionHint}>
                Each page celebrates a moment — collectible, meaningful, forever.
              </Text>
            ) : null}
            {entries.map((entry, index) => (
              <AdventureEntryCard
                key={entry.memoryId}
                entry={entry}
                index={index}
                onPress={() => router.push(`/memory/${entry.memoryId}`)}
              />
            ))}

            {disclosure.showPassport ? (
              <ExplorerPassportSection stamps={stamps} />
            ) : null}
            {disclosure.showCollections ? (
              <BookCollectionsSection collections={collections} />
            ) : null}
            {disclosure.showConstellations ? (
              <DiscoveryConstellationSection memories={memories} />
            ) : null}
            {disclosure.showLifelongTimeline ? (
              <LifelongTimelineSection timeline={timeline} />
            ) : null}

            {disclosure.showLegacyNote ? (
              <SoftCard tint="aqua">
                <View style={styles.legacy}>
                  <Text style={styles.legacyTitle}>Family legacy</Text>
                  <Text style={styles.legacyBody}>
                    Open this book at any age and relive every spark of curiosity.
                    You&apos;re building something priceless — not just saving
                    photos.
                  </Text>
                </View>
              </SoftCard>
            ) : null}
          </>
        )}
      </ScrollView>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.screen,
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 4,
  },
  kicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.lavenderDeep,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
  },
  sectionHeading: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
    marginTop: 8,
  },
  sectionHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: -8,
  },
  emptyCard: {
    alignItems: "center",
    padding: 32,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 24,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
  },
  legacy: {
    padding: 18,
    gap: 8,
  },
  legacyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  legacyBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.inkMuted,
  },
});
