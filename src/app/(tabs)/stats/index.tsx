import { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { ProgressRing } from "@/components/native/progress-ring";
import { ScreenMessage } from "@/components/native/screen-message";
import { ErrorView, LoadingView } from "@/components/query-state";
import { Section } from "@/components/section";
import {
  CoverShelf,
  DisagreementList,
  GroupBars,
  RatingDistribution,
  StatTile,
  TileRow,
} from "@/components/stats-widgets";
import { AppText } from "@/components/text";
import { formatAverage } from "@/core/album";
import { computeStats } from "@/core/stats";
import { useAlbumStats, useProject, usePullToRefresh } from "@/data/queries";
import { useTheme } from "@/theme/theme-context";

const countFormat = new Intl.NumberFormat();
const dateFormat = new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" });

export default function StatsScreen() {
  const theme = useTheme();
  const { data: project, error, isPending, refetch } = useProject();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const { data: albumStats } = useAlbumStats();
  const stats = useMemo(
    () => (project ? computeStats(project.history, { albumStats }) : null),
    [project, albumStats],
  );

  if (isPending) return <LoadingView />;
  if (!project || !stats) return <ErrorView error={error} onRetry={() => refetch()} />;
  if (stats.generated === 0) {
    return (
      <ScreenMessage
        icon="stats"
        title="No stats yet"
        description="Rate a few albums on 1001 Albums Generator and your listening stats will show up here."
      />
    );
  }

  const percent = Math.floor(stats.progress * 100);
  const started = project.history[0] ? new Date(project.history[0].generatedAt) : null;
  const remaining = Math.max(0, stats.total - stats.generated);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accent]} />
      }
    >
      <Section>
        <View style={styles.progress}>
          <ProgressRing value={stats.generated} total={stats.total} label={`${percent}%`} color={theme.colors.accent} />
          <View style={styles.progressText}>
            <AppText variant="title2" tabular>
              {countFormat.format(stats.generated)} of {countFormat.format(stats.total)}
            </AppText>
            <AppText variant="subheadline" tone="secondary">
              {remaining > 0 ? `${countFormat.format(remaining)} albums to go` : "You've finished the list"}
            </AppText>
            {started ? (
              <AppText variant="footnote" tone="tertiary">
                Started {dateFormat.format(started)}
              </AppText>
            ) : null}
          </View>
        </View>
      </Section>

      <TileRow>
        <StatTile icon="rate" value={formatAverage(stats.average)} label="Your average rating" />
        <StatTile icon="globe" value={formatAverage(stats.globalAverage)} label="Everyone, same albums" />
      </TileRow>
      <TileRow>
        <StatTile icon="flame" value={countFormat.format(stats.longestRatedStreak)} label="Longest rating streak" />
        <StatTile icon="quote" value={countFormat.format(stats.reviews)} label="Reviews written" />
        <StatTile icon="paused" value={countFormat.format(stats.didNotListen)} label="Didn't listen" />
      </TileRow>

      {stats.rated > 0 ? (
        <Section title="Ratings" footer={`${countFormat.format(stats.rated)} rated albums`}>
          <RatingDistribution distribution={stats.distribution} />
        </Section>
      ) : null}

      {stats.fiveStars.length > 0 ? (
        <View style={styles.shelfSection}>
          <AppText variant={theme.isIOS ? "title3" : "headline"} style={styles.shelfTitle} accessibilityRole="header">
            Five stars
          </AppText>
          <CoverShelf entries={stats.fiveStars} />
        </View>
      ) : null}

      {stats.lovedMoreThanMost.length > 0 ? (
        <Section title="You loved these more than most" padded={false}>
          <DisagreementList items={stats.lovedMoreThanMost} />
        </Section>
      ) : null}

      {stats.likedLessThanMost.length > 0 ? (
        <Section
          title="Everyone else liked these more"
          padded={false}
          footer={
            stats.averageGap !== null
              ? `On average you're ${stats.averageGap.toFixed(1)} stars away from the crowd.`
              : undefined
          }
        >
          <DisagreementList items={stats.likedLessThanMost} />
        </Section>
      ) : null}

      {stats.favoriteGenres.length > 0 ? (
        <Section title="Favourite genres" footer="Genres with at least three ratings, by your average.">
          <GroupBars groups={stats.favoriteGenres} limit={6} />
        </Section>
      ) : null}

      <Section title="Most common genres">
        <GroupBars groups={stats.genres} limit={8} />
      </Section>

      <Section title="By decade">
        <GroupBars groups={stats.decades} limit={20} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    padding: 16,
    paddingBottom: 48,
  },
  progress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  progressText: {
    flex: 1,
    gap: 4,
  },
  shelfSection: {
    gap: 10,
    marginHorizontal: -16,
  },
  shelfTitle: {
    paddingHorizontal: 20,
  },
});
