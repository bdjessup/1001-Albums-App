import { ActivityIndicator, StyleSheet, View } from "react-native";

import { isApiError } from "@/core/client";
import { useTheme } from "@/theme/theme-context";
import { ScreenMessage } from "./native/screen-message";
import type { ScreenMessageProps } from "./native/screen-message.types";

export function LoadingView() {
  const theme = useTheme();
  return (
    <View style={[StyleSheet.absoluteFill, styles.center]}>
      <ActivityIndicator color={theme.isIOS ? undefined : theme.colors.accent} size="large" />
    </View>
  );
}

/** Plain-language copy for each way the API can fail. */
export function describeError(error: unknown): Pick<ScreenMessageProps, "icon" | "title" | "description"> {
  if (isApiError(error)) {
    switch (error.kind) {
      case "network":
        return { icon: "offline", title: "You're offline", description: "Connect to the internet to load your albums." };
      case "rate-limited":
        return {
          icon: "paused",
          title: "Taking a breather",
          description: "1001 Albums Generator limits how often apps can ask for data. Try again in a minute.",
        };
      case "not-found":
        return {
          icon: "warning",
          title: "Project not found",
          description: "Check the project name in Settings. It's the last part of your project's web address.",
        };
      default:
        return {
          icon: "warning",
          title: "Something went wrong",
          description: "1001 Albums Generator didn't respond as expected. Try again shortly.",
        };
    }
  }
  return { icon: "warning", title: "Something went wrong", description: error instanceof Error ? error.message : undefined };
}

export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return <ScreenMessage {...describeError(error)} action={onRetry ? { label: "Try Again", onPress: onRetry } : undefined} />;
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});
