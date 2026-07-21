import { StyleSheet, Text, View } from "react-native";
import { SoftCard } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import type { PassportStamp } from "@/domain/adventure-book/passport";

type Props = {
  stamps: PassportStamp[];
};

/**
 * Explorer Passport — stamps earned from real-world adventures.
 */
export function ExplorerPassportSection({ stamps }: Props) {
  const earned = stamps.filter((s) => s.earned).length;

  return (
    <SoftCard tint="lavender">
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>🛂 Explorer Passport</Text>
        <Text style={styles.title}>Stamps from the real world</Text>
        <Text style={styles.body}>
          {earned} of {stamps.length} stamps earned — keep exploring to fill
          your passport.
        </Text>
        <View style={styles.grid}>
          {stamps.map((stamp) => (
            <View
              key={stamp.id}
              style={[styles.stamp, !stamp.earned && styles.stampLocked]}
            >
              <Text style={styles.stampEmoji}>
                {stamp.earned ? stamp.emoji : "⬚"}
              </Text>
              <Text style={styles.stampTitle}>{stamp.title}</Text>
              {!stamp.earned ? (
                <Text style={styles.stampHint}>{stamp.hint}</Text>
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  inner: {
    padding: 18,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.lavenderDeep,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  stamp: {
    width: "30%",
    minWidth: 96,
    flexGrow: 1,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.lavenderDeep,
    backgroundColor: colors.pastelPurple,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  stampLocked: {
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceRaised,
    opacity: 0.72,
  },
  stampEmoji: {
    fontSize: 28,
  },
  stampTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.navy,
    textAlign: "center",
  },
  stampHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkSoft,
    textAlign: "center",
  },
});
