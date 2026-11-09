import { describe, expect, it } from "vitest";

import { channelOrangeRaw, surferRosaRaw } from "./__fixtures__/project";
import { coverUrl, describeRating, displayGenres, formatAverage, formatGenre, releaseYear } from "./album";
import { normalizeAlbum } from "./normalize";
import { pickStreamingLinks, streamingLinks } from "./streaming";

const channelOrange = normalizeAlbum(channelOrangeRaw)!;
const surferRosa = normalizeAlbum(surferRosaRaw)!;

describe("coverUrl", () => {
  it("picks the smallest cover that is wide enough", () => {
    expect(coverUrl(channelOrange, 50)).toContain("00004851");
    expect(coverUrl(channelOrange, 200)).toContain("00001e02");
    expect(coverUrl(channelOrange, 400)).toContain("0000b273");
  });

  it("falls back to the largest cover", () => {
    expect(coverUrl(channelOrange, 2000)).toContain("0000b273");
    expect(coverUrl({ images: [] }, 100)).toBeUndefined();
  });
});

describe("releaseYear", () => {
  it.each([
    ["2012", 2012],
    ["1967-06-01", 1967],
    ["June 1, 1967", 1967],
    ["", null],
  ])("%j -> %s", (releaseDate, year) => {
    expect(releaseYear({ releaseDate })).toBe(year);
  });
});

describe("formatGenre", () => {
  it.each([
    ["rock", "Rock"],
    ["alternative-r&b", "Alternative R&B"],
    ["hip-hop", "Hip-Hop"],
    ["lgbtq+-hip-hop", "LGBTQ+ Hip-Hop"],
    ["post-punk", "Post-Punk"],
    ["nu-metal", "Nu Metal"],
    ["boston-rock", "Boston Rock"],
  ])("%s -> %s", (input, expected) => {
    expect(formatGenre(input)).toBe(expected);
  });

  it("merges genres and sub-genres without duplicates", () => {
    expect(displayGenres(channelOrange)).toEqual(["Hip-Hop", "Soul", "Pop", "Alternative R&B"]);
  });
});

describe("ratings", () => {
  it("describes ratings and averages", () => {
    expect(describeRating(4)).toBe("4 out of 5");
    expect(describeRating("did-not-listen")).toBe("Didn't listen");
    expect(describeRating(null)).toBe("Not rated");
    expect(formatAverage(3.456)).toBe("3.46");
    expect(formatAverage(null)).toBe("–");
  });
});

describe("streaming links", () => {
  it("builds universal links for every service the album is on", () => {
    const links = streamingLinks(channelOrange);
    expect(links.map((l) => l.id)).toEqual(["spotify", "appleMusic", "youtubeMusic", "tidal", "deezer", "amazonMusic", "qobuz"]);
    expect(links[0]!.url).toBe("https://open.spotify.com/album/623Ef2ZEB3Njklix4PC0Rs");
    expect(links.find((l) => l.id === "tidal")!.url).toBe("https://tidal.com/browse/album/35181031");
    expect(links.find((l) => l.id === "youtubeMusic")!.url).toContain("playlist?list=OLAK5uy_");
  });

  it("puts the preferred service first and falls back when it's missing", () => {
    expect(pickStreamingLinks(channelOrange, "tidal").primary?.id).toBe("tidal");
    const fallback = pickStreamingLinks(surferRosa, "appleMusic");
    expect(fallback.primary?.id).toBe("spotify");
    expect(fallback.others.map((l) => l.id)).not.toContain("spotify");
  });
});
