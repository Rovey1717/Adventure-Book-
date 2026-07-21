import { StyleSheet, Text, View } from "react-native";
import { AdventureBanner } from "@/components/discovery-card/AdventureBanner";
import { AnimatedProgressBar, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import {
  adventureJourneySummary,
  type AdventureJourneyStep,
} from "@/domain/discovery-card/adventureJourneyPath";
import type { Adventure } from "@/domain/adventure/types";

type Props = {
  discoveryTitle: string;
  path: AdventureJourneyStep[];
  adventures: Adventure[];
  discovered: boolean;
  onStartPrimary: () => void;
  onOpenAdventure: (id: string) => void;
  onSelectPathStep?: (step: AdventureJourneyStep) => void;
};

/**
 * 🗺 Adventures — structured progression, then concrete quests from the board.
 */
export function DiscoveryCardAdventuresSection({
  discoveryTitle,
  path,
  adventures,
  discovered,
  onStartPrimary,
  onOpenAdventure,
  onSelectPathStep,
}: Props) {
  const summary = adventureJourneySummary(path);

  return (
    <View style={styles.stack}>
      <SoftCard tint="green">
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>🗺 Adventures</Text>
          <Text style={styles.title}>{discoveryTitle} Adventure</Text>
          <Text style={styles.body}>
            Real-world quests unlock one after another — find, visit, care, and
            grow. Completing a step opens the next.
          </Text>
          <AnimatedProgressBar progress={summary.progress * 100} />
          <Text style={styles.meta}>
            {summary.completed} of {summary.total} steps
            {summary.current
              ? ` · Next: ${summary.current.title}`
              : " · Adventure complete — keep looping"}
          </Text>
        </View>
      </SoftCard>

      <View style={styles.path}>
        {path.map((step, index) => {
          const isLast = index === path.length - 1;
          const interactive =
            step.status === "available" ||
            step.status === "completed" ||
            step.status === "mastered";

          return (
            <View key={step.id} style={styles.node}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    step.status === "locked" && styles.dotLocked,
                    step.status === "available" && styles.dotAvailable,
                    (step.status === "completed" ||
                      step.status === "mastered") &&
                      styles.dotDone,
                  ]}
                >
                  <Text style={styles.dotGlyph}>
                    {statusGlyph(step.status)}
                  </Text>
                </View>
                {!isLast ? (
                  <View
                    style={[
                      styles.connector,
                      (step.status === "completed" ||
                        step.status === "mastered") &&
                        styles.connectorDone,
                    ]}
                  />
                ) : null}
              </View>

              <PlayfulPressable
                disabled={!interactive}
                onPress={() => onSelectPathStep?.(step)}
                style={[
                  styles.step,
                  step.status === "locked" && styles.stepLocked,
                  step.status === "available" && styles.stepAvailable,
                  (step.status === "completed" ||
                    step.status === "mastered") &&
                    styles.stepDone,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !interactive }}
                accessibilityLabel={`${step.title}, ${step.status}`}
              >
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </PlayfulPressable>
            </View>
          );
        })}
      </View>

      <AdventureBanner
        objectName={discoveryTitle}
        unlocked={discovered}
        onStart={onStartPrimary}
      />

      {adventures.length === 0 ? (
        <SoftCard tint="aqua">
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Discover {discoveryTitle} in the real world to unlock board
              adventures that fill this path.
            </Text>
          </View>
        </SoftCard>
      ) : (
        <>
          <Text style={styles.boardLabel}>Your adventures</Text>
          {adventures.map((adventure) => {
            const progress =
              adventure.status === "completed"
                ? 1
                : adventure.status === "in_progress"
                  ? 0.5
                  : 0.12;
            return (
              <PlayfulPressable
                key={adventure.id}
                onPress={() => onOpenAdventure(adventure.id)}
                style={styles.row}
                accessibilityRole="button"
                accessibilityLabel={adventure.title}
              >
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{adventure.title}</Text>
                  <Text style={styles.rowMeta}>
                    {statusLabel(adventure.status)} · {adventure.kind}
                  </Text>
                  <AnimatedProgressBar progress={progress * 100} />
                </View>
                <Text style={styles.chevron}>›</Text>
              </PlayfulPressable>
            );
          })}
        </>
      )}
    </View>
  );
}

function statusGlyph(status: AdventureJourneyStep["status"]): string {
  switch (status) {
    case "locked":
      return "🔒";
    case "available":
      return "▶️";
    case "completed":
      return "✅";
    case "mastered":
      return "⭐";
  }
}

function statusLabel(status: Adventure["status"]): string {
  switch (status) {
    case "unlocked":
      return "Ready";
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  intro: {
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.grassDeep,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
  path: {
    gap: 0,
  },
  node: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  rail: {
    width: 36,
    alignItems: "center",
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.stroke,
  },
  dotLocked: {
    opacity: 0.5,
  },
  dotAvailable: {
    borderColor: colors.grassDeep,
    backgroundColor: colors.pastelGreen,
  },
  dotDone: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
  },
  dotGlyph: {
    fontSize: 14,
  },
  connector: {
    flex: 1,
    width: 3,
    minHeight: 16,
    marginVertical: 4,
    borderRadius: 2,
    backgroundColor: colors.stroke,
  },
  connectorDone: {
    backgroundColor: colors.grass,
  },
  step: {
    flex: 1,
    padding: 14,
    marginBottom: 10,
    borderRadius: radii.lg,
    borderWidth: 2,
    backgroundColor: colors.surfaceRaised,
    gap: 4,
  },
  stepLocked: {
    borderColor: colors.stroke,
    opacity: 0.55,
  },
  stepAvailable: {
    borderColor: colors.grassDeep,
    backgroundColor: colors.pastelGreen,
  },
  stepDone: {
    borderColor: colors.grass,
    backgroundColor: colors.pastelGreen,
  },
  stepTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  stepSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  boardLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.navy,
    marginTop: 4,
  },
  empty: {
    padding: 18,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceRaised,
  },
  rowCopy: {
    flex: 1,
    gap: 8,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkMuted,
  },
  chevron: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.inkSoft,
  },
});
