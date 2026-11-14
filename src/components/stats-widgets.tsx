import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { formatAverage } from "@/core/album";
import type { Disagreement, GroupStat } from "@/core/stats";
import type { HistoryEntry } from "@/core/types";
import { useTheme } from "@/theme/theme-context";
import { AlbumCover } from "./album-cover";
import { Icon, type IconName } from "./icon";
import { AppText } from "./text";

const countFormat = new Intl.NumberFormat();

/** A big number with a caption, in a row of two or three. */
export function StatTile({ value, label, icon }: { value: string; label: string; icon?: IconName }) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.colors.surface, borderRadius: theme.isIOS ? 12 : theme.shapes.card }]}>
      {icon ? <Icon name={icon} size={18} color={theme.colors.accent} /> : null}
      <AppText variant="title2" tabular numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText variant="footnote" tone="secondary" numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

export function TileRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.tileRow}>{children}</View>;
}

/** Horizontal bars for the 5 → 1 star distribution. */
export function RatingDistribution({ distribution }: { distribution: readonly number[] }) {
  const theme = useTheme();
  const max = Math.max(1, ...distribution);
  return (
    <View style={styles.bars}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars - 1] ?? 0;
        return (
          <View key={stars} style={styles.barRow} accessible accessibilityLabel={`${stars} stars: ${count} albums`}>
            <AppText variant="footnote" tone="secondary" style={styles.barLabel} tabular>
              {stars}★
            </AppText>
            <View style={[styles.track, { backgroundColor: theme.colors.fill }]}>
              <View style={[styles.fill, { width: `${(count / max) * 100}%`, backgroundColor: theme.colors.star }]} />
            </View>
            <AppText variant="footnote" tone="secondary" style={styles.barCount} tabular>
              {countFormat.format(count)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

/** Groups (genres, decades) as bars sized by count, labelled with your average. */
export function GroupBars({ groups, limit = 8 }: { groups: GroupStat[]; limit?: number }) {
  const theme = useTheme();
  const shown = groups.slice(0, limit);
  const max = Math.max(1, ...shown.map((g) => g.count));
  return (
    <View style={styles.bars}>
      {shown.map((group) => (
        <View key={group.key} style={styles.groupRow}>
          <View style={styles.groupHeader}>
            <AppText variant="subheadline" numberOfLines={1} style={styles.groupLabel}>
              {group.label}
            </AppText>
            <AppText variant="footnote" tone="secondary" tabular>
              {countFormat.format(group.count)} · {group.average === null ? "unrated" : `${formatAverage(group.average, 1)}★`}
            </AppText>
          </View>
          <View style={[styles.track, { backgroundColor: theme.colors.fill }]}>
            <View style={[styles.fill, { width: `${(group.count / max) * 100}%`, backgroundColor: theme.colors.accent }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function AlbumLink({ entry, children }: { entry: HistoryEntry; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Link href={{ pathname: "/album/[slug]", params: { slug: entry.album.slug } }} asChild>
      <Pressable android_ripple={{ color: theme.colors.fill }} style={({ pressed }) => [pressed && theme.isIOS && { opacity: 0.6 }]}>
        {children}
      </Pressable>
    </Link>
  );
}

/** Albums where your rating differs most from the global average. */
export function DisagreementList({ items }: { items: Disagreement[] }) {
  const theme = useTheme();
  return (
    <View>
      {items.map(({ entry, delta }, index) => (
        <AlbumLink key={entry.album.uuid} entry={entry}>
          <View
            style={[
              styles.disagreement,
              index > 0 && theme.isIOS && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.separator },
            ]}
          >
            <AlbumCover album={entry.album} size={44} />
            <View style={styles.disagreementText}>
              <AppText variant="subheadline" numberOfLines={1}>
                {entry.album.name}
              </AppText>
              <AppText variant="footnote" tone="secondary" numberOfLines={1}>
                You {typeof entry.rating === "number" ? entry.rating : "–"}★ · Everyone {formatAverage(entry.globalRating, 1)}★
              </AppText>
            </View>
            <AppText
              variant="headline"
              tabular
              color={delta > 0 ? theme.colors.positive : theme.colors.negative}
              accessibilityLabel={`${Math.abs(delta).toFixed(1)} stars ${delta > 0 ? "above" : "below"} average`}
            >
              {delta > 0 ? "+" : "−"}
              {Math.abs(delta).toFixed(1)}
            </AppText>
          </View>
        </AlbumLink>
      ))}
    </View>
  );
}

/** A horizontal shelf of covers, like Music's "Recently Played". */
export function CoverShelf({ entries }: { entries: HistoryEntry[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelf}>
      {entries.map((entry) => (
        <AlbumLink key={entry.album.uuid} entry={entry}>
          <View style={styles.shelfItem}>
            <AlbumCover album={entry.album} size={120} />
            <AppText variant="footnote" numberOfLines={1}>
              {entry.album.name}
            </AppText>
            <AppText variant="footnote" tone="secondary" numberOfLines={1}>
              {entry.album.artist}
            </AppText>
          </View>
        </AlbumLink>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tileRow: {
    flexDirection: "row",
    gap: 12,
  },
  tile: {
    flex: 1,
    gap: 4,
    padding: 14,
    borderCurve: "continuous",
  },
  bars: {
    gap: 10,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  barLabel: {
    width: 28,
  },
  barCount: {
    width: 36,
    textAlign: "right",
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  groupRow: {
    gap: 6,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  groupLabel: {
    flex: 1,
  },
  disagreement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disagreementText: {
    flex: 1,
    gap: 2,
  },
  shelf: {
    gap: 12,
    paddingHorizontal: 16,
  },
  shelfItem: {
    width: 120,
    gap: 4,
  },
});
