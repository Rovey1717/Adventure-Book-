import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.skyTop, colors.skyMid, colors.skyBottom]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: space.screen,
          gap: 18,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Journey</Text>
          <Text style={styles.subheading}>
            Progress that grows with every real-world discovery.
          </Text>
        </View>

        <View style={styles.grid}>
          <StatCard
            label="🔥 Current Streak"
            value={snapshot?.streakDays ?? 0}
          />
          <StatCard
            label="🌎 Total Discoveries"
            value={snapshot?.totalDiscoveries ?? 0}
          />
          <StatCard label="+ Animals" value={animalsInGraph} />
          <StatCard
            label="🏡 Garden Progress"
            value={`${garden.percent}%`}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>🏡 Garden Learning Graph</Text>
          <Text style={styles.panelBody}>
            {garden.discovered} / {garden.total} garden discoveries connected
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.min(100, garden.percent)}%` },
              ]}
            />
          </View>
        </View>

        {next ? (
          <Pressable
            style={styles.nextCard}
            onPress={() => router.push(`/library/${next.nodeId}`)}
          >
            <Text style={styles.nextEyebrow}>🌼 Next Recommendation</Text>
            <Text style={styles.nextTitle}>
              {next.emoji} Discover a {next.name}
            </Text>
            <Text style={styles.nextReason}>{next.reason}</Text>
            <Text style={styles.nextFrom}>From {next.fromName}</Text>
          </Pressable>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>🎯 Weekly Goals</Text>
          <Text style={styles.panelBody}>
            {snapshot?.weeklyGoal.current ?? 0} /{" "}
            {snapshot?.weeklyGoal.target ?? 5} discoveries this week
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.min(
                    100,
                    ((snapshot?.weeklyGoal.current ?? 0) /
                      (snapshot?.weeklyGoal.target ?? 5)) *
                      100,
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>🏅 Badges</Text>
          {(snapshot?.badges.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Earn your first badge by discovering something outside.
            </Text>
          ) : (
            snapshot?.badges.map((badge) => (
              <Text key={badge.id} style={styles.badge}>
                {badge.title}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>⭐ Favorite Memories</Text>
          {(snapshot?.favoriteMemories.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Star memories in Adventure Book to see them here.
            </Text>
          ) : (
            snapshot?.favoriteMemories.map((memory) => (
              <Text key={memory.id} style={styles.badge}>
                {memory.objectName}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Collections</Text>
          {(snapshot?.collections.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Collections grow as you explore.
            </Text>
          ) : (
            snapshot?.collections.map((collection) => (
              <Text key={collection.id} style={styles.badge}>
                {collection.title}: {collection.count}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Upcoming Adventures</Text>
          {(snapshot?.upcomingAdventures.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Unlock adventures by capturing real-world discoveries.
            </Text>
          ) : (
            snapshot?.upcomingAdventures.map((adventure) => (
              <Text key={adventure.id} style={styles.badge}>
                {adventure.title}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Recently Completed Adventures</Text>
          {(snapshot?.recentlyCompletedAdventures.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>
              Complete an adventure to fill this list.
            </Text>
          ) : (
            snapshot?.recentlyCompletedAdventures.map((adventure) => (
              <Text key={adventure.id} style={styles.badge}>
                {adventure.title}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Discovery Timeline</Text>
          <Text style={styles.panelBody}>Coming soon</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyMid,
  },
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
    gap: 10,
  },
  stat: {
    width: "48%",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 18,
    padding: 14,
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
  panel: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  panelTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
  },
  panelBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.mossSoft,
    overflow: "hidden",
    marginTop: 4,
  },
  fill: {
    height: "100%",
    backgroundColor: colors.moss,
  },
  badge: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 4,
  },
  nextCard: {
    backgroundColor: colors.pastelGreen,
    borderRadius: radii.xl,
    padding: 18,
    gap: 6,
  },
  nextEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.mossDeep,
  },
  nextTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.navy,
  },
  nextReason: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.navy,
    fontStyle: "italic",
  },
  nextFrom: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.navySoft,
  },
});
