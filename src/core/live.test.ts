import { describe, expect, it } from "vitest";

import liveAlbumStatsRaw from "./__fixtures__/live-album-stats.json";
import liveProjectRaw from "./__fixtures__/live-project.json";
import { currentAlbumNumber, numberHistory } from "./history";
import { normalizeAlbumStats, normalizeProject } from "./normalize";

/**
 * Trimmed real responses, fetched 14 Nov 2026:
 * - GET /api/v1/projects/grouptestone (a public test project in the "test"
 *   group), keeping 6 of its 272 history entries.
 * - GET /api/v1/albums/stats, keeping 4 of its 1,101 albums.
 * Everything else in each object is as the API sent it.
 */
describe("live project response", () => {
  const project = normalizeProject(liveProjectRaw);

  it("parses every entry", () => {
    expect(project.name).toBe("grouptestone");
    expect(project.history).toHaveLength(liveProjectRaw.history.length);
    expect(project.shareableUrl).toMatch(/^https:\/\/1001albumsgenerator\.com\/shares\/[0-9a-f]+$/);
  });

  it("reads paused and schedule from the group, which is all the API sends", () => {
    expect("paused" in liveProjectRaw).toBe(false);
    expect(project.paused).toBe(true);
    expect(project.updateFrequency).toBe("dailyWithWeekends");
  });

  it("treats an omitted rating as unrated and keeps did-not-listen and stars", () => {
    expect(project.history.map((e) => e.rating)).toEqual(["did-not-listen", "did-not-listen", null, null, 3, null]);
    expect(project.history.every((e) => e.review === null)).toBe(true);
    expect(project.currentAlbumNotes).toBeNull();
  });

  it("keeps the API's oldest-first order", () => {
    const dates = project.history.map((e) => e.generatedAt);
    expect([...dates].sort()).toEqual(dates);
    expect(project.history.map((e) => e.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("parses albums: numeric tidalId, covers largest first, year-only release dates", () => {
    const album = project.currentAlbum!;
    expect(album.name).toBe("Bryter Layter");
    expect(album.tidalId).toBe("313954106");
    expect(album.releaseDate).toBe("1971");
    expect(album.images.map((i) => i.width)).toEqual([640, 300, 64]);
    expect(album.globalReviewsUrl).toBe(
      "https://1001albumsgenerator.com/albums/7w9Og10Tdkh3nqrVD1D5IW/bryter-layter",
    );
    expect(project.history.every((e) => typeof e.globalRating === "number")).toBe(true);
  });

  it("numbers a repeated album separately each time it came up", () => {
    const numbered = numberHistory(project.history).filter((e) => e.album.slug === "hounds-of-love");
    expect(numbered.map((e) => e.number)).toEqual([2, 4]);
    // Today's album isn't in the history yet.
    expect(currentAlbumNumber(project)).toBe(7);
  });
});

describe("live album stats response", () => {
  const stats = normalizeAlbumStats(liveAlbumStatsRaw);

  it("parses every album", () => {
    expect(stats.albums).toHaveLength(liveAlbumStatsRaw.albums.length);
    expect(stats.albums.find((a) => a.slug === "rumours")).toMatchObject({
      artist: "Fleetwood Mac",
      spotifyId: "63k57x0qOkUWEMR0dkMivh",
      averageRating: 4.45,
    });
    expect(stats.albums.every((a) => a.votes > 0)).toBe(true);
  });
});
