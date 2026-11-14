import { describe, expect, it } from "vitest";

import { albumStatsRaw, projectRaw } from "./__fixtures__/project";
import liveAlbumStatsRaw from "./__fixtures__/live-album-stats.json";
import { normalizeAlbumStats, normalizeProject } from "./normalize";
import { computeStats, globalRatingFor, LIST_SIZE } from "./stats";
import type { AlbumRating, HistoryEntry } from "./types";

const project = normalizeProject(projectRaw);
const base = project.history[0]!;

/** History entries for the same album with the given ratings, one a day. */
const withRatings = (ratings: AlbumRating[], globalRating: number | null = 3) =>
  ratings.map(
    (rating, i): HistoryEntry => ({
      ...base,
      position: i + 1,
      rating,
      review: null,
      globalRating,
      generatedAt: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
    }),
  );

describe("computeStats", () => {
  const stats = computeStats(project.history, { minGenreRatings: 1 });

  it("summarises progress and ratings", () => {
    expect(stats).toMatchObject({ generated: 4, total: LIST_SIZE, rated: 3, didNotListen: 1, unrated: 0, reviews: 2 });
    expect(stats.average).toBeCloseTo(11 / 3);
    expect(stats.distribution).toEqual([0, 1, 0, 1, 1]);
  });

  it("compares with the global average on the same albums", () => {
    expect(stats.globalAverage).toBeCloseTo((3.9 + 3.7 + 3.6) / 3);
    expect(stats.lovedMoreThanMost.map((d) => d.entry.album.slug)).toEqual(["channel-orange", "surfer-rosa"]);
    expect(stats.likedLessThanMost.map((d) => d.entry.album.slug)).toEqual(["whats-the-story-morning-glory"]);
    expect(stats.likedLessThanMost[0]!.delta).toBeCloseTo(-1.6);
  });

  it("groups by decade and genre", () => {
    expect(stats.decades.map((d) => d.label)).toEqual(["1970s", "1980s", "1990s", "2010s"]);
    expect(stats.genres[0]).toMatchObject({ key: "rock", count: 3, rated: 2 });
    expect(stats.favoriteGenres[0]!.label).toBe("Hip-Hop");
  });

  it("tracks rating streaks", () => {
    expect(stats.longestRatedStreak).toBe(2);
    expect(stats.currentRatedStreak).toBe(1);
  });

  it("handles an empty history", () => {
    expect(computeStats([])).toMatchObject({
      generated: 0,
      total: LIST_SIZE,
      progress: 0,
      rated: 0,
      didNotListen: 0,
      unrated: 0,
      average: null,
      globalAverage: null,
      averageGap: null,
      distribution: [0, 0, 0, 0, 0],
      decades: [],
      genres: [],
      favoriteGenres: [],
      lovedMoreThanMost: [],
      likedLessThanMost: [],
      fiveStars: [],
      longestRatedStreak: 0,
      currentRatedStreak: 0,
    });
  });

  it("handles a history where nothing was listened to", () => {
    const s = computeStats(withRatings(["did-not-listen", "did-not-listen", "did-not-listen"]), { minGenreRatings: 1 });
    expect(s).toMatchObject({ generated: 3, rated: 0, didNotListen: 3, unrated: 0, average: null, globalAverage: null });
    expect(s.distribution).toEqual([0, 0, 0, 0, 0]);
    expect(s.favoriteGenres).toEqual([]);
    expect(s.longestRatedStreak).toBe(0);
    // Genres still count albums that came up, just with nothing rated.
    expect(s.genres.every((g) => g.rated === 0 && g.average === null)).toBe(true);
  });

  it("keeps ties in a stable order", () => {
    // Two albums 1 star above the global average: the earlier one first.
    const history = withRatings([4, 4, 2], 3);
    const s = computeStats(history, { disagreementCount: 5 });
    expect(s.lovedMoreThanMost.map((d) => [d.entry.position, d.delta])).toEqual([
      [1, 1],
      [2, 1],
    ]);
    expect(s.likedLessThanMost.map((d) => d.entry.position)).toEqual([3]);
    expect(s.distribution).toEqual([0, 1, 0, 2, 0]);
  });

  it("ranks tied genre averages by how many ratings back them", () => {
    const genre = (genres: string[]) => (e: HistoryEntry) => ({ ...e, album: { ...e.album, genres } });
    const jazz = withRatings([4]).map(genre(["jazz"]));
    const rock = withRatings([4, 4, 4]).map(genre(["rock"]));
    const s = computeStats([...jazz, ...rock], { minGenreRatings: 1 });
    expect(s.favoriteGenres.map((g) => [g.key, g.average, g.rated])).toEqual([
      ["rock", 4, 3],
      ["jazz", 4, 1],
    ]);
  });

  it("handles albums with no global rating", () => {
    const s = computeStats(withRatings([5, 3, null], null));
    expect(s).toMatchObject({ rated: 2, unrated: 1, globalAverage: null, averageGap: null });
    expect(s.average).toBe(4);
    expect(s.lovedMoreThanMost).toEqual([]);
    expect(s.likedLessThanMost).toEqual([]);
  });

  it("never reports more than 100% done", () => {
    const s = computeStats(withRatings(Array.from({ length: LIST_SIZE + 5 }, () => 3)));
    expect(s.total).toBe(LIST_SIZE + 5);
    expect(s.progress).toBe(1);
  });
});

describe("globalRatingFor", () => {
  const albumStats = normalizeAlbumStats(albumStatsRaw);
  const live = normalizeAlbumStats(liveAlbumStatsRaw);

  it("looks albums up in the global stats", () => {
    expect(globalRatingFor(albumStats, { slug: "all-hope-is-gone", spotifyId: null })).toEqual({ average: 2.51, votes: 1000 });
    expect(globalRatingFor(albumStats, { slug: "nope", spotifyId: null })).toBeNull();
    expect(globalRatingFor(null, { slug: "all-hope-is-gone", spotifyId: null })).toBeNull();
  });

  it("prefers the Spotify id, because slugs repeat across albums", () => {
    // "third" is both Portishead's and Soft Machine's album in the live data.
    const portishead = globalRatingFor(live, { slug: "third", spotifyId: "18JyZd2XLdT2rmekw6EwoS" });
    const softMachine = globalRatingFor(live, { slug: "third", spotifyId: "111J9nxmdhyHSLNHeAL1jO" });
    expect(portishead).not.toBeNull();
    expect(softMachine).not.toBeNull();
    expect(portishead).not.toEqual(softMachine);
    // An ambiguous slug with no id match is no answer rather than a wrong one.
    expect(globalRatingFor(live, { slug: "third", spotifyId: null })).toBeNull();
  });
});
