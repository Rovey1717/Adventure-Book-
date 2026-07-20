import { useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { Adventure } from "@/domain/adventure/types";

function Section({
  title,
  adventures,
  empty,
  onPress,
}: {
  title: string;
  adventures: Adventure[];
  empty: string;
  onPress: (adventure: Adventure) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {adventures.length === 0 ? (
        <Text style={styles.empty}>{empty}</Text>
      ) : (
        adventures.map((adventure) => (
          <Pressable
            key={adventure.id}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => onPress(adventure)}
          >
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{adventure.title}</Text>
              <Text style={styles.rowMeta}>
                {adventure.objectName} · {adventure.status.replace("_", " ")} ·{" "}
                {adventure.points} pts
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

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
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: space.screen,
        gap: 22,
      }}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>Adventures</Text>
        <Text style={styles.subheading}>
          Learning begins after discovery — unlocked from what you find outside.
        </Text>
      </View>

      <Section
        title="Continue Adventure"
        adventures={adventureBoard.continueAdventure}
        empty="No adventures in progress yet."
        onPress={openAdventure}
      />
      <Section
        title="Recently Unlocked"
        adventures={adventureBoard.recentlyUnlocked}
        empty="Discover something to unlock adventures."
        onPress={openAdventure}
      />
      <Section
        title="Unlocked Adventures"
        adventures={adventureBoard.unlocked}
        empty="All clear — go explore!"
        onPress={openAdventure}
      />
      <Section
        title="Suggested Adventures"
        adventures={adventureBoard.suggested}
        empty="Suggestions appear as you unlock more."
        onPress={openAdventure}
      />
      <Section
        title="Completed Adventures"
        adventures={adventureBoard.completed}
        empty="Completed adventures will live here."
        onPress={openAdventure}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
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
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.ink,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
  },
  row: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  pressed: {
    opacity: 0.88,
  },
  rowCopy: {
    gap: 4,
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
});
