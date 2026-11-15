import type { Album, AlbumRating } from "./types";

/**
 * Picks the smallest cover at least `minWidth` px wide (images are sorted
 * largest first by normalize), falling back to the largest available.
 */
export function coverUrl(album: Pick<Album, "images">, minWidth: number): string | undefined {
  const { images } = album;
  if (images.length === 0) return undefined;
  let best = images[0]!;
  for (const image of images) {
    if (image.width >= minWidth && image.width < best.width) best = image;
  }
  return best.url;
}

/** Every cover size, for expo-image to choose from by layout size. */
export function coverSources(album: Pick<Album, "images">) {
  return album.images.map((image) => ({ uri: image.url, width: image.width, height: image.height }));
}

export function releaseYear(album: Pick<Album, "releaseDate">): number | null {
  const match = album.releaseDate.match(/\b(1[89]\d\d|20\d\d)\b/);
  return match ? Number(match[1]) : null;
}

export const decadeOf = (year: number) => Math.floor(year / 10) * 10;

export const formatDecade = (decade: number) => `${decade}s`;

const GENRE_WORDS: Record<string, string> = {
  "r&b": "R&B",
  "lgbtq+": "LGBTQ+",
  uk: "UK",
  us: "US",
  edm: "EDM",
  idm: "IDM",
  mpb: "MPB",
  dj: "DJ",
  "nu-metal": "Nu Metal",
  "hip-hop": "Hip-Hop",
  "lo-fi": "Lo-Fi",
  "post-punk": "Post-Punk",
  "post-rock": "Post-Rock",
  "post-hardcore": "Post-Hardcore",
  "trip-hop": "Trip-Hop",
  "j-pop": "J-Pop",
  "k-pop": "K-Pop",
  "singer-songwriter": "Singer-Songwriter",
};

/** "alternative-r&b" -> "Alternative R&B", "hip-hop" -> "Hip-Hop". */
export function formatGenre(genre: string): string {
  const whole = GENRE_WORDS[genre.toLowerCase()];
  if (whole) return whole;
  // Keep known hyphenated compounds together, split the rest on hyphens.
  let rest = genre.toLowerCase();
  const parts: string[] = [];
  outer: while (rest.length > 0) {
    for (const [key, label] of Object.entries(GENRE_WORDS)) {
      if (key.includes("-") && (rest === key || rest.startsWith(`${key}-`))) {
        parts.push(label);
        rest = rest.slice(key.length + 1);
        continue outer;
      }
    }
    const [word = "", ...tail] = rest.split("-");
    parts.push(GENRE_WORDS[word] ?? word.charAt(0).toUpperCase() + word.slice(1));
    rest = tail.join("-");
  }
  return parts.join(" ");
}

/** Genres first, then sub-genres that add something, without duplicates. */
export function displayGenres(album: Pick<Album, "genres" | "subGenres">, max = 4): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const genre of [...album.genres, ...album.subGenres]) {
    const label = formatGenre(genre);
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= max) break;
  }
  return out;
}

export const isStarRating = (rating: AlbumRating): rating is 1 | 2 | 3 | 4 | 5 => typeof rating === "number";

export function describeRating(rating: AlbumRating): string {
  if (rating === "did-not-listen") return "Didn't listen";
  if (rating === null) return "Not rated";
  return `${rating} out of 5`;
}

/** 3.456 -> "3.46"; null -> "–". */
export const formatAverage = (value: number | null | undefined, digits = 2) =>
  value == null || !Number.isFinite(value) ? "–" : value.toFixed(digits);
