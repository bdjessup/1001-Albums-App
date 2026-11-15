import { describe, expect, it } from "vitest";

import { albumStatsRaw, channelOrangeRaw, projectRaw } from "./__fixtures__/project";
import { InvalidResponseError, normalizeAlbum, normalizeAlbumStats, normalizeProject, normalizeRating } from "./normalize";

describe("normalizeAlbum", () => {
  it("coerces numeric ids to strings and sorts covers largest first", () => {
    const album = normalizeAlbum(channelOrangeRaw)!;
    expect(album.tidalId).toBe("35181031");
    expect(album.images.map((i) => i.width)).toEqual([640, 300, 64]);
    expect(album.subGenres).toContain("neo-soul");
  });

  it("treats null sub-genres as empty and rejects albums without a name", () => {
    expect(normalizeAlbum({ ...channelOrangeRaw, subGenres: null })!.subGenres).toEqual([]);
    expect(normalizeAlbum({ artist: "Nobody" })).toBeNull();
    expect(normalizeAlbum(null)).toBeNull();
  });
});

describe("normalizeRating", () => {
  it.each([
    [5, 5],
    ["3", 3],
    ["did-not-listen", "did-not-listen"],
    [0, null],
    [6, null],
    [null, null],
    [undefined, null],
  ])("%s -> %s", (input, expected) => {
    expect(normalizeRating(input)).toBe(expected);
  });
});

describe("normalizeProject", () => {
  const project = normalizeProject(projectRaw);

  it("sorts history oldest first and drops unusable entries", () => {
    expect(project.history.map((e) => e.album.slug)).toEqual([
      "channel-orange",
      "surfer-rosa",
      "suicide",
      "whats-the-story-morning-glory",
    ]);
  });

  it("trims reviews and blanks out whitespace-only notes", () => {
    expect(project.history[0]!.review).toBe("Pyramids!");
    expect(project.history[1]!.review).toBeNull();
    expect(project.currentAlbumNotes).toBeNull();
  });

  it("keeps the current album and project flags", () => {
    expect(project.currentAlbum?.slug).toBe("all-hope-is-gone");
    expect(project.paused).toBe(false);
    expect(project.updateFrequency).toBe("dailyWithWeekends");
  });

  it("throws on payloads that are not a project", () => {
    expect(() => normalizeProject({ error: "nope" })).toThrow(InvalidResponseError);
    expect(() => normalizeProject("<html>")).toThrow(InvalidResponseError);
  });
});

describe("normalizeAlbumStats", () => {
  it("keeps valid entries only", () => {
    const stats = normalizeAlbumStats(albumStatsRaw);
    expect(stats.stats).toHaveLength(1);
    expect(stats.stats[0]!.globalAverageRating).toBe(2.51);
  });

  it("throws without a stats array", () => {
    expect(() => normalizeAlbumStats({})).toThrow(InvalidResponseError);
  });
});
