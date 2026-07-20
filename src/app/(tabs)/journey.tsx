import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
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

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { journey, refresh } = useApp();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const snapshot = journey;

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
          <StatCard label="Day streak" value={snapshot?.streakDays ?? 0} />
          <StatCard
            label="Discoveries"
            value={snapshot?.totalDiscoveries ?? 0}
          />
          <StatCard
            label="Animals"
            value={snapshot?.animalsDiscovered ?? 0}
          />
          <StatCard
            label="Vehicles"
            value={snapshot?.vehiclesDiscovered ?? 0}
          />
          <StatCard label="Plants" value={snapshot?.plantsDiscovered ?? 0} />
          <StatCard
            label="Learning"
            value={`${Math.round((snapshot?.learningProgress ?? 0) * 100)}%`}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Weekly goal</Text>
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
          <Text style={styles.panelTitle}>Badges earned</Text>
          {(snapshot?.badges.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>Earn your first badge by discovering something outside.</Text>
          ) : (
            snapshot?.badges.map((badge) => (
              <Text key={badge.id} style={styles.badge}>
                {badge.title}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Collections</Text>
          {(snapshot?.collections.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>Collections grow as you explore.</Text>
          ) : (
            snapshot?.collections.map((collection) => (
              <Text key={collection.id} style={styles.badge}>
                {collection.title}: {collection.count}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Upcoming adventures</Text>
          {(snapshot?.upcomingAdventures.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>Unlock adventures from Discover.</Text>
          ) : (
            snapshot?.upcomingAdventures.map((adventure) => (
              <Text key={adventure.id} style={styles.badge}>
                {adventure.title}
              </Text>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Favorite memories</Text>
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
          <Text style={styles.panelTitle}>Recently completed</Text>
          {(snapshot?.recentlyCompletedAdventures.length ?? 0) === 0 ? (
            <Text style={styles.panelBody}>Complete an adventure to fill this list.</Text>
          ) : (
            snapshot?.recentlyCompletedAdventures.map((adventure) => (
              <Text key={adventure.id} style={styles.badge}>
                {adventure.title}
              </Text>
            ))
          )}
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
});
