import { StyleSheet, View } from "react-native";

import { formatAverage } from "@/core/album";
import type { NumberedEntry } from "@/core/history";
import type { Album } from "@/core/types";
import { openReader, shareAlbum, usePreferredLinks, useRateOnSite } from "@/data/actions";
import type { AlbumColors } from "@/data/album-colors";
import { useTheme } from "@/theme/theme-context";
import { Icon } from "./icon";
import { ListenActions } from "./native/listen-actions";
import { RatingStars } from "./rating";
import { ActionRow, Rows, Section } from "./section";
import { AppText } from "./text";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });
const countFormat = new Intl.NumberFormat();

/**
 * Everything below the hero on Today and on an album page: listen buttons,
 * your rating and review, how everyone else rated it, notes and links.
 */
export function AlbumBody({
  album,
  entry,
  colors,
  globalRating,
  notes,
  isToday = false,
}: {
  album: Album;
  /** The history entry, once the album has been generated and (maybe) rated. */
  entry?: NumberedEntry;
  colors: AlbumColors | undefined;
  globalRating?: { average: number; votes?: number } | null;
  notes?: string | null;
  isToday?: boolean;
}) {
  const theme = useTheme();
  const { primary, others } = usePreferredLinks(album);
  const rateOnSite = useRateOnSite();
  const rating = entry?.rating ?? null;
  const yourStars = typeof rating === "number" ? rating : null;
  const delta = yourStars !== null && globalRating ? yourStars - globalRating.average : null;

  return (
    <View style={styles.container}>
      <ListenActions album={album} primary={primary} others={others} accent={colors?.accent ?? theme.colors.accent} />

      <Section title="Your rating" padded={false}>
        <Rows>
          {rating !== null ? (
            <View style={styles.ratingBlock}>
              <RatingStars rating={rating} size={22} />
              {entry?.review ? (
                <View style={styles.review}>
                  <Icon name="quote" size={16} color={theme.colors.textTertiary} />
                  <AppText style={styles.reviewText}>{entry.review}</AppText>
                </View>
              ) : null}
            </View>
          ) : null}
          <ActionRow
            icon="rate"
            label={rating === null ? "Rate on 1001 Albums" : "Edit rating on 1001 Albums"}
            detail={rating === null && isToday ? "Ratings sync back here after you save" : undefined}
            onPress={rateOnSite}
            external
          />
        </Rows>
      </Section>

      {globalRating ? (
        <Section title="Everyone">
          <View style={styles.global}>
            <AppText variant="display" tabular>
              {formatAverage(globalRating.average)}
            </AppText>
            <View style={styles.globalDetail}>
              <RatingStars rating={Math.min(5, Math.max(1, Math.round(globalRating.average))) as 1 | 2 | 3 | 4 | 5} />
              <AppText variant="footnote" tone="secondary">
                {globalRating.votes ? `Average of ${countFormat.format(globalRating.votes)} ratings` : "Average rating"}
              </AppText>
            </View>
          </View>
          {delta !== null && Math.abs(delta) >= 0.25 ? (
            <AppText variant="subheadline" tone="secondary" style={styles.delta}>
              {delta > 0
                ? `You rated it ${delta.toFixed(1)} stars above average.`
                : `You rated it ${Math.abs(delta).toFixed(1)} stars below average.`}
            </AppText>
          ) : null}
        </Section>
      ) : null}

      {notes ? (
        <Section title="Notes">
          <AppText>{notes}</AppText>
        </Section>
      ) : null}

      <Section title="More" padded={false}>
        <Rows>
          {album.wikipediaUrl ? (
            <ActionRow icon="wikipedia" label="Read on Wikipedia" onPress={() => openReader(album.wikipediaUrl!)} external />
          ) : null}
          {album.globalReviewsUrl ? (
            <ActionRow
              icon="globe"
              label="Reviews on 1001 Albums"
              onPress={() => openReader(album.globalReviewsUrl!)}
              external
            />
          ) : null}
          <ActionRow icon="share" label="Share" onPress={() => shareAlbum(album, primary?.url)} />
        </Rows>
      </Section>

      {entry ? (
        <AppText variant="footnote" tone="tertiary" align="center">
          Album {entry.number} · {dateFormat.format(new Date(entry.generatedAt))}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  ratingBlock: {
    gap: 12,
    padding: 16,
  },
  review: {
    flexDirection: "row",
    gap: 8,
  },
  reviewText: {
    flex: 1,
  },
  global: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  globalDetail: {
    gap: 4,
  },
  delta: {
    marginTop: 12,
  },
});
