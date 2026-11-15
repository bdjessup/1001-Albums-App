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
  album: Album;
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
  shareableUrl: string | null;
  paused: boolean;
  updateFrequency: UpdateFrequency;
  currentAlbum: Album | null;
  currentAlbumNotes: string | null;
  /** Oldest first, as sent by the API. */
  history: HistoryEntry[];
}

export interface AlbumStatEntry {
  albumName: string;
  albumArtist: string;
  albumSlug: string;
  albumSpotifyId: string | null;
  albumCoverUrl: string | null;
  averageRating: number;
  totalRating: number;
  totalVotes: number;
  globalAverageRating: number;
  globalTotalRating: number;
  globalTotalVotes: number;
}

export interface AlbumStats {
  stats: AlbumStatEntry[];
}
