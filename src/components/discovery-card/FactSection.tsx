import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii, shadows } from "@/constants/theme";

type Props = {
  facts: string[];
  vocabulary?: string[];
};

export function FactSection({ facts, vocabulary = [] }: Props) {
  return (
    <View style={[styles.card, shadows.soft]}>
      <Text style={styles.title}>Fun facts</Text>
      {facts.map((fact) => (
        <View key={fact} style={styles.row}>
          <Text style={styles.bullet}>✦</Text>
          <Text style={styles.fact}>{fact}</Text>
        </View>
      ))}
      {vocabulary.length > 0 ? (
        <View style={styles.vocab}>
          <Text style={styles.vocabLabel}>Vocabulary</Text>
          <Text style={styles.vocabText}>{vocabulary.join(" · ")}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.navy,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  bullet: {
    color: colors.orange,
    fontFamily: fonts.bodyBold,
    marginTop: 2,
  },
  fact: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.navySoft,
  },
  vocab: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    gap: 4,
  },
  vocabLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.navy,
  },
  vocabText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.navySoft,
  },
});
