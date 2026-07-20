import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="camera.fill" md="photo_camera" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="books.vertical.fill" md="local_library" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="adventure-book">
        <NativeTabs.Trigger.Label>Adventure Book</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="auto_stories" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="parent">
        <NativeTabs.Trigger.Label>Parent</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
