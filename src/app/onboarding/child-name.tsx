import { StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingShell } from "@/components/onboarding";
import { colors, fonts, radii } from "@/constants/theme";
import { useOnboarding } from "@/context/OnboardingContext";

export default function ChildNameScreen() {
  const router = useRouter();
  const { draft, patchDraft } = useOnboarding();
  const canContinue = draft.childName.trim().length > 0;

  return (
    <OnboardingShell
      stepIndex={0}
      title="What's your child's name?"
      subtitle="We'll use it to make discoveries feel personal."
      primaryLabel="Continue"
      primaryDisabled={!canContinue}
      onPrimary={() => router.push("/onboarding/birthdate")}
      secondaryLabel="Back"
      onSecondary={() => router.back()}
      variant="cream"
    >
      <TextInput
        value={draft.childName}
        onChangeText={(childName) => patchDraft({ childName })}
        placeholder="First name"
        placeholderTextColor={colors.inkSoft}
        autoFocus
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => {
          if (canContinue) router.push("/onboarding/birthdate");
        }}
        style={styles.input}
        accessibilityLabel="Child's first name"
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 60,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.stroke,
    paddingHorizontal: 20,
    fontFamily: fonts.bodySemi,
    fontSize: 22,
    color: colors.ink,
  },
});
