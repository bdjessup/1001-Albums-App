import { displayGenres, releaseYear } from "./album";
import type { HistoryEntry, Project } from "./types";

export type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5 | "unrated" | "did-not-listen";
export type HistorySort = "newest" | "oldest" | "highest" | "lowest" | "release";

export const RATING_FILTERS: readonly { value: RatingFilter; label: string }[] = [
  { value: "all", label: "All albums" },
  { value: 5, label: "5 stars" },
  { value: 4, label: "4 stars" },
  { value: 3, label: "3 stars" },
  { value: 2, label: "2 stars" },
  { value: 1, label: "1 star" },
  { value: "unrated", label: "Not rated" },
  { value: "did-not-listen", label: "Didn't listen" },
];

export const HISTORY_SORTS: readonly { value: HistorySort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
  { value: "release", label: "Release year" },
];

/** An entry plus its position in the project (1 = first album generated). */
export interface NumberedEntry extends HistoryEntry {
  number: number;
}

export const numberHistory = (history: readonly HistoryEntry[]): NumberedEntry[] =>
  history.map((entry, index) => ({ ...entry, number: index + 1 }));

const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

function matchesQuery(entry: HistoryEntry, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const year = releaseYear(entry.album);
  const haystack = fold(
    [entry.album.name, entry.album.artist, year ?? "", entry.review ?? "", ...displayGenres(entry.album, 20)].join(" "),
  );
  return terms.every((term) => haystack.includes(term));
}

function matchesRating(entry: HistoryEntry, filter: RatingFilter): boolean {
  if (filter === "all") return true;
  if (filter === "unrated") return entry.rating === null;
  return entry.rating === filter;
}

const starValue = (entry: HistoryEntry) => (typeof entry.rating === "number" ? entry.rating : null);

export function filterHistory<T extends HistoryEntry>(
  entries: readonly T[],
  { query = "", rating = "all", sort = "newest" }: { query?: string; rating?: RatingFilter; sort?: HistorySort },
): T[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const filtered = entries.filter((e) => matchesRating(e, rating) && matchesQuery(e, terms));
  const byDate = (a: T, b: T) => Date.parse(a.generatedAt) - Date.parse(b.generatedAt);
  switch (sort) {
    case "oldest":
      return filtered.sort(byDate);
    case "newest":
      return filtered.sort((a, b) => byDate(b, a));
    case "highest":
    case "lowest": {
      const dir = sort === "highest" ? -1 : 1;
      // Unrated albums always sink to the bottom, newest first among ties.
      return filtered.sort((a, b) => {
        const ra = starValue(a);
        const rb = starValue(b);
        if (ra === null && rb === null) return byDate(b, a);
        if (ra === null) return 1;
        if (rb === null) return -1;
        return ra === rb ? byDate(b, a) : (ra - rb) * dir;
      });
    }
    case "release":
      return filtered.sort((a, b) => (releaseYear(a.album) ?? 9999) - (releaseYear(b.album) ?? 9999) || byDate(a, b));
  }
}

export interface HistorySection<T> {
  key: string;
  title: string;
  data: T[];
}

/**
 * Groups entries (already in display order) under month headings such as
 * "November 2026". Only used for date sorts, where months are contiguous.
 */
export function sectionByMonth<T extends HistoryEntry>(entries: readonly T[], locale?: string): HistorySection<T>[] {
  const format = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const sections: HistorySection<T>[] = [];
  for (const entry of entries) {
    const date = new Date(entry.generatedAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = sections[sections.length - 1];
    if (last?.key === key) last.data.push(entry);
    else sections.push({ key, title: format.format(date), data: [entry] });
  }
  return sections;
}

/** The current album counts as album N+1 once N are in the history. */
export function currentAlbumNumber(project: Pick<Project, "history" | "currentAlbum">): number | null {
  if (!project.currentAlbum) return null;
  const last = project.history[project.history.length - 1];
  // Some projects already list today's album as the last history entry.
  if (last && last.album.uuid === project.currentAlbum.uuid) return project.history.length;
  return project.history.length + 1;
}

export function findEntry<T extends HistoryEntry>(entries: readonly T[], slug: string): T | undefined {
  return entries.find((e) => e.album.slug === slug);
}
