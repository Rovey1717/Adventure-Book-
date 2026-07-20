import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useDiscovery } from "@/context/DiscoveryContext";
import type { Discovery } from "@/domain/discovery/types";

function DiscoveryRow({ item }: { item: Discovery }) {
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.thumb,
          {
            backgroundColor:
              item.mediaType === "video"
                ? "#6B9BD1"
                : item.mediaType === "voice"
                  ? "#C97B63"
                  : colors.moss,
          },
        ]}
      >
        <Text style={styles.thumbText}>{item.title.charAt(0)}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.mediaType} · {item.status}
        </Text>
      </View>
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { discoveries, refresh } = useDiscovery();
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refresh().finally(() => setReady(true));
    }, [refresh]),
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.heading}>Library</Text>
      <Text style={styles.subheading}>Everything you've discovered so far</Text>

      {!ready ? null : discoveries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No discoveries yet</Text>
          <Text style={styles.emptyBody}>
            Head to Discover and capture something from the real world.
          </Text>
        </View>
      ) : (
        <FlatList
          data={discoveries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable>
              <DiscoveryRow item={item} />
            </Pressable>
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
    paddingHorizontal: space.screen,
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
    marginTop: 4,
    marginBottom: 20,
  },
  list: {
    gap: 12,
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.surfaceRaised,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    textTransform: "capitalize",
  },
  empty: {
    marginTop: 48,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
