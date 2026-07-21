import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AnimatedProgressBar,
  MagicalBackground,
  PlayfulPressable,
  SoftCard,
} from "@/components/ui";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

type Tint = "white" | "blue" | "yellow" | "green" | "coral" | "lavender" | "aqua";

function StatCard({
  label,
  value,
  tint,
  enterDelay,
}: {
  label: string;
  value: string | number;
  tint: Tint;
  enterDelay: number;
}) {
  return (
    <SoftCard tint={tint} float style={styles.statCard} enterDelay={enterDelay}>
      <View style={styles.statInner}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </SoftCard>
  );
}

function Panel({
  title,
  tint,
  children,
}: {
  title: string;
  tint: Tint;
  children: React.ReactNode;
}) {
  return (
    <SoftCard tint={tint} style={styles.panel}>
      <View style={styles.panelInner}>
        <Text style={styles.panelTitle}>{title}</Text>
        {children}
      </View>
    </SoftCard>
  );
}

function PillList({
  items,
  color,
  background,
}: {
  items: string[];
  color: string;
  background: string;
}) {
  return (
    <View style={styles.pillWrap}>
      {items.map((item) => (
        <View key={item} style={[styles.pill, { backgroundColor: background }]}>
          <Text style={[styles.pillText, { color }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Journey tab — progress home.
 * Motivates continued discovery without mixing memories or encyclopedia content.
 */
export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { journey, refresh, learningGraph, memories } = useApp();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const snapshot = journey;
  const garden = learningGraph.gardenProgress();
  const next = learningGraph.recommendNext();
  const animalsInGraph = memories.filter((item) => {
    const node = learningGraph.getNodeByName(item.objectName);
    return node?.category === "animals";
  }).length;

  const weeklyPercent = Math.min(
    100,
    ((snapshot?.weeklyGoal.current ?? 0) / (snapshot?.weeklyGoal.target ?? 5)) *
      100,
  );

  return (
    <MagicalBackground variant="garden">
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: space.screen,
          gap: 18,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>🌻 Journey</Text>
          <Text style={styles.subheading}>
            Progress that grows with every real-world discovery.
          </Text>
        </View>

        <View style={styles.grid}>
          <StatCard
            label="🔥 Current Streak"
            value={snapshot?.streakDays ?? 0}
            tint="coral"
            enterDelay={0}
          />
          <StatCard
            label="🌎 Total Discoveries"
            value={snapshot?.totalDiscoveries ?? 0}
            tint="blue"
            enterDelay={60}
          />
          <StatCard label="+ Animals" value={animalsInGraph} tint="green" enterDelay={120} />
          <StatCard
            label="🏡 Garden Progress"
            value={`${garden.percent}%`}
            tint="yellow"
            enterDelay={180}
          />
        </View>

        <Panel title="🏡 Garden Learning Graph" tint="green">
          <Text style={styles.panelBody}>
            {garden.discovered} / {garden.total} garden discoveries connected
          </Text>
          <AnimatedProgressBar
            progress={Math.min(100, garden.percent)}
            color={colors.grass}
            style={styles.progressBar}
          />
        </Panel>

        {next ? (
          <PlayfulPressable
            tilt
            onPress={() => router.push(`/library/${next.nodeId}`)}
            accessibilityRole="button"
            accessibilityLabel={`Discover a ${next.name} next`}
          >
            <SoftCard tint="coral" shimmer style={styles.nextCard}>
              <View style={styles.nextInner}>
                <Text style={styles.nextEyebrow}>🌼 Next Recommendation</Text>
                <Text style={styles.nextTitle}>
                  {next.emoji} Discover a {next.name}
                </Text>
                <Text style={styles.nextReason}>{next.reason}</Text>
                <Text style={styles.nextFrom}>From {next.fromName}</Text>
              </View>
            </SoftCard>
          </PlayfulPressable>
        ) : null}

        <Panel title="🎯 Weekly Goals" tint="blue">
          <Text style={styles.panelBody}>
            {snapshot?.weeklyGoal.current ?? 0} /{" "}
            {snapshot?.weeklyGoal.target ?? 5} discoveries this week
          </Text>
          <AnimatedProgressBar
            progress={weeklyPercent}
            color={colors.coral}
            style={styles.progressBar}
          />
        </Panel>

        <Panel title="🏅 Badges" tint="yellow">
          {(snapshot?.badges.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Earn your first badge by discovering something outside.
            </Text>
          ) : (
            <PillList
              items={snapshot!.badges.map((badge) => badge.title)}
              color={colors.sunshineDeep}
              background="rgba(255,255,255,0.7)"
            />
          )}
        </Panel>

        <Panel title="⭐ Favorite Memories" tint="coral">
          {(snapshot?.favoriteMemories.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Star memories in Adventure Book to see them here.
            </Text>
          ) : (
            <PillList
              items={snapshot!.favoriteMemories.map((memory) => memory.objectName)}
              color={colors.coralDeep}
              background="rgba(255,255,255,0.7)"
            />
          )}
        </Panel>

        <Panel title="Collections" tint="aqua">
          {(snapshot?.collections.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Collections grow as you explore.
            </Text>
          ) : (
            <PillList
              items={snapshot!.collections.map(
                (collection) => `${collection.title}: ${collection.count}`,
              )}
              color={colors.aquaDeep}
              background="rgba(255,255,255,0.7)"
            />
          )}
        </Panel>

        <Panel title="Upcoming Adventures" tint="lavender">
          {(snapshot?.upcomingAdventures.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Unlock adventures by capturing real-world discoveries.
            </Text>
          ) : (
            <PillList
              items={snapshot!.upcomingAdventures.map(
                (adventure) => adventure.title,
              )}
              color={colors.lavenderInk}
              background="rgba(255,255,255,0.7)"
            />
          )}
        </Panel>

        <Panel title="Recently Completed Adventures" tint="green">
          {(snapshot?.recentlyCompletedAdventures.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Complete an adventure to fill this list.
            </Text>
          ) : (
            <PillList
              items={snapshot!.recentlyCompletedAdventures.map(
                (adventure) => adventure.title,
              )}
              color={colors.mossDeep}
              background="rgba(255,255,255,0.7)"
            />
          )}
        </Panel>

        <Panel title="Discovery Timeline" tint="white">
          <Text style={styles.panelBody}>🗺️ Coming soon</Text>
        </Panel>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
  },
  statInner: {
    padding: 16,
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  panel: {},
  panelInner: {
    padding: 18,
    gap: 10,
  },
  panelTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 19,
    color: colors.ink,
  },
  panelBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  progressBar: {
    marginTop: 2,
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  pillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  nextCard: {},
  nextInner: {
    padding: 20,
    gap: 6,
  },
  nextEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.coralDeep,
  },
  nextTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  nextReason: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
    fontStyle: "italic",
  },
  nextFrom: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
});
