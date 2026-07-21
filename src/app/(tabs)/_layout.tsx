import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Platform, Text } from "react-native";
import { colors, fonts } from "@/constants/theme";

type TabGlyph = {
  ios: string;
  fallback: string;
};

const TAB_GLYPHS: Record<string, TabGlyph> = {
  index: { ios: "camera.fill", fallback: "📷" },
  "adventure-book": { ios: "book.fill", fallback: "📖" },
  adventures: { ios: "map.fill", fallback: "🗺" },
  journey: { ios: "chart.line.uptrend.xyaxis", fallback: "📈" },
  library: { ios: "books.vertical.fill", fallback: "📚" },
  parent: { ios: "person.3.fill", fallback: "👪" },
};

function TabIcon({
  route,
  color,
}: {
  route: keyof typeof TAB_GLYPHS;
  color: string;
}) {
  const glyph = TAB_GLYPHS[route];
  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name={glyph.ios as never}
        tintColor={color}
        size={22}
        resizeMode="scaleAspectFit"
      />
    );
  }
  return <Text style={{ fontSize: 18 }}>{glyph.fallback}</Text>;
}

/**
 * Six product homes — exact IA order:
 * Discover → Adventure Book → Adventures → Journey → Library → Parent
 *
 * Uses JS Tabs (not NativeTabs) so MagicalBackground / camera can paint
 * edge-to-edge under the status bar. NativeTabs on modern iOS insets the
 * scene with rounded top corners, leaving a gap above every screen.
 *
 * Safe-area padding is applied manually on scroll content / headers —
 * never on the full-bleed background root.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          flex: 1,
          backgroundColor: colors.surface,
        },
        tabBarActiveTintColor: colors.skyBlue,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.surfaceRaised,
          borderTopColor: colors.stroke,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodyBold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <TabIcon route="index" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="adventure-book"
        options={{
          title: "Adventure Book",
          tabBarIcon: ({ color }) => (
            <TabIcon route="adventure-book" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="adventures"
        options={{
          title: "Adventures",
          tabBarIcon: ({ color }) => (
            <TabIcon route="adventures" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: "Journey",
          tabBarIcon: ({ color }) => (
            <TabIcon route="journey" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <TabIcon route="library" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="parent"
        options={{
          title: "Parent",
          tabBarIcon: ({ color }) => (
            <TabIcon route="parent" color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
