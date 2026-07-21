import { useFonts } from "expo-font";
import { Fredoka_600SemiBold } from "@expo-google-fonts/fredoka/600SemiBold";
import { Fredoka_700Bold } from "@expo-google-fonts/fredoka/700Bold";
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppProvider } from "@/context/AppContext";
import { colors } from "@/constants/theme";

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
      <Stack screenOptions={edgeToEdge}>
        <Stack.Screen name="(tabs)" />
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
    </AppProvider>
  );
}
