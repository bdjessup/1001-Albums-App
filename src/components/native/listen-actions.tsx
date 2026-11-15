import { Button } from "@expo/ui";
import { MenuView } from "@expo/ui/community/menu";
import { Pressable, StyleSheet, View } from "react-native";

import { readableTextOn } from "@/core/color";
import { openExternal, selectionHaptic, shareAlbum } from "@/data/actions";
import { useTheme } from "@/theme/theme-context";
import { Icon } from "../icon";
import { NativeHost } from "./native-host";
import type { ListenActionsProps } from "./listen-actions.types";

/**
 * Android: a Material 3 filled button (Compose), themed by a palette generated
 * from the album colour, next to a tonal icon button that opens a Material
 * dropdown menu of the other services.
 */
export function ListenActions({ album, primary, others, accent }: ListenActionsProps) {
  const theme = useTheme();
  if (!primary) return null;
  const actions = [
    ...others.map((link) => ({ id: link.id, title: `Listen on ${link.name}` })),
    { id: "share", title: "Share album" },
  ];
  return (
    <View style={styles.row}>
      <NativeHost matchContents={{ vertical: true }} seedColor={accent} style={styles.primary}>
        <Button
          label={`Play on ${primary.name}`}
          onPress={() => openExternal(primary.url)}
          variant="filled"
          style={{ width: "100%" }}
        />
      </NativeHost>
      <MenuView
        actions={actions}
        colorScheme={theme.scheme}
        onPressAction={({ nativeEvent }) => {
          selectionHaptic();
          if (nativeEvent.event === "share") return void shareAlbum(album, primary.url);
          const link = others.find((l) => l.id === nativeEvent.event);
          if (link) void openExternal(link.url);
        }}
      >
        <Pressable
          accessibilityLabel="More listening options"
          accessibilityRole="button"
          android_ripple={{ color: theme.colors.fill, borderless: true }}
          style={[styles.iconButton, { backgroundColor: theme.colors.accentSoft }]}
        >
          <Icon name="more" size={22} color={readableTextOn(theme.colors.accentSoft)} />
        </Pressable>
      </MenuView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  primary: {
    flex: 1,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
