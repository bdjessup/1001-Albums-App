import { decadeOf, formatGenre, releaseYear } from "./album";
import type { AlbumStats, HistoryEntry } from "./types";

/** The list's nominal size; the generator's pool is used when known. */
export const LIST_SIZE = 1001;

export interface GroupStat {
  key: string;
  label: string;
  count: number;
  rated: number;
  average: number | null;
}

export interface Disagreement {
  entry: HistoryEntry;
  /** Your rating minus the global average: positive = you liked it more. */
  delta: number;
}

export interface ProjectStats {
  generated: number;
  total: number;
  progress: number;
  rated: number;
  didNotListen: number;
  unrated: number;
  average: number | null;
  /** Mean global rating of the albums you rated, for a like-for-like compare. */
  globalAverage: number | null;
  /** Count of 1..5 star ratings, index 0 = 1 star. */
  distribution: [number, number, number, number, number];
  reviews: number;
  decades: GroupStat[];
  genres: GroupStat[];
  /** Genres with enough ratings to judge, best first. */
  favoriteGenres: GroupStat[];
  lovedMoreThanMost: Disagreement[];
  likedLessThanMost: Disagreement[];
  /** Mean absolute gap between your ratings and the global average. */
  averageGap: number | null;
  fiveStars: HistoryEntry[];
  /** Longest run of consecutive albums you rated (not skipped). */
  longestRatedStreak: number;
  currentRatedStreak: number;
}

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

function groupBy(entries: HistoryEntry[], keysOf: (entry: HistoryEntry) => { key: string; label: string }[]): GroupStat[] {
  const groups = new Map<string, { label: string; count: number; ratings: number[] }>();
  for (const entry of entries) {
    for (const { key, label } of keysOf(entry)) {
      const group = groups.get(key) ?? { label, count: 0, ratings: [] };
      group.count += 1;
      if (typeof entry.rating === "number") group.ratings.push(entry.rating);
      groups.set(key, group);
    }
  }
  return [...groups.entries()].map(([key, g]) => ({
    key,
    label: g.label,
    count: g.count,
    rated: g.ratings.length,
    average: mean(g.ratings),
  }));
}

export function computeStats(
  history: readonly HistoryEntry[],
  options: { albumStats?: AlbumStats | null; minGenreRatings?: number; disagreementCount?: number } = {},
): ProjectStats {
  const { albumStats, minGenreRatings = 3, disagreementCount = 5 } = options;
  const entries = [...history];
  const rated = entries.filter((e): e is HistoryEntry & { rating: 1 | 2 | 3 | 4 | 5 } => typeof e.rating === "number");
  const distribution: ProjectStats["distribution"] = [0, 0, 0, 0, 0];
  for (const e of rated) distribution[(e.rating - 1) as 0 | 1 | 2 | 3 | 4] += 1;

  const total = Math.max(albumStats?.stats.length || LIST_SIZE, entries.length);

  const decades = groupBy(entries, (e) => {
    const year = releaseYear(e.album);
    if (year === null) return [];
    const decade = decadeOf(year);
    return [{ key: String(decade), label: `${decade}s` }];
  }).sort((a, b) => Number(a.key) - Number(b.key));

  const genres = groupBy(entries, (e) => e.album.genres.map((g) => ({ key: g, label: formatGenre(g) }))).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );

  const favoriteGenres = genres
    .filter((g) => g.rated >= minGenreRatings && g.average !== null)
    .sort((a, b) => b.average! - a.average! || b.rated - a.rated);

  const comparable = rated.filter((e) => e.globalRating !== null);
  const disagreements = comparable.map((entry) => ({ entry, delta: entry.rating - entry.globalRating! }));
  const lovedMoreThanMost = disagreements
    .filter((d) => d.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, disagreementCount);
  const likedLessThanMost = disagreements
    .filter((d) => d.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, disagreementCount);

  let longest = 0;
  let run = 0;
  for (const e of entries) {
    run = typeof e.rating === "number" ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  return {
    generated: entries.length,
    total,
    progress: total > 0 ? Math.min(1, entries.length / total) : 0,
    rated: rated.length,
    didNotListen: entries.filter((e) => e.rating === "did-not-listen").length,
    unrated: entries.filter((e) => e.rating === null).length,
    average: mean(rated.map((e) => e.rating)),
    globalAverage: mean(comparable.map((e) => e.globalRating!)),
    distribution,
    reviews: entries.filter((e) => e.review).length,
    decades,
    genres,
    favoriteGenres,
    lovedMoreThanMost,
    likedLessThanMost,
    averageGap: mean(disagreements.map((d) => Math.abs(d.delta))),
    fiveStars: rated.filter((e) => e.rating === 5).reverse(),
    longestRatedStreak: longest,
    currentRatedStreak: run,
  };
}

/** Global average for one album, looked up by slug (then Spotify id). */
export function globalRatingFor(
  albumStats: AlbumStats | null | undefined,
  album: { slug: string; spotifyId: string | null },
): { average: number; votes: number } | null {
  const entry =
    albumStats?.stats.find((s) => s.albumSlug === album.slug) ??
    (album.spotifyId ? albumStats?.stats.find((s) => s.albumSpotifyId === album.spotifyId) : undefined);
  if (!entry || entry.globalTotalVotes === 0) return null;
  return { average: entry.globalAverageRating, votes: entry.globalTotalVotes };
}
