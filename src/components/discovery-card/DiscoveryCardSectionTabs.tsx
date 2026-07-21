import { ScrollView, StyleSheet, Text } from "react-native";
import { PlayfulPressable } from "@/components/ui";
import { colors, fonts, radii } from "@/constants/theme";
import {
  DISCOVERY_CARD_SECTIONS,
  type DiscoveryCardSectionDef,
  type DiscoveryCardSectionId,
} from "@/domain/discovery-card/sections";

type Props = {
  active: DiscoveryCardSectionId;
  onChange: (id: DiscoveryCardSectionId) => void;
  /** Progressive disclosure — only show age-appropriate sections. */
  sections?: DiscoveryCardSectionDef[];
  /** Prefer emoji-only tabs for toddlers. */
  iconsOnly?: boolean;
};

/**
 * Primary section chrome for the lifelong Discovery Card.
 * Independent of section content — new sections register in domain only.
 */
export function DiscoveryCardSectionTabs({
  active,
  onChange,
  sections = [...DISCOVERY_CARD_SECTIONS],
  iconsOnly = false,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {sections.map((section) => {
        const selected = section.id === active;
        return (
          <PlayfulPressable
            key={section.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={section.label}
            onPress={() => onChange(section.id)}
            style={[styles.tab, selected ? styles.tabActive : styles.tabIdle]}
          >
            <Text style={styles.emoji}>{section.emoji}</Text>
            {!iconsOnly ? (
              <Text
                style={[styles.label, selected && styles.labelActive]}
                numberOfLines={1}
              >
                {section.shortLabel}
              </Text>
            ) : null}
          </PlayfulPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 2,
    minHeight: 48,
  },
  tabIdle: {
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceRaised,
  },
  tabActive: {
    borderColor: colors.coral,
    backgroundColor: colors.peach,
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkMuted,
  },
  labelActive: {
    color: colors.navy,
  },
});
