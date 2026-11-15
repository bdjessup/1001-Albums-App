import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ThemeProvider as NavigationThemeProvider, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { Provider, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";

import { appStore, projectIdAtom } from "@/data/atoms";
import { persistOptions, queryClient } from "@/data/query-client";
import { baseScreenOptions, immersiveScreenOptions } from "@/theme/navigation";
import { makeNavigationTheme, ThemeProvider, useTheme } from "@/theme/theme-context";

// Keep the native splash up until the persisted cache is restored, so the app
// opens straight onto today's album instead of a spinner.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 250, fade: true });
const hideSplash = () => SplashScreen.hideAsync().catch(() => {});

function RootStack() {
  const theme = useTheme();
  const projectId = useAtomValue(projectIdAtom);
  const navigationTheme = useMemo(() => makeNavigationTheme(theme), [theme]);

  // Paint the window behind React so pushes and sheet transitions never flash
  // the wrong colour.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme.colors.background]);

  // Safety net: never leave the splash up if restoring stalls.
  useEffect(() => {
    const timeout = setTimeout(hideSplash, 2500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <Stack screenOptions={baseScreenOptions(theme)}>
        <Stack.Protected guard={!!projectId}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="album/[slug]" options={immersiveScreenOptions(theme)} />
          <Stack.Screen
            name="settings"
            options={{ title: "Settings", presentation: theme.isIOS ? "modal" : "card", headerTransparent: false }}
          />
          <Stack.Screen
            name="connect"
            options={{ title: "Change Project", presentation: theme.isIOS ? "modal" : "card", headerTransparent: false }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!projectId}>
          <Stack.Screen name="welcome" options={{ headerShown: false, animation: "fade" }} />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={appStore}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions} onSuccess={hideSplash} onError={hideSplash}>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </PersistQueryClientProvider>
    </Provider>
  );
}
