import { Stack } from "expo-router";

import { immersiveScreenOptions } from "@/theme/navigation";
import { useTheme } from "@/theme/theme-context";

export default function TodayLayout() {
  const theme = useTheme();
  return <Stack screenOptions={immersiveScreenOptions(theme)} />;
}
