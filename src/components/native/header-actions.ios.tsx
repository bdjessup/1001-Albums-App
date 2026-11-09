import { Stack } from "expo-router";

import { sfSymbol } from "../icon";
import type { HeaderAction } from "./header-actions.types";

/**
 * iOS: real UIBarButtonItems via Stack.Toolbar, so they get the system's
 * Liquid Glass grouping on iOS 26, and menus are native UIMenus with
 * checkmarks and inline sections.
 */
export function HeaderActions({ actions }: { actions: HeaderAction[] }) {
  return (
    <Stack.Toolbar placement="right">
      {actions.map((action) =>
        action.menu ? (
          <Stack.Toolbar.Menu key={action.id} icon={sfSymbol(action.icon)} accessibilityLabel={action.label}>
            {action.menu.map((group) => (
              <Stack.Toolbar.Menu key={group.title} title={group.title} inline>
                {group.items.map((item) => (
                  <Stack.Toolbar.MenuAction key={item.id} isOn={item.selected} onPress={item.onPress}>
                    {item.title}
                  </Stack.Toolbar.MenuAction>
                ))}
              </Stack.Toolbar.Menu>
            ))}
          </Stack.Toolbar.Menu>
        ) : (
          <Stack.Toolbar.Button
            key={action.id}
            icon={sfSymbol(action.icon)}
            accessibilityLabel={action.label}
            onPress={action.onPress}
          />
        ),
      )}
    </Stack.Toolbar>
  );
}
