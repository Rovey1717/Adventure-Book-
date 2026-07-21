import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MagicalBackground,
  PlayfulPressable,
  PulseGlow,
  SoftCard,
  SparkleRow,
} from "@/components/ui";
import { colors, fonts, radii, shadows, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

/**
 * Decision screen after a discovery is permanently saved.
 * Celebrate Now → short celebration → Learning Card
 * Continue Exploring → back to Discover with a lightweight toast
 */
export default function DiscoverySavedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { memories, lastCapture, continueExploring } = useApp();

  const memory = useMemo(
    () => memories.find((item) => item.id === id) ?? lastCapture?.memory ?? null,
    [id, lastCapture?.memory, memories],
  );

  const name = memory?.objectName ?? "Discovery";

  return (
    <MagicalBackground variant="celebration">
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 36,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        <SparkleRow count={5} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Saved to Adventure Book</Text>
        </View>

        <Text style={styles.eyebrow}>Amazing Discovery!</Text>
        <Text style={styles.title}>You found a {name}!</Text>
        <Text style={styles.body}>
          Your discovery has been saved. Would you like to celebrate it now or
          continue exploring?
        </Text>
        <Text style={styles.support}>
          Real life comes first — you can always open this later in Adventure
          Book.
        </Text>

        <SoftCard tint="yellow" float style={styles.heroCard}>
          <View style={styles.heroInner}>
            <Text style={styles.heroEmoji}>🌟</Text>
            <Text style={styles.heroLabel}>Ready to celebrate?</Text>
          </View>
        </SoftCard>

        <PulseGlow color={colors.coral}>
          <PlayfulPressable
            style={styles.primary}
            onPress={() => {
              if (!memory?.id) return;
              router.push({
                pathname: "/learning/[id]",
                params: { id: memory.id, celebrate: "1" },
              });
            }}
          >
            <Text style={styles.primaryText}>🎉 Celebrate Now</Text>
          </PlayfulPressable>
        </PulseGlow>

        <PlayfulPressable
          style={styles.secondary}
          onPress={() => {
            if (!memory) {
              router.replace("/");
              return;
            }
            continueExploring(memory.objectName);
            router.replace("/");
          }}
        >
          <Text style={styles.secondaryText}>Continue Exploring</Text>
        </PlayfulPressable>
      </View>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "center",
    gap: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.pastelGreen,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    marginBottom: 4,
    minHeight: 40,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.grass,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.grassDeep,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.coralDeep,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.inkMuted,
    marginTop: 4,
  },
  support: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  heroCard: {
    marginVertical: 8,
  },
  heroInner: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 6,
  },
  heroEmoji: {
    fontSize: 40,
  },
  heroLabel: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.navy,
  },
  primary: {
    backgroundColor: colors.coral,
    borderRadius: radii.xl,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    minHeight: 56,
    justifyContent: "center",
    ...shadows.float,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.surfaceRaised,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    paddingVertical: 18,
    alignItems: "center",
    minHeight: 56,
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: colors.skyBlue,
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.skyBlue,
  },
});
