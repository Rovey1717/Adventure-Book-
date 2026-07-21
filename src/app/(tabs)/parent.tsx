import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NextMeaningfulExperienceCard } from "@/components/family/NextMeaningfulExperienceCard";
import { MagicalBackground, PlayfulPressable, SoftCard } from "@/components/ui";
import { colors, fonts, radii, space } from "@/constants/theme";
import { LEARNING_MODES } from "@/domain/learning/mode";
import { featuresSummaryLines } from "@/domain/learning/developmentalFeatures";
import { CO_EXPLORER_OPTIONS } from "@/domain/onboarding/types";
import { useFamilyAIProfile } from "@/hooks/useFamilyAIProfile";
import {
  buildNextMeaningfulExperienceInput,
  NextMeaningfulExperienceEngine,
} from "@/intelligence/engines/NextMeaningfulExperienceEngine";

const nextEngine = new NextMeaningfulExperienceEngine();

const MANAGEMENT_SECTIONS = [
  { title: "Learning Goals", meta: "What each child is working toward", emoji: "🎯" },
  {
    title: "Languages",
    meta: "Spanish only when you enable it — never random",
    emoji: "🗣️",
  },
  { title: "Notifications", meta: "Reminders and weekly summaries", emoji: "🔔" },
  { title: "Export Adventure Book", meta: "Share memories with family", emoji: "📤" },
  { title: "Subscription", meta: "Plan and billing", emoji: "💳" },
  { title: "Settings", meta: "Privacy, storage, and preferences", emoji: "⚙️" },
];

/**
 * Parent domain — Family AI profile is structured knowledge (not a chatbot).
 * Editable anytime; drives personalization across the app.
 */
