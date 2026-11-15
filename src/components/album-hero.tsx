import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { coverUrl, displayGenres, releaseYear } from "@/core/album";
import { backdropColor } from "@/core/color";
import type { Album } from "@/core/types";
import type { AlbumColors } from "@/data/album-colors";
import { useTheme } from "@/theme/theme-context";
import { AlbumCover } from "./album-cover";
import { Chips } from "./chips";
import { AppText } from "./text";

/**
 * The top of an album page: the cover over a blurred, colour-washed copy of
 * itself, fading into the page background, then title, artist and genres.
 * `wrapCover` lets the album screen wrap the cover as a zoom-transition target.
 */
export function AlbumHero({
  album,
  colors,
  eyebrow,
  topInset,
  wrapCover = (cover) => cover,
}: {
  album: Album;
  colors: AlbumColors | undefined;
  eyebrow?: string;
  topInset: number;
  wrapCover?: (cover: ReactNode) => ReactNode;
}) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const coverSize = Math.min(width - 96, 340);
  const year = releaseYear(album);
  const backdrop = backdropColor(colors?.background ?? theme.colors.fill, theme.dark);
  const blurred = coverUrl(album, 64);

  return (
    <View style={{ paddingTop: topInset + 12 }}>
      <View style={[StyleSheet.absoluteFill, styles.backdrop]} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: backdrop }]} />
        {blurred ? (
          <Image source={{ uri: blurred }} style={[StyleSheet.absoluteFill, styles.blur]} blurRadius={40} contentFit="cover" />
        ) : null}
        <LinearGradient
          colors={[`${theme.colors.backgroundPlain}00`, theme.colors.backgroundPlain]}
          locations={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.content}>
        {wrapCover(<AlbumCover album={album} size={coverSize} large priority="high" />)}
        <View style={styles.titles}>
          {eyebrow ? (
            <AppText variant="caption" tone="secondary" align="center" style={styles.eyebrow}>
              {eyebrow.toUpperCase()}
            </AppText>
          ) : null}
          <AppText variant="title" align="center" accessibilityRole="header">
            {album.name}
          </AppText>
          <AppText variant="title3" tone="accent" align="center">
            {album.artist}
          </AppText>
          {year ? (
            <AppText variant="subheadline" tone="secondary" align="center" tabular>
              {year}
            </AppText>
          ) : null}
        </View>
        <View style={styles.chips}>
          <Chips labels={displayGenres(album)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    bottom: -1,
    overflow: "hidden",
  },
  blur: {
    opacity: 0.55,
    transform: [{ scale: 1.4 }],
  },
  content: {
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  titles: {
    alignItems: "center",
    gap: 4,
  },
  eyebrow: {
    letterSpacing: 1,
    marginBottom: 4,
  },
  chips: {
    alignItems: "center",
  },
});
