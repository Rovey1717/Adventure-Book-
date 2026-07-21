import { useFonts } from "expo-font";
import { Fredoka_600SemiBold } from "@expo-google-fonts/fredoka/600SemiBold";
import { Fredoka_700Bold } from "@expo-google-fonts/fredoka/700Bold";
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, type ReactNode } from "react";
import { AppProvider } from "@/context/AppContext";
import { colors } from "@/constants/theme";
import { hasCompletedOnboarding } from "@/domain/parent/profile";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

const edgeToEdge = {
  headerShown: false,
  contentStyle: {
    flex: 1,
    backgroundColor: colors.surface,
  },
} as const;

function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const rootSegment = segments[0];

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const complete = hasCompletedOnboarding();
    const inOnboarding = rootSegment === "onboarding";

    if (!complete && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (complete && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [ready, router, rootSegment]);

  return children;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <OnboardingGate>
        <Stack screenOptions={edgeToEdge}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen
            name="name-discovery/index"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="celebrate/[id]"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="learning/[id]"
            options={{ presentation: "fullScreenModal" }}
          />
          <Stack.Screen
            name="adventure-unlock/[id]"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="memory/[id]" />
          <Stack.Screen name="adventure/[id]" />
          <Stack.Screen
            name="library/[id]"
            options={{ presentation: "modal" }}
          />
        </Stack>
      </OnboardingGate>
    </AppProvider>
  );
}
