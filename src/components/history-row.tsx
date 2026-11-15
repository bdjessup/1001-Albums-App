import { Link } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { releaseYear } from "@/core/album";
import type { NumberedEntry } from "@/core/history";
import { pickStreamingLinks, type StreamingServiceId } from "@/core/streaming";
import { openExternal, shareAlbum } from "@/data/actions";
import { useTheme } from "@/theme/theme-context";
import { AlbumCover } from "./album-cover";
import { RatingStars } from "./rating";
import { AppText } from "./text";

export const HISTORY_ROW_HEIGHT = 80;

/**
 * One album in History. Tapping pushes the album page; on iOS the cover zooms
 * into the page's cover (Link.AppleZoom), a long press peeks a live preview of
 * it with Play and Share actions (Link.Preview / Link.Menu), like Music. On
 * Android it's a Material list item with a ripple.
 */
export const HistoryRow = memo(function HistoryRow({
  entry,
  preferredService,
}: {
  entry: NumberedEntry;
  preferredService: StreamingServiceId;
}) {
  const theme = useTheme();
  const { album } = entry;
  const year = releaseYear(album);
  const play = pickStreamingLinks(album, preferredService).primary;

  return (
    <Link href={{ pathname: "/album/[slug]", params: { slug: album.slug } }} asChild>
      <Link.Trigger>
        <Pressable
          android_ripple={{ color: theme.colors.fill }}
          style={({ pressed }) => [styles.row, pressed && theme.isIOS && { backgroundColor: theme.colors.fill }]}
          accessibilityHint="Opens the album"
        >
          <Link.AppleZoom>
            <View>
              <AlbumCover album={album} size={56} />
            </View>
          </Link.AppleZoom>
          <View style={styles.text}>
            <AppText variant="headline" numberOfLines={1}>
              {album.name}
            </AppText>
            <AppText variant="subheadline" tone="secondary" numberOfLines={1}>
              {year ? `${album.artist} · ${year}` : album.artist}
            </AppText>
            <RatingStars rating={entry.rating} size={12} />
          </View>
          <AppText variant="caption" tone="tertiary" tabular>
            {entry.number}
          </AppText>
        </Pressable>
      </Link.Trigger>
      {theme.isIOS ? <Link.Preview /> : null}
      {theme.isIOS ? (
        <Link.Menu>
          {play ? <Link.MenuAction title={`Play on ${play.name}`} icon="play.fill" onPress={() => openExternal(play.url)} /> : null}
          <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => shareAlbum(album, play?.url)} />
        </Link.Menu>
      ) : null}
    </Link>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: HISTORY_ROW_HEIGHT,
    paddingHorizontal: 16,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
