import { StyleSheet, Text, View } from "react-native";
import { SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import { constellationNeighbors } from "@/domain/adventure-book/adventureEntry";
import type { Memory } from "@/domain/memory/types";

type Props = {
  memories: Memory[];
};

/**
 * Discovery constellations — knowledge growing like stars.
 */
export function DiscoveryConstellationSection({ memories }: Props) {
  if (memories.length === 0) return null;
  const latest = memories[0]!;
  const neighbors = constellationNeighbors(latest.objectName);
  const found = new Set(memories.map((m) => m.objectName.toLowerCase()));

  return (
    <SoftCard tint="blue">
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>🌌 Discovery Constellation</Text>
        <Text style={styles.title}>
          Stars connected to {latest.objectName}
        </Text>
        <Text style={styles.body}>
          The more you explore, the larger your constellation becomes.
        </Text>
        <View style={styles.chain}>
          <Text style={styles.starLit}>{latest.objectName}</Text>
          {neighbors.map((name) => (
            <View key={name} style={styles.link}>
              <Text style={styles.arrow}>↓</Text>
              <Text
                style={
                  found.has(name.toLowerCase()) ? styles.starLit : styles.starDim
                }
              >
                {found.has(name.toLowerCase()) ? name : `${name} (waiting)`}
              </Text>
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
    color: colors.skyBlue,
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
  chain: {
    gap: 4,
    marginTop: 4,
  },
  link: {
    gap: 2,
  },
  arrow: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkSoft,
    marginLeft: 8,
  },
  starLit: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.navy,
  },
  starDim: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkSoft,
  },
});
