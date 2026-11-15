import { MenuView } from "@expo/ui/community/menu";
import { Stack } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/theme-context";
import { Icon } from "../icon";
import type { HeaderAction } from "./header-actions.types";

function IconButton({ action, onPress }: { action: HeaderAction; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={action.label}
      accessibilityRole="button"
      android_ripple={{ color: theme.colors.fill, borderless: true, radius: 20 }}
      style={styles.iconButton}
      hitSlop={4}
    >
      <Icon name={action.icon} size={24} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

/**
 * Android: Material 3 top-app-bar action icons with ripples; menus are
 * Material dropdowns (via @expo/ui's menu) with checked items.
 */
export function HeaderActions({ actions }: { actions: HeaderAction[] }) {
  const theme = useTheme();
  return (
    <Stack.Screen
      options={{
        headerRight: () => (
          <View style={styles.row}>
            {actions.map((action) =>
              action.menu ? (
                <MenuView
                  key={action.id}
                  colorScheme={theme.scheme}
                  actions={action.menu.map((group) => ({
                    id: group.title,
                    title: group.title,
                    subactions: group.items.map((item) => ({
                      id: item.id,
                      title: item.title,
                      state: item.selected ? ("on" as const) : ("off" as const),
                    })),
                  }))}
                  onPressAction={({ nativeEvent }) => {
                    for (const group of action.menu ?? []) {
                      group.items.find((item) => item.id === nativeEvent.event)?.onPress();
                    }
                  }}
                >
                  <IconButton action={action} />
                </MenuView>
              ) : (
                <IconButton key={action.id} action={action} onPress={action.onPress} />
              ),
            )}
          </View>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
