import { Image } from "expo-image";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { coverSources } from "@/core/album";
import type { Album } from "@/core/types";
import { useTheme } from "@/theme/theme-context";
import { Icon } from "./icon";

/**
 * Square album art. expo-image picks the right cover size for the rendered
 * width from all the sizes the API provides, caches to disk, and recycles in
 * lists. iOS gets continuous corners and a soft shadow; Android a flat M3
 * surface with its larger corner radius.
 */
export function AlbumCover({
  album,
  size,
  large = false,
  style,
  priority,
}: {
  album: Pick<Album, "images" | "name" | "artist">;
  size: number;
  large?: boolean;
  style?: StyleProp<ViewStyle>;
  priority?: "low" | "normal" | "high";
}) {
  const theme = useTheme();
  const radius = large ? theme.shapes.coverLarge : theme.shapes.cover;
  const sources = coverSources(album);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderCurve: "continuous",
          backgroundColor: theme.colors.fill,
        },
        large && theme.isIOS && styles.shadow,
        style,
      ]}
    >
      {sources.length > 0 ? (
        <Image
          source={sources}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          contentFit="cover"
          transition={large ? 250 : 120}
          recyclingKey={sources[0]?.uri}
          priority={priority}
          cachePolicy="disk"
          accessibilityLabel={`${album.name} by ${album.artist}, album cover`}
          accessible
        />
      ) : (
        <View style={styles.placeholder}>
          <Icon name="music" size={size * 0.35} color={theme.colors.textTertiary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
