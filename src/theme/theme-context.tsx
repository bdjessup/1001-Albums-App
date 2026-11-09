import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from "expo-router";
import { useAtomValue } from "jotai";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { Appearance, useColorScheme } from "react-native";

import { appearanceAtom } from "@/data/atoms";
import { makeTheme, type ColorSchemeName, type Theme } from "./theme";

const ThemeContext = createContext<Theme>(makeTheme("light"));

export function useResolvedScheme(): ColorSchemeName {
  const system = useColorScheme();
  const preference = useAtomValue(appearanceAtom);
  if (preference !== "system") return preference;
  return system === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useAtomValue(appearanceAtom);
  const scheme = useResolvedScheme();

  // Push the in-app preference down to the window so OS-drawn chrome (alerts,
  // keyboards, menus, SwiftUI and Compose hosts) follows it too. "unspecified"
  // hands control back to the system.
  useEffect(() => {
    Appearance.setColorScheme(preference === "system" ? "unspecified" : preference);
  }, [preference]);

  const theme = useMemo(() => makeTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * The React Navigation theme behind expo-router's native stack and tabs. It
 * decides the nav bar's interface style and the colour painted behind
 * transparent headers and the tab bar, so it must match our palette.
 */
export function makeNavigationTheme(theme: Theme): NavigationTheme {
  const base = theme.dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.separator,
      notification: theme.colors.accent,
    },
  };
}