export default function ParentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, mode, definition, features, setMode, clearModeOverride } =
    useFamilyAIProfile();

  const featuresSummary = featuresSummaryLines(features).slice(0, 4).join(" · ");

  const nextMeaningful = useMemo(
    () =>
      nextEngine.recommend(
        buildNextMeaningfulExperienceInput(profile, {
          currentDiscovery: profile.memoryHistory[0]?.objectName ?? null,
        }),
      ),
    [profile],
  );

  const explorers =
    profile.coExplorers.length > 0
      ? profile.coExplorers
          .map(
            (role) =>
              CO_EXPLORER_OPTIONS.find((option) => option.id === role)?.label ??
              role,
          )
          .join(", ")
      : "Family";

  const learningStyleLabels =
    profile.learningStyle.length > 0
      ? profile.learningStyle
          .map((item) => `${item.modality} (${item.strength})`)
          .join(", ")
      : "Not set yet";

  return (
    <MagicalBackground variant="cream" decorated={false}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: space.screen,
          gap: 14,
        }}
      >
        <Text style={styles.title}>👪 Parent</Text>
        <Text style={styles.subtitle}>
          Family AI Profile — structured knowledge that personalizes Adventure
          Book. Not a chatbot.
        </Text>

        <SoftCard tint="yellow">
          <View style={styles.profileInner}>
            <Text style={styles.profileEmoji}>✨</Text>
            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{profile.childName}</Text>
              <Text style={styles.profileMeta}>
                {profile.currentAge} years old
                {profile.birthdate ? ` · Born ${profile.birthdate}` : ""}
              </Text>
              <Text style={styles.profileMeta}>
                {definition.label} · Level {profile.currentLevel}
              </Text>
              <Text style={styles.profileMeta}>Explores with {explorers}</Text>
            </View>
          </View>
        </SoftCard>

        <SoftCard tint="lavender">
          <View style={styles.modeBlock}>
            <Text style={styles.sectionTitle}>Learning mode</Text>
            <Text style={styles.modeSummary}>{definition.summary}</Text>
            <Text style={styles.modeHint}>
              As {profile.childName} grows, parent prompts taper and quizzes,
              challenges, reading, projects, stories, and research unlock
              naturally. You can override the mode anytime.
            </Text>
            {profile.learningModeOverride ? (
              <Text style={styles.modeOverrideNote}>
                Override on — using {definition.label} features (not the age
                curve).
              </Text>
            ) : (
              <Text style={styles.modeOverrideNote}>
                Growing naturally · {featuresSummary}
              </Text>
            )}
            <View style={styles.modeChips}>
              {LEARNING_MODES.map((item) => {
                const active = item.id === mode;
                return (
                  <PlayfulPressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={item.label}
                    onPress={() => setMode(item.id, { override: true })}
                    style={[
                      styles.modeChip,
                      active ? styles.modeChipActive : styles.modeChipIdle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeChipLabel,
                        active && styles.modeChipLabelActive,
                      ]}
                    >
                      {item.shortLabel}
                    </Text>
                    <Text style={styles.modeChipAges}>
                      {item.id === "independent_explorer"
                        ? "Ages 8+"
                        : `Ages ${item.ageMin}–${item.ageMax}`}
                    </Text>
                  </PlayfulPressable>
                );
              })}
            </View>
            {profile.learningModeOverride ? (
              <PlayfulPressable
                accessibilityRole="button"
                accessibilityLabel="Follow age naturally"
                onPress={() => clearModeOverride()}
                style={styles.followAgeBtn}
              >
                <Text style={styles.followAgeText}>
                  Follow age naturally instead
                </Text>
              </PlayfulPressable>
            ) : null}
          </View>
        </SoftCard>

        <NextMeaningfulExperienceCard experience={nextMeaningful} />

        <SoftCard tint="blue">
          <View style={styles.knowledgeBlock}>
            <Text style={styles.sectionTitle}>Family AI knowledge</Text>
            <KnowledgeRow
              label="Interests"
              value={
                profile.interestScores.length > 0
                  ? profile.interestScores
                      .map(
                        (item) =>
                          `${item.category} (${item.score})`,
                      )
                      .join(", ")
                  : profile.interests.length > 0
                    ? profile.interests.join(", ")
                    : "Open to everything"
              }
            />
            <KnowledgeRow
              label="Vocabulary"
              value={
                profile.vocabulary.length > 0
                  ? profile.vocabulary
                      .slice(0, 8)
                      .map((item) => item.word)
                      .join(", ")
                  : "None yet"
              }
            />
            <KnowledgeRow
              label="Favorite discoveries"
              value={
                profile.favoriteDiscoveries.length > 0
                  ? profile.favoriteDiscoveries.join(", ")
                  : "None yet"
              }
            />
            <KnowledgeRow
              label="Favorite adventures"
              value={
                profile.favoriteAdventures.length > 0
                  ? profile.favoriteAdventures.join(", ")
                  : "None yet"
              }
            />
            <KnowledgeRow
              label="Languages"
              value={[
                ...profile.languages,
                ...profile.learningLanguages.map((l) => `learn:${l}`),
              ].join(", ")}
            />
            <KnowledgeRow
              label="Parent goals"
              value={
                profile.parentGoals.length > 0
                  ? profile.parentGoals.join(", ")
                  : "Curiosity first"
              }
            />
            <KnowledgeRow label="Learning style" value={learningStyleLabels} />
            <KnowledgeRow
              label="Attention span"
              value={`${profile.attentionSpan.minutesMin}–${profile.attentionSpan.minutesMax} min · ${profile.attentionSpan.band}`}
            />
            <KnowledgeRow
              label="Mastered"
              value={
                profile.masteredConcepts.length > 0
                  ? `${profile.masteredConcepts.length} concepts`
                  : "None yet"
              }
            />
            <KnowledgeRow
              label="Needs practice"
              value={
                profile.needsPractice.length > 0
                  ? profile.needsPractice.slice(0, 5).join(", ")
                  : "None flagged"
              }
            />
            <KnowledgeRow
              label="Memory timeline"
              value={
                profile.memoryHistory.length > 0
                  ? profile.memoryHistory
                      .slice(0, 4)
                      .map((item) => item.objectName)
                      .join(" → ")
                  : "No discoveries yet"
              }
            />
            <KnowledgeRow
              label="Learning history"
              value={
                profile.learningHistory.length > 0
                  ? profile.learningHistory[0]!.detail
                  : "Waiting for the first discovery"
              }
            />
            <KnowledgeRow
              label="Adventures"
              value={`${profile.adventureProgress.length} tracked`}
            />
            <KnowledgeRow
              label="Collections"
              value={
                profile.collections.length > 0
                  ? profile.collections
                      .map(
                        (item) =>
                          `${item.emoji} ${item.title} ${item.completed}/${item.total}`,
                      )
                      .join(" · ")
                  : "None started"
              }
            />
            <KnowledgeRow
              label="Potential future discoveries"
              value={
                profile.potentialFutureDiscoveries.length > 0
                  ? profile.potentialFutureDiscoveries
                      .slice(0, 5)
                      .map((item) => item.name)
                      .join(", ")
                  : "Discover something to unlock suggestions"
              }
            />
            <Text style={styles.attentionHint}>{profile.attentionSpan.hint}</Text>
          </View>
        </SoftCard>

        <PlayfulPressable
          onPress={() => router.push("/(tabs)/library")}
          accessibilityRole="button"
          accessibilityLabel="Browse Library"
        >
          <SoftCard tint="green">
            <View style={styles.rowInner}>
              <Text style={styles.rowEmoji}>📚</Text>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>Browse Library</Text>
                <Text style={styles.rowMeta}>
                  Universal encyclopedia — never mixed with Adventure Book
                  memories
                </Text>
              </View>
            </View>
          </SoftCard>
        </PlayfulPressable>

        {MANAGEMENT_SECTIONS.map((section) => (
          <SoftCard key={section.title} tint="white" style={styles.rowMuted}>
            <View style={styles.rowInner}>
              <Text style={styles.rowEmojiMuted}>{section.emoji}</Text>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitleMuted}>{section.title}</Text>
                <Text style={styles.rowMeta}>{section.meta} · Coming soon</Text>
              </View>
            </View>
          </SoftCard>
        ))}
      </ScrollView>
    </MagicalBackground>
  );
}

function KnowledgeRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.knowledgeRow}>
      <Text style={styles.knowledgeLabel}>{label}</Text>
      <Text style={styles.knowledgeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkMuted,
    marginBottom: 8,
    lineHeight: 22,
  },
  profileInner: {
    flexDirection: "row",
    gap: 14,
    padding: 18,
  },
  profileEmoji: {
    fontSize: 32,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.ink,
  },
  profileMeta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  modeBlock: {
    padding: 18,
    gap: 12,
  },
  knowledgeBlock: {
    padding: 18,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.ink,
  },
  modeSummary: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
  modeHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkMuted,
  },
  modeOverrideNote: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    lineHeight: 19,
    color: colors.lavenderDeep,
  },
  modeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modeChip: {
    flexGrow: 1,
    minWidth: "30%",
    borderRadius: radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 2,
    alignItems: "center",
    gap: 2,
  },
  modeChipIdle: {
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceRaised,
  },
  modeChipActive: {
    borderColor: colors.lavenderDeep,
    backgroundColor: colors.pastelPurple,
  },
  followAgeBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.stroke,
  },
  followAgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.navy,
  },
  modeChipLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.inkMuted,
  },
  modeChipLabelActive: {
    color: colors.lavenderInk,
  },
  modeChipAges: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.inkSoft,
  },
  knowledgeRow: {
    gap: 2,
  },
  knowledgeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  knowledgeValue: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  attentionHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.skyBlue,
    marginTop: 4,
  },
  rowMuted: {
    opacity: 0.85,
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    minHeight: 48,
  },
  rowEmoji: {
    fontSize: 28,
  },
  rowEmojiMuted: {
    fontSize: 24,
    opacity: 0.8,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  rowTitleMuted: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.inkMuted,
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 18,
  },
});
