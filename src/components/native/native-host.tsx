import { Host } from "@expo/ui";
import type { ComponentProps } from "react";

import { useTheme } from "@/theme/theme-context";

type HostProps = ComponentProps<typeof Host>;

/**
 * Host for @expo/ui (SwiftUI on iOS, Jetpack Compose on Android). It pins the
 * colour scheme to the app's resolved theme rather than the OS, and seeds the
 * native theme: on Android `seedColor` generates a full Material 3 palette for
 * the Compose subtree, on iOS it becomes the SwiftUI tint.
 */
export function NativeHost({ seedColor, colorScheme, ...props }: HostProps) {
  const theme = useTheme();
  return <Host colorScheme={colorScheme ?? theme.scheme} seedColor={seedColor ?? theme.colors.accent} {...props} />;
}
