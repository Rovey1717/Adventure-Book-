import { NativeTabs } from "expo-router/unstable-native-tabs";

/**
 * Six product homes — exact IA order:
 * Discover → Adventure Book → Adventures → Journey → Library → Parent
 *
 * Responsibilities never overlap:
 * Discover = entry · Adventure Book = memories · Adventures = personalized learning
 * Journey = progress · Library = universal knowledge · Parent = management
 */
export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="camera.fill" md="photo_camera" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="adventure-book">
        <NativeTabs.Trigger.Label>Adventure Book</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="auto_stories" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="adventures">
        <NativeTabs.Trigger.Label>Adventures</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map.fill" md="explore" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journey">
        <NativeTabs.Trigger.Label>Journey</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" md="insights" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="books.vertical.fill" md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="parent">
        <NativeTabs.Trigger.Label>Parent</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.3.fill" md="family_restroom" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
