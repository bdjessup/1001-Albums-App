/**
 * Shapes returned by the 1001 Albums Generator public API
 * (https://1001albumsgenerator.com/api/v1). The API is read-only and
 * unauthenticated; ratings and reviews can only be written on the website.
 *
 * Field names follow the API exactly. Anything the API has been seen to omit
 * or null is typed as optional/nullable, and `normalize.ts` fills the gaps so
 * the rest of the app can rely on these types.
 */

export interface AlbumImage {
  url: string;
  width: number;
  height: number;
}

export interface Album {
  uuid: string;
  name: string;
  slug: string;
  artist: string;
  /** "us", "uk", "other" or another country-ish code. */
  artistOrigin: string | null;
  /** Usually a year ("1977"), sometimes a full date. */
  releaseDate: string;
  genres: string[];
  subGenres: string[];
  /** Spotify CDN covers, typically 640, 300 and 64 px. */
  images: AlbumImage[];
  globalReviewsUrl: string | null;
  wikipediaUrl: string | null;
  spotifyId: string | null;
  appleMusicId: string | null;
  /** The API sends this as a number; normalised to a string. */
  tidalId: string | null;
  amazonMusicId: string | null;
  youtubeMusicId: string | null;
  qobuzId: string | null;
  deezerId: string | null;
}

/** A 1–5 star rating, "did-not-listen", or null while unrated. */
export type AlbumRating = 1 | 2 | 3 | 4 | 5 | "did-not-listen" | null;

export interface HistoryEntry {
  /**
   * 1-based position in the API's history array (oldest first), counted
   * before malformed entries are dropped, so one bad entry can't shift the
   * album numbers that follow it.
   */
  position: number;
  album: Album;
  /** The API omits `rating` entirely while an album is unrated. */
  rating: AlbumRating;
  review: string | null;
  /** ISO timestamp of the day the album was generated for this project. */
  generatedAt: string;
  /** Average rating across every project that rated this album. */
  globalRating: number | null;
  revealedAlbum: boolean;
}

export type UpdateFrequency = "daily" | "dailyWithWeekends" | (string & {});

export interface Project {
  name: string;
  /** e.g. https://1001albumsgenerator.com/shares/<id> */
  shareableUrl: string | null;
  /**
   * The API has no project-level flag for group members: a project in a group
   * reports `group.paused`, and that is what's used here.
   */
  paused: boolean;
  updateFrequency: UpdateFrequency;
  currentAlbum: Album | null;
  currentAlbumNotes: string | null;
  /** Oldest first, as sent by the API. */
  history: HistoryEntry[];
}

/**
 * One album from `GET /albums/stats`: global figures across every project.
 * The response covers every album that has been in any edition of the list
 * (1,101 in Nov 2026), so its length is not the size of a project's pool.
 */
export interface AlbumStatEntry {
  name: string;
  artist: string;
  /** Not unique: "third" is both Portishead's and Soft Machine's. */
  slug: string;
  spotifyId: string | null;
  averageRating: number;
  votes: number;
  /** How split opinion is; higher = more divisive. */
  controversialScore: number | null;
}

export interface AlbumStats {
  albums: AlbumStatEntry[];
}
