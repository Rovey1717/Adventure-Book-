import { useFonts } from "expo-font";
import { Fredoka_600SemiBold } from "@expo-google-fonts/fredoka/600SemiBold";
import { Fredoka_700Bold } from "@expo-google-fonts/fredoka/700Bold";
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="name-discovery/index"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="celebrate/[id]"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="learning/[id]"
          options={{
            presentation: "fullScreenModal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="adventure-unlock/[id]"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="memory/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="adventure/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="library/[id]"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </AppProvider>
  );
}
