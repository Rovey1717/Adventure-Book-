import { StyleSheet, Text, View } from "react-native";
import { SoftCard } from "@/components/ui";
import { colors, fonts } from "@/constants/theme";
import type { BookSurprise } from "@/domain/adventure-book/surprises";

type Props = {
  surprises: BookSurprise[];
};

/**
 * Gentle Family AI surprises — reconnect old memories.
 */
export function BookSurprisesSection({ surprises }: Props) {
  if (surprises.length === 0) return null;

  return (
    <SoftCard tint="coral" shimmer>
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>🎁 Surprises from Family AI</Text>
        <Text style={styles.title}>Moments worth remembering again</Text>
        {surprises.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowBody}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </SoftCard>
  );
}

const styles = StyleSheet.create({
  inner: {
    padding: 18,
    gap: 12,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.coralDeep,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.navy,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  emoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.navy,
  },
  rowBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
