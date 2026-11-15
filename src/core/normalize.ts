import type { Album, AlbumImage, AlbumRating, AlbumStatEntry, AlbumStats, HistoryEntry, Project } from "./types";

/**
 * Turns raw API JSON into the app's types. The API is third-party and loosely
 * typed (tidalId arrives as a number, subGenres can be null, fields have come
 * and gone), so everything is checked here once instead of at every use.
 * Anything malformed enough to be unusable throws an `InvalidResponseError`.
 */

export class InvalidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidResponseError";
  }
}

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const str = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : typeof value === "number" ? String(value) : null;

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.length > 0) : [];

const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

function normalizeImages(value: unknown): AlbumImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isObject)
    .map((img) => ({ url: str(img.url) ?? "", width: num(img.width) ?? 0, height: num(img.height) ?? 0 }))
    .filter((img) => img.url.startsWith("http"))
    .sort((a, b) => b.width - a.width);
}

export function normalizeAlbum(value: unknown): Album | null {
  if (!isObject(value)) return null;
  const name = str(value.name);
  const artist = str(value.artist);
  if (!name || !artist) return null;
  const slug = str(value.slug) ?? slugify(`${artist} ${name}`);
  return {
    uuid: str(value.uuid) ?? slug,
    name,
    slug,
    artist,
    artistOrigin: str(value.artistOrigin),
    releaseDate: str(value.releaseDate) ?? "",
    genres: strings(value.genres),
    subGenres: strings(value.subGenres),
    images: normalizeImages(value.images),
    globalReviewsUrl: str(value.globalReviewsUrl),
    wikipediaUrl: str(value.wikipediaUrl),
    spotifyId: str(value.spotifyId),
    appleMusicId: str(value.appleMusicId),
    tidalId: str(value.tidalId),
    amazonMusicId: str(value.amazonMusicId),
    youtubeMusicId: str(value.youtubeMusicId),
    qobuzId: str(value.qobuzId),
    deezerId: str(value.deezerId),
  };
}

export function normalizeRating(value: unknown): AlbumRating {
  if (value === "did-not-listen") return "did-not-listen";
  const n = typeof value === "string" ? Number(value) : value;
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return n;
  return null;
}

function normalizeHistoryEntry(value: unknown): HistoryEntry | null {
  if (!isObject(value)) return null;
  const album = normalizeAlbum(value.album);
  const generatedAt = str(value.generatedAt);
  if (!album || !generatedAt || Number.isNaN(Date.parse(generatedAt))) return null;
  return {
    album,
    rating: normalizeRating(value.rating),
    review: str(value.review)?.trim() || null,
    generatedAt,
    globalRating: num(value.globalRating),
    revealedAlbum: value.revealedAlbum === true,
  };
}

export function normalizeProject(value: unknown): Project {
  if (!isObject(value)) throw new InvalidResponseError("Project response was not an object");
  const name = str(value.name);
  if (!name) throw new InvalidResponseError("Project response had no name");
  const history = Array.isArray(value.history)
    ? value.history
        .map(normalizeHistoryEntry)
        .filter((e): e is HistoryEntry => e !== null)
        .sort((a, b) => Date.parse(a.generatedAt) - Date.parse(b.generatedAt))
    : [];
  return {
    name,
    shareableUrl: str(value.shareableUrl),
    paused: value.paused === true,
    updateFrequency: str(value.updateFrequency) ?? "daily",
    currentAlbum: normalizeAlbum(value.currentAlbum),
    currentAlbumNotes: str(value.currentAlbumNotes)?.trim() || null,
    history,
  };
}

function normalizeStatEntry(value: unknown): AlbumStatEntry | null {
  if (!isObject(value)) return null;
  const albumSlug = str(value.albumSlug);
  const albumName = str(value.albumName);
  if (!albumSlug || !albumName) return null;
  return {
    albumName,
    albumArtist: str(value.albumArtist) ?? "",
    albumSlug,
    albumSpotifyId: str(value.albumSpotifyId),
    albumCoverUrl: str(value.albumCoverUrl),
    averageRating: num(value.averageRating) ?? 0,
    totalRating: num(value.totalRating) ?? 0,
    totalVotes: num(value.totalVotes) ?? 0,
    globalAverageRating: num(value.globalAverageRating) ?? 0,
    globalTotalRating: num(value.globalTotalRating) ?? 0,
    globalTotalVotes: num(value.globalTotalVotes) ?? 0,
  };
}

export function normalizeAlbumStats(value: unknown): AlbumStats {
  if (!isObject(value) || !Array.isArray(value.stats)) {
    throw new InvalidResponseError("Album stats response had no stats array");
  }
  return { stats: value.stats.map(normalizeStatEntry).filter((e): e is AlbumStatEntry => e !== null) };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
