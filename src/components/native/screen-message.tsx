import { Button } from "@expo/ui";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/theme-context";
import { Icon } from "../icon";
import { AppText } from "../text";
import { NativeHost } from "./native-host";
import type { ScreenMessageProps } from "./screen-message.types";

/** Android: an M3-style empty state with a Compose filled button. */
export function ScreenMessage({ icon, title, description, action }: ScreenMessageProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Icon name={icon} size={48} color={theme.colors.textSecondary} />
      <AppText variant="title2" align="center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="callout" tone="secondary" align="center">
          {description}
        </AppText>
      ) : null}
      {action ? (
        <NativeHost matchContents style={styles.button}>
          <Button label={action.label} onPress={action.onPress} variant="filled" />
        </NativeHost>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  button: {
    marginTop: 8,
  },
});
