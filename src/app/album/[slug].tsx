import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlbumBody } from "@/components/album-body";
import { AlbumHero } from "@/components/album-hero";
import { HeaderActions } from "@/components/native/header-actions";
import { ScreenMessage } from "@/components/native/screen-message";
import { LoadingView } from "@/components/query-state";
import { findEntry } from "@/core/history";
import { globalRatingFor } from "@/core/stats";
import { shareAlbum } from "@/data/actions";
import { useAlbumColors } from "@/data/album-colors";
import { useAlbumStats, useNumberedHistory, useProject } from "@/data/queries";
import { NAV_BAR_HEIGHT } from "@/theme/layout";

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function AlbumScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { data: project, isPending } = useProject();
  const history = useNumberedHistory();
  const { data: albumStats } = useAlbumStats();
  const entry = findEntry(history, slug);
  const album = entry?.album ?? (project?.currentAlbum?.slug === slug ? project.currentAlbum : null);
  const colors = useAlbumColors(album);

  if (isPending) return <LoadingView />;
  if (!album) {
    return (
      <ScreenMessage
        icon="music"
        title="Album not found"
        description="It may not be in this project's history yet. Pull to refresh on History and try again."
      />
    );
  }

  // Stats carry vote counts; the history entry's figure is the fallback.
  const global =
    globalRatingFor(albumStats, album) ?? (entry?.globalRating != null ? { average: entry.globalRating } : null);

  return (
    <>
      <HeaderActions actions={[{ id: "share", icon: "share", label: "Share album", onPress: () => shareAlbum(album) }]} />
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <AlbumHero
          album={album}
          colors={colors}
          topInset={insets.top + NAV_BAR_HEIGHT}
          eyebrow={entry ? `Album ${entry.number} · ${dateFormat.format(new Date(entry.generatedAt))}` : "Today"}
          // The cover is where the zoom transition from History lands (iOS 18+).
          wrapCover={(cover) => <Link.AppleZoomTarget>{cover}</Link.AppleZoomTarget>}
        />
        <AlbumBody album={album} entry={entry} colors={colors} globalRating={global} isToday={!entry} />
      </ScrollView>
    </>
  );
}
