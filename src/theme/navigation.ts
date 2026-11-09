import { isLiquidGlassAvailable } from "expo-glass-effect";
import type { Stack } from "expo-router";
import type { ComponentProps } from "react";

import type { Theme } from "./theme";

type ScreenOptions = Exclude<NonNullable<ComponentProps<typeof Stack>["screenOptions"]>, (...args: never[]) => unknown>;

/**
 * Header chrome per platform:
 * - iOS: transparent bars so iOS 26 draws Liquid Glass and the scroll-edge
 *   effect; pre-26 falls back to the system chrome material blur.
 * - Android: an opaque Material 3 top app bar on the surface colour.
 */
export function baseScreenOptions(theme: Theme): ScreenOptions {
  if (theme.isIOS) {
    return {
      headerTransparent: true,
      headerBlurEffect: isLiquidGlassAvailable() ? undefined : theme.dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight",
      headerShadowVisible: false,
      headerLargeTitleShadowVisible: false,
      headerBackButtonDisplayMode: "minimal",
      headerTintColor: theme.colors.accent,
      headerTitleStyle: { color: theme.colors.text },
      headerLargeTitleStyle: { color: theme.colors.text },
      contentStyle: { backgroundColor: theme.colors.background },
    };
  }
  return {
    headerStyle: { backgroundColor: theme.colors.background },
    headerShadowVisible: false,
    headerTintColor: theme.colors.text,
    headerTitleStyle: { color: theme.colors.text },
    contentStyle: { backgroundColor: theme.colors.background },
    animation: "default",
  };
}

/** Tab roots: a large collapsing title on iOS, a regular M3 top app bar on Android. */
export function largeTitleScreenOptions(theme: Theme): ScreenOptions {
  return { ...baseScreenOptions(theme), headerLargeTitle: theme.isIOS };
}

/** Album pages: content runs under a fully transparent bar on both platforms. */
export function immersiveScreenOptions(theme: Theme): ScreenOptions {
  return {
    ...baseScreenOptions(theme),
    title: "",
    headerTransparent: true,
    headerBlurEffect: undefined,
    headerStyle: { backgroundColor: "transparent" },
    contentStyle: { backgroundColor: theme.colors.backgroundPlain },
  };
}
