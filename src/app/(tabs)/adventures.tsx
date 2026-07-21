import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MagicalBackground, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { Adventure, AdventureKind } from "@/domain/adventure/types";

const KIND_EMOJI: Record<AdventureKind, string> = {
  language: "🗣️",
  video: "🎬",
  quiz: "❓",
  draw: "🎨",
  seek: "🔍",
  habitat: "🏡",
  sound: "🔊",
  count: "🔢",
};

const STATUS_ACCENT: Record<Adventure["status"], string> = {
  unlocked: colors.skyBlue,
  in_progress: colors.sunshine,
  completed: colors.grass,
};

type SectionMeta = {
  emoji: string;
  tint: "white" | "blue" | "yellow" | "green" | "coral" | "lavender" | "aqua";
};

function AdventureRow({
  adventure,
  onPress,
  tint,
}: {
  adventure: Adventure;
  onPress: (adventure: Adventure) => void;
  tint: SectionMeta["tint"];
}) {
  const accent = STATUS_ACCENT[adventure.status];
  return (
    <PlayfulPressable
      tilt
      onPress={() => onPress(adventure)}
      accessibilityRole="button"
      accessibilityLabel={`Open adventure ${adventure.title}`}
    >
      <SoftCard tint={tint}>
        <View style={styles.row}>
          <View style={[styles.rowAccent, { backgroundColor: accent }]} />
          <View style={styles.rowKindBadge}>
            <Text style={styles.rowKindEmoji}>
              {KIND_EMOJI[adventure.kind]}
            </Text>
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>{adventure.title}</Text>
            <Text style={styles.rowMeta}>
              From {adventure.objectName} ·{" "}
              {adventure.status.replace("_", " ")}
            </Text>
          </View>
          <View style={styles.pointsPill}>
            <Text style={styles.pointsPillText}>⭐ {adventure.points}</Text>
          </View>
        </View>
      </SoftCard>
    </PlayfulPressable>
  );
}

function Section({
  title,
  adventures,
  empty,
  onPress,
  meta,
}: {
  title: string;
  adventures: Adventure[];
  empty: string;
  onPress: (adventure: Adventure) => void;
  meta: SectionMeta;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {meta.emoji} {title}
      </Text>
      {adventures.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.empty}>{empty}</Text>
        </View>
      ) : (
        <View style={styles.rowStack}>
          {adventures.map((adventure) => (
            <AdventureRow
              key={adventure.id}
              adventure={adventure}
              onPress={onPress}
              tint={meta.tint}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Adventures tab — personalized learning unlocked only from real-world Memories.
 * Library search never creates adventures here.
 */
export default function AdventuresScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { adventureBoard, refresh, startAdventure } = useApp();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const openAdventure = async (adventure: Adventure) => {
    if (adventure.status === "unlocked") {
      await startAdventure(adventure.id);
    }
    router.push(`/adventure/${adventure.id}`);
  };

  return (
    <MagicalBackground variant="lavender">
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: space.screen,
          gap: 24,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>🗺️ Adventures</Text>
          <Text style={styles.subheading}>
            Personalized learning unlocked after you capture something in the
            real world. Adventures cannot be created manually.
          </Text>
        </View>

        <Section
          title="Continue Adventure"
          adventures={adventureBoard.continueAdventure}
          empty="🚀 No adventures in progress yet."
          onPress={openAdventure}
          meta={{ emoji: "🚀", tint: "blue" }}
        />
        <Section
          title="New Adventures"
          adventures={adventureBoard.newAdventures}
          empty="🌟 Capture a discovery in Discover to unlock adventures."
          onPress={openAdventure}
          meta={{ emoji: "🎉", tint: "coral" }}
        />
        <Section
          title="Recently Unlocked"
          adventures={adventureBoard.recentlyUnlocked}
          empty="🔓 New unlocks will show up here after a discovery."
          onPress={openAdventure}
          meta={{ emoji: "🔓", tint: "yellow" }}
        />
        <Section
          title="Completed Adventures"
          adventures={adventureBoard.completed}
          empty="🏆 Completed adventures will live here."
          onPress={openAdventure}
          meta={{ emoji: "🏆", tint: "green" }}
        />
        <Section
          title="Suggested Adventures"
          adventures={adventureBoard.suggested}
          empty="💡 Suggestions appear as you unlock more from discoveries."
          onPress={openAdventure}
          meta={{ emoji: "💡", tint: "lavender" }}
        />
      </ScrollView>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  header: {
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
    lineHeight: 22,
    color: colors.inkMuted,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 19,
    color: colors.ink,
  },
  rowStack: {
    gap: 12,
  },
  empty: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.inkMuted,
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: radii.lg,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    padding: 12,
    gap: 12,
  },
  rowAccent: {
    width: 6,
    alignSelf: "stretch",
    minHeight: 44,
    borderRadius: radii.pill,
  },
  rowKindBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowKindEmoji: {
    fontSize: 22,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
    textTransform: "capitalize",
  },
  pointsPill: {
    backgroundColor: colors.pastelYellow,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pointsPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.sunshineDeep,
  },
});
