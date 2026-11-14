import { NativeTabs } from "expo-router/native-tabs";

import { useTheme } from "@/theme/theme-context";

export const unstable_settings = {
  anchor: "(today)",
};

/**
 * Real platform tab bars: UITabBar with Liquid Glass on iOS 26 (it shrinks
 * while scrolling down, like Music) and a Material 3 navigation bar with a
 * pill indicator on Android.
 */
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={theme.colors.accent}
      backgroundColor={theme.isIOS ? undefined : theme.colors.surface}
      indicatorColor={theme.colors.accentSoft}
      iconColor={theme.isIOS ? undefined : { default: theme.colors.textSecondary, selected: theme.colors.text }}
      labelStyle={theme.isIOS ? undefined : { default: { color: theme.colors.textSecondary }, selected: { color: theme.colors.text } }}
    >
      <NativeTabs.Trigger name="(today)">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "opticaldisc", selected: "opticaldisc.fill" }} md="album" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "rectangle.stack", selected: "rectangle.stack.fill" }} md="library_music" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} md="bar_chart" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
