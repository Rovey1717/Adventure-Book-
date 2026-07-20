import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, fonts } from "@/constants/theme";

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
      <Text style={styles.icon} accessibilityElementsHidden>
        🔎
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder="What would you like to discover today?"
        placeholderTextColor="rgba(22,53,44,0.45)"
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
    backgroundColor: "rgba(255,249,241,0.94)",
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 10,
    minHeight: 52,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mossSoft,
  },
  clearText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.mossDeep,
  },
});
