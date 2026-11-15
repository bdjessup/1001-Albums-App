import { describe, expect, it } from "vitest";

import { projectRaw } from "./__fixtures__/project";
import { currentAlbumNumber, filterHistory, findEntry, numberHistory, sectionByMonth } from "./history";
import { normalizeProject } from "./normalize";

const project = normalizeProject(projectRaw);
const entries = numberHistory(project.history);
const slugs = (list: { album: { slug: string } }[]) => list.map((e) => e.album.slug);

describe("numberHistory", () => {
  it("numbers albums by their API position, so dropped entries leave gaps", () => {
    // Positions 3 and 5 were malformed and dropped.
    expect(entries.map((e) => [e.album.slug, e.number])).toEqual([
      ["channel-orange", 1],
      ["surfer-rosa", 2],
      ["suicide", 4],
      ["whats-the-story-morning-glory", 6],
    ]);
  });

  it("keeps later numbers when an earlier entry goes bad", () => {
    const history = [...projectRaw.history];
    history[0] = { ...history[0]!, generatedAt: "garbage" };
    const numbered = numberHistory(normalizeProject({ ...projectRaw, history }).history);
    expect(numbered.map((e) => e.number)).toEqual([2, 4, 6]);
  });
});

describe("findEntry", () => {
  const first = { ...projectRaw.history[0]! };
  const repeat = { ...first, rating: 3, generatedAt: "2026-10-05T05:00:00.000Z" };
  const repeated = numberHistory(normalizeProject({ ...projectRaw, history: [...projectRaw.history, repeat] }).history);

  it("finds by slug", () => {
    expect(findEntry(entries, "surfer-rosa")?.number).toBe(2);
    expect(findEntry(entries, "nope")).toBeUndefined();
  });

  it("uses the position to tell repeats apart, and defaults to the latest", () => {
    expect(findEntry(repeated, "channel-orange", 1)?.rating).toBe(5);
    expect(findEntry(repeated, "channel-orange", 7)?.rating).toBe(3);
    expect(findEntry(repeated, "channel-orange")?.number).toBe(7);
    expect(findEntry(repeated, "channel-orange", 99)?.number).toBe(7);
  });
});

describe("filterHistory", () => {

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
  it("counts the current album after the last API position", () => {
    expect(currentAlbumNumber(project)).toBe(7);
  });

  it("doesn't double count when the history already ends with it", () => {
    const last = project.history[project.history.length - 1]!;
    expect(currentAlbumNumber({ history: project.history, currentAlbum: last.album })).toBe(6);
  });

  it("is album 1 for a new project and null with no current album", () => {
    expect(currentAlbumNumber({ history: [], currentAlbum: project.currentAlbum })).toBe(1);
    expect(currentAlbumNumber({ history: project.history, currentAlbum: null })).toBeNull();
  });
});
