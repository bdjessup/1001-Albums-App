import { describe, expect, it } from "vitest";

import { albumStatsRaw, projectRaw } from "./__fixtures__/project";
import { currentAlbumNumber, filterHistory, findEntry, numberHistory, sectionByMonth } from "./history";
import { normalizeAlbumStats, normalizeProject } from "./normalize";
import { computeStats, globalRatingFor } from "./stats";

const project = normalizeProject(projectRaw);
const entries = numberHistory(project.history);
const slugs = (list: { album: { slug: string } }[]) => list.map((e) => e.album.slug);

describe("filterHistory", () => {
  it("numbers albums in generation order", () => {
    expect(entries.map((e) => e.number)).toEqual([1, 2, 3, 4]);
    expect(findEntry(entries, "surfer-rosa")?.number).toBe(2);
  });

  it("sorts newest first by default", () => {
    expect(slugs(filterHistory(entries, {}))).toEqual([
      "whats-the-story-morning-glory",
      "suicide",
      "surfer-rosa",
      "channel-orange",
    ]);
  });

  it("searches across name, artist, year, genre and review, ignoring accents and case", () => {
    expect(slugs(filterHistory(entries, { query: "PIXIES" }))).toEqual(["surfer-rosa"]);
    expect(slugs(filterHistory(entries, { query: "1995" }))).toEqual(["whats-the-story-morning-glory"]);
    expect(slugs(filterHistory(entries, { query: "neo soul" }))).toEqual(["channel-orange"]);
    expect(slugs(filterHistory(entries, { query: "pyrámids" }))).toEqual(["channel-orange"]);
  });

  it("filters by rating", () => {
    expect(slugs(filterHistory(entries, { rating: 5 }))).toEqual(["channel-orange"]);
    expect(slugs(filterHistory(entries, { rating: "did-not-listen" }))).toEqual(["suicide"]);
    expect(filterHistory(entries, { rating: "unrated" })).toEqual([]);
  });

  it("sorts by rating with unrated albums last", () => {
    expect(slugs(filterHistory(entries, { sort: "highest" }))).toEqual([
      "channel-orange",
      "surfer-rosa",
      "whats-the-story-morning-glory",
      "suicide",
    ]);
    expect(slugs(filterHistory(entries, { sort: "lowest" }))[0]).toBe("whats-the-story-morning-glory");
  });

  it("sorts by release year", () => {
    expect(slugs(filterHistory(entries, { sort: "release" }))).toEqual([
      "suicide",
      "surfer-rosa",
      "whats-the-story-morning-glory",
      "channel-orange",
    ]);
  });
});

describe("sectionByMonth", () => {
  it("groups contiguous months", () => {
    const sections = sectionByMonth(filterHistory(entries, {}), "en-US");
    expect(sections.map((s) => [s.title, s.data.length])).toEqual([
      ["October 2026", 3],
      ["September 2026", 1],
    ]);
  });
});

describe("currentAlbumNumber", () => {
  it("counts the current album after the history", () => {
    expect(currentAlbumNumber(project)).toBe(5);
  });

  it("doesn't double count when the history already ends with it", () => {
    const last = project.history[project.history.length - 1]!;
    expect(currentAlbumNumber({ history: project.history, currentAlbum: last.album })).toBe(4);
  });
});

describe("computeStats", () => {
  const stats = computeStats(project.history, { minGenreRatings: 1 });

  it("summarises progress and ratings", () => {
    expect(stats).toMatchObject({ generated: 4, total: 1001, rated: 3, didNotListen: 1, unrated: 0, reviews: 2 });
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

  it("uses the generator's pool size when album stats are loaded", () => {
    const albumStats = normalizeAlbumStats(albumStatsRaw);
    expect(computeStats(project.history, { albumStats }).total).toBe(4);
    expect(globalRatingFor(albumStats, { slug: "all-hope-is-gone", spotifyId: null })).toEqual({ average: 2.51, votes: 1000 });
    expect(globalRatingFor(albumStats, { slug: "nope", spotifyId: null })).toBeNull();
  });
});
