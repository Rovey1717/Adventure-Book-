import { Stack } from "expo-router";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { colors } from "@/constants/theme";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: colors.surface },
        }}
      />
    </OnboardingProvider>
  );
}
