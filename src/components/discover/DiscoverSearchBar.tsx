import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, fonts, radii } from "@/constants/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
};

/**
 * Journey B entry point on Discover — search opens Library learning,
 * never creates Adventure Book memories.
 */
export function DiscoverSearchBar({
  value,
  onChangeText,
  onClear,
  onFocus,
}: Props) {
  const showClear = useMemo(() => value.length > 0, [value.length]);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconBubble}>
        <Text style={styles.icon} accessibilityElementsHidden>
          🔎
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder="What would you like to discover today?"
        placeholderTextColor="rgba(26,43,74,0.4)"
        style={styles.input}
        autoCapitalize="words"
        autoCorrect
        returnKeyType="search"
        accessibilityLabel="What would you like to discover today?"
      />
      {showClear ? (
        <Pressable
          onPress={onClear}
          hitSlop={10}
          style={styles.clear}
          accessibilityLabel="Clear search"
        >
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.pill,
    paddingLeft: 8,
    paddingRight: 8,
    minHeight: 56,
    gap: 10,
    borderWidth: 2,
    borderColor: "rgba(77,183,245,0.3)",
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pastelBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 12,
  },
  clear: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.pastelBlue,
  },
  clearText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.skyBlue,
  },
});
