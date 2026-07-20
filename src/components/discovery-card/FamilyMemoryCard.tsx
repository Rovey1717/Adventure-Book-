import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";
import type { Memory } from "@/domain/memory/types";

type Props = {
  memory: Memory;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Family memory from Adventure Book — never encyclopedia content.
 * Only render when a Memory exists for this object.
 */
export function FamilyMemoryCard({ memory }: Props) {
  const headline =
    memory.story?.trim() ||
    memory.notes?.trim() ||
    `We found a ${memory.objectName} together.`;

  const story =
    memory.story?.trim() ||
    `Saved ${formatDate(memory.discoveredAt)}${
      memory.locationLabel ? ` · ${memory.locationLabel}` : ""
    }. This moment lives in Adventure Book — not in Library.`;

  return (
    <View style={[styles.card, shadows.soft]}>
      <Text style={styles.eyebrow}>Family memory</Text>
      <Text style={styles.title}>{headline}</Text>
      <Text style={styles.story}>{story}</Text>
      <Text style={styles.meta}>
        {formatDate(memory.discoveredAt)}
        {memory.locationLabel ? ` · ${memory.locationLabel}` : ""}
        {memory.isFavorite ? " · ★ Favorite" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.lavender,
    borderRadius: radii.xl,
    padding: 20,
    gap: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.lavenderInk,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    lineHeight: 28,
    color: colors.navy,
  },
  story: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.navySoft,
    fontStyle: "italic",
  },
  meta: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.lavenderInk,
    marginTop: 4,
  },
});
