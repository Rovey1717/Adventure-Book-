import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@/constants/theme";

/**
 * Six product homes — exact IA order:
 * Discover → Adventure Book → Adventures → Journey → Library → Parent
 *
 * disableAutomaticContentInsets: NativeTabs otherwise wraps Android screens in
 * SafeAreaView and applies iOS ScrollView content insets. That fights edge-to-edge
 * backgrounds and stacks with our manual insets.top padding (especially after
 * leaving the camera). We draw backgrounds full-bleed and pad content ourselves.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={colors.skyBlue}
      backgroundColor={colors.surfaceRaised}
      labelStyle={{
        fontFamily: "Nunito_700Bold",
        fontSize: 11,
        color: colors.inkMuted,
      }}
    >
      <NativeTabs.Trigger
        name="index"
        disableAutomaticContentInsets
        contentStyle={styles.tabContent}
      >
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="camera.fill" md="photo_camera" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="adventure-book"
        disableAutomaticContentInsets
        contentStyle={styles.tabContent}
      >
        <NativeTabs.Trigger.Label>Adventure Book</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="auto_stories" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="adventures"
        disableAutomaticContentInsets
        contentStyle={styles.tabContent}
      >
        <NativeTabs.Trigger.Label>Adventures</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map.fill" md="explore" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="journey"
        disableAutomaticContentInsets
        contentStyle={styles.tabContent}
      >
        <NativeTabs.Trigger.Label>Journey</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" md="insights" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="library"
        disableAutomaticContentInsets
        contentStyle={styles.tabContent}
      >
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="books.vertical.fill" md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="parent"
        disableAutomaticContentInsets
        contentStyle={styles.tabContent}
      >
        <NativeTabs.Trigger.Label>Parent</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.3.fill" md="family_restroom" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const styles = {
  tabContent: {
    backgroundColor: colors.surface,
  },
};
