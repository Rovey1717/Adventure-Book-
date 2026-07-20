import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, space } from "@/constants/theme";
import { useDiscovery } from "@/context/DiscoveryContext";

export default function CelebrateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { discoveries } = useDiscovery();

  const discovery = useMemo(
    () => discoveries.find((item) => item.id === id) ?? null,
    [discoveries, id],
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.skyTop, "#FFE7B8", colors.skyBottom]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.eyebrow}>Celebration</Text>
        <Text style={styles.title}>
          {discovery ? `${discovery.title}!` : "Discovery!"}
        </Text>
        <Text style={styles.body}>
          You found something real in the world — and made a memory that can last forever.
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Saved to Adventure Book</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <Text style={styles.buttonText}>Back to Discover</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    gap: 16,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.moss,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 50,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 28,
    color: colors.inkMuted,
    maxWidth: 340,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.mossSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 8,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.mossDeep,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
});
