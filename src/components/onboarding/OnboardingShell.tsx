import { type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AnimatedProgressBar,
  MagicalBackground,
  PlayfulPressable,
} from "@/components/ui";
import { colors, fonts, radii, space } from "@/constants/theme";

type Props = {
  children: ReactNode;
  /** 0-based question index; null hides the bar (Welcome / Finish). */
  stepIndex?: number | null;
  stepCount?: number;
  title: string;
  subtitle?: string;
  footnote?: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  variant?: "sky" | "cream" | "lavender" | "garden" | "celebration";
};

/**
 * Warm single-question shell — progress, copy, actions.
 * One job per screen; never a dashboard.
 */
export function OnboardingShell({
  children,
  stepIndex = null,
  stepCount = 7,
  title,
  subtitle,
  footnote = "You can change this anytime in Parent.",
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  secondaryLabel,
  onSecondary,
  variant = "sky",
}: Props) {
  const insets = useSafeAreaInsets();
  const progress =
    stepIndex == null ? 0 : ((stepIndex + 1) / stepCount) * 100;

  return (
    <MagicalBackground variant={variant}>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        {stepIndex != null ? (
          <View style={styles.progressBlock}>
            <Text style={styles.progressLabel}>
              {stepIndex + 1} of {stepCount}
            </Text>
            <AnimatedProgressBar
              progress={progress}
              color={colors.skyBlue}
              height={10}
            />
          </View>
        ) : (
          <View style={styles.progressSpacer} />
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.body}>{children}</View>

        <View style={styles.footer}>
          {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
          <PlayfulPressable
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            disabled={primaryDisabled}
            onPress={onPrimary}
            style={[
              styles.primary,
              primaryDisabled && styles.primaryDisabled,
            ]}
          >
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </PlayfulPressable>
          {secondaryLabel && onSecondary ? (
            <PlayfulPressable
              accessibilityRole="button"
              accessibilityLabel={secondaryLabel}
              onPress={onSecondary}
              style={styles.secondary}
            >
              <Text style={styles.secondaryText}>{secondaryLabel}</Text>
            </PlayfulPressable>
          ) : null}
        </View>
      </View>
    </MagicalBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space.screen,
  },
  progressBlock: {
    gap: 8,
    marginBottom: 20,
  },
  progressSpacer: {
    height: 28,
    marginBottom: 12,
  },
  progressLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
  header: {
    gap: 10,
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
    color: colors.inkMuted,
  },
  body: {
    flex: 1,
  },
  footer: {
    gap: 12,
    paddingTop: 12,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.inkSoft,
    textAlign: "center",
  },
  primary: {
    minHeight: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.skyBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  primaryDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.surfaceRaised,
  },
  secondary: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.inkMuted,
  },
});
