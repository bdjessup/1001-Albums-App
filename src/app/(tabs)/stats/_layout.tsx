import { Stack } from "expo-router";

import { largeTitleScreenOptions } from "@/theme/navigation";
import { useTheme } from "@/theme/theme-context";

export default function StatsLayout() {
  const theme = useTheme();
  return (
    <Stack screenOptions={largeTitleScreenOptions(theme)}>
      <Stack.Screen name="index" options={{ title: "Stats" }} />
    </Stack>
  );
}
