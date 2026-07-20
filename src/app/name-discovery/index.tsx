import { useCallback, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProcessingOverlay } from "@/components/discover/ProcessingOverlay";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import type { LibraryCategoryId, LibraryEntry } from "@/domain/library/types";
import type { MemoryCategory } from "@/domain/shared/categories";

function libraryCategoryToMemory(
  id: LibraryCategoryId,
): MemoryCategory {
  switch (id) {
    case "animals":
      return "animals";
    case "vehicles":
      return "vehicles";
    case "ocean":
      return "ocean";
    case "food":
      return "food";
    case "construction":
      return "construction";
    case "nature":
      return "nature";
    default:
      return "other";
  }
}

/**
 * MVP naming step after photo capture.
 * Flow stays: capture → name → save. A future RecognitionService can prefill
 * `pendingDiscovery.suggestedName` without changing this screen's Continue path.
 */
export default function NameDiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    pendingDiscovery,
    isProcessing,
    library,
    confirmNamedDiscovery,
    clearPendingDiscovery,
  } = useApp();

  const [name, setName] = useState(pendingDiscovery?.suggestedName ?? "");
  const [category, setCategory] = useState<MemoryCategory | undefined>();

  const suggestions = useMemo(() => {
    const trimmed = name.trim();
    if (trimmed.length < 1) return [] as LibraryEntry[];
    return library.search(trimmed).slice(0, 6);
  }, [library, name]);

  const goCelebrate = useCallback(
    (memoryId: string) => {
      router.replace(`/celebrate/${memoryId}`);
    },
    [router],
  );

  const onRetake = useCallback(() => {
    clearPendingDiscovery();
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, [clearPendingDiscovery, router]);

  const onContinue = useCallback(async () => {
    const objectName = name.trim();
    if (!objectName) return;
    const result = await confirmNamedDiscovery({ objectName, category });
    goCelebrate(result.memory.id);
  }, [category, confirmNamedDiscovery, goCelebrate, name]);

  const onPickSuggestion = useCallback((entry: LibraryEntry) => {
    setName(entry.title);
    setCategory(libraryCategoryToMemory(entry.categoryId));
  }, []);

  if (!pendingDiscovery) {
    return (
      <View style={[styles.root, styles.empty]}>
        <Text style={styles.emptyTitle}>No photo yet</Text>
        <Text style={styles.emptyBody}>
          Capture something wonderful on Discover, then name it here.
        </Text>
        <Pressable style={styles.primary} onPress={() => router.replace("/")}>
          <Text style={styles.primaryText}>Back to Camera</Text>
        </Pressable>
      </View>
    );
  }

  const canContinue = name.trim().length > 0;
  const showPreview =
    pendingDiscovery.mediaUri &&
    !pendingDiscovery.mediaUri.startsWith("mock-");

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.skyTop, "#FFE7B8", colors.skyBottom]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 28,
            },
          ]}
        >
          <Text style={styles.eyebrow}>New discovery</Text>
          <Text style={styles.title}>Name Your Discovery</Text>
          <Text style={styles.support}>
            Tell Adventure Book what you found — then adventures unlock from
            that name.
          </Text>

          {showPreview ? (
            <Image
              source={{ uri: pendingDiscovery.mediaUri }}
              style={styles.preview}
              accessibilityLabel="Captured discovery photo"
            />
          ) : (
            <View style={styles.previewFallback}>
              <Text style={styles.previewHint}>Your photo is ready</Text>
            </View>
          )}

          <Text style={styles.label}>What did you discover?</Text>
          <TextInput
            value={name}
            onChangeText={(next) => {
              setName(next);
              setCategory(undefined);
            }}
            placeholder="e.g. Turtle, Fire Truck, Tree…"
            placeholderTextColor={colors.inkSoft}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (canContinue) void onContinue();
            }}
            accessibilityLabel="What did you discover?"
          />

          {suggestions.length > 0 ? (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>From the Library</Text>
              {suggestions.map((entry) => (
                <Pressable
                  key={entry.id}
                  style={styles.suggestionRow}
                  onPress={() => onPickSuggestion(entry)}
                >
                  <Text style={styles.suggestionTitle}>{entry.title}</Text>
                  <Text style={styles.suggestionMeta}>
                    {entry.pronunciation}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            style={[styles.primary, !canContinue && styles.primaryDisabled]}
            disabled={!canContinue || isProcessing}
            onPress={() => {
              void onContinue();
            }}
          >
            <Text style={styles.primaryText}>Continue</Text>
          </Pressable>

          <Pressable
            style={styles.secondary}
            disabled={isProcessing}
            onPress={onRetake}
          >
            <Text style={styles.secondaryText}>Retake Photo</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <ProcessingOverlay
        visible={isProcessing}
        message="Saving your discovery…"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyMid,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: space.lg,
    gap: 12,
  },
  eyebrow: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.moss,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
  },
  support: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    marginBottom: 4,
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
  },
  previewFallback: {
    height: 180,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  previewHint: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.inkMuted,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
    marginTop: 8,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  suggestions: {
    gap: 8,
    marginTop: 4,
  },
  suggestionsLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.inkSoft,
  },
  suggestionRow: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    gap: 2,
  },
  suggestionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.ink,
  },
  suggestionMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
  },
  primary: {
    backgroundColor: colors.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  primaryDisabled: {
    opacity: 0.45,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.surfaceRaised,
  },
  secondary: {
    backgroundColor: colors.mossSoft,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.mossDeep,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
    textAlign: "center",
    marginBottom: 8,
  },
});
