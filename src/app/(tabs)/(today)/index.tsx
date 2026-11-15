import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlbumBody } from "@/components/album-body";
import { AlbumHero } from "@/components/album-hero";
import { Icon } from "@/components/icon";
import { HeaderActions } from "@/components/native/header-actions";
import { ScreenMessage } from "@/components/native/screen-message";
import { ErrorView, LoadingView } from "@/components/query-state";
import { AppText } from "@/components/text";
import { currentAlbumNumber } from "@/core/history";
import { computeStats, globalRatingFor, LIST_SIZE } from "@/core/stats";
import { shareAlbum, useRateOnSite } from "@/data/actions";
import { useAlbumColors } from "@/data/album-colors";
import { useAlbumStats, useNumberedHistory, useProject, usePullToRefresh } from "@/data/queries";
import { NAV_BAR_HEIGHT, TAB_BAR_HEIGHT } from "@/theme/layout";
import { useTheme } from "@/theme/theme-context";

const countFormat = new Intl.NumberFormat();

export default function TodayScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data: project, error, isPending, refetch } = useProject();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const history = useNumberedHistory();
  const { data: albumStats } = useAlbumStats();
  const rateOnSite = useRateOnSite();
  const album = project?.currentAlbum ?? null;
  const colors = useAlbumColors(album);

  const actions = (
    <HeaderActions
      actions={[
        ...(album ? [{ id: "share", icon: "share" as const, label: "Share album", onPress: () => shareAlbum(album) }] : []),
        { id: "settings", icon: "settings", label: "Settings", onPress: () => router.push("/settings") },
      ]}
    />
  );

  if (isPending) {
    return (
      <>
        {actions}
        <LoadingView />
      </>
    );
  }

  if (!project) {
    return (
      <>
        {actions}
        <ErrorView error={error} onRetry={() => refetch()} />
      </>
    );
  }

  if (!album) {
    const stats = computeStats(project.history, { albumStats });
    const finished = stats.generated >= stats.total;
    return (
      <>
        {actions}
        <ScreenMessage
          icon="sparkles"
          title={finished ? "You've heard them all" : "No album right now"}
          description={
            finished
              ? `${countFormat.format(stats.generated)} albums, done. Your history and stats are all still here.`
              : "Your next album will show up here. Pull down on History to refresh."
          }
          action={finished ? undefined : { label: "Refresh", onPress: () => refetch() }}
        />
      </>
    );
  }

  const number = currentAlbumNumber(project);
  const total = albumStats?.stats.length || LIST_SIZE;
  const entry = history.find((e) => e.album.uuid === album.uuid);
  const topInset = insets.top + NAV_BAR_HEIGHT;

  return (
    <>
      {actions}
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={topInset}
            tintColor={theme.colors.textSecondary}
            colors={[theme.colors.accent]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        <AlbumHero
          album={album}
          colors={colors}
          topInset={topInset}
          eyebrow={number ? `Today · Album ${countFormat.format(number)} of ${countFormat.format(total)}` : "Today"}
        />
        {project.paused ? (
          <View style={[styles.paused, { backgroundColor: theme.colors.accentSoft }]}>
            <Icon name="paused" size={20} color={theme.colors.text} />
            <AppText variant="subheadline" style={styles.pausedText} onPress={rateOnSite}>
              Your project is paused. New albums resume when you unpause it on 1001 Albums Generator.
            </AppText>
          </View>
        ) : null}
        <AlbumBody
          album={album}
          entry={entry}
          colors={colors}
          globalRating={globalRatingFor(albumStats, album)}
          notes={project.currentAlbumNotes}
          isToday
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  paused: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderCurve: "continuous",
  },
  pausedText: {
    flex: 1,
  },
});
