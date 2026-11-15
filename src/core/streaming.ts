import type { Album } from "./types";

export type StreamingServiceId =
  | "spotify"
  | "appleMusic"
  | "youtubeMusic"
  | "tidal"
  | "deezer"
  | "amazonMusic"
  | "qobuz";

export interface StreamingService {
  id: StreamingServiceId;
  name: string;
  /**
   * Universal/App Links: they open the service's app when it is installed and
   * fall back to the web player otherwise, on both iOS and Android, without
   * any custom-scheme allowlisting.
   */
  url: (id: string) => string;
  albumId: (album: Album) => string | null;
}

export const STREAMING_SERVICES: readonly StreamingService[] = [
  {
    id: "spotify",
    name: "Spotify",
    url: (id) => `https://open.spotify.com/album/${encodeURIComponent(id)}`,
    albumId: (a) => a.spotifyId,
  },
  {
    id: "appleMusic",
    name: "Apple Music",
    url: (id) => `https://music.apple.com/album/${encodeURIComponent(id)}`,
    albumId: (a) => a.appleMusicId,
  },
  {
    id: "youtubeMusic",
    name: "YouTube Music",
    url: (id) => `https://music.youtube.com/playlist?list=${encodeURIComponent(id)}`,
    albumId: (a) => a.youtubeMusicId,
  },
  {
    id: "tidal",
    name: "Tidal",
    url: (id) => `https://tidal.com/browse/album/${encodeURIComponent(id)}`,
    albumId: (a) => a.tidalId,
  },
  {
    id: "deezer",
    name: "Deezer",
    url: (id) => `https://www.deezer.com/album/${encodeURIComponent(id)}`,
    albumId: (a) => a.deezerId,
  },
  {
    id: "amazonMusic",
    name: "Amazon Music",
    url: (id) => `https://music.amazon.com/albums/${encodeURIComponent(id)}`,
    albumId: (a) => a.amazonMusicId,
  },
  {
    id: "qobuz",
    name: "Qobuz",
    url: (id) => `https://open.qobuz.com/album/${encodeURIComponent(id)}`,
    albumId: (a) => a.qobuzId,
  },
];

export const DEFAULT_STREAMING_SERVICE: StreamingServiceId = "spotify";

export const isStreamingServiceId = (value: unknown): value is StreamingServiceId =>
  STREAMING_SERVICES.some((s) => s.id === value);

export const serviceName = (id: StreamingServiceId) => STREAMING_SERVICES.find((s) => s.id === id)?.name ?? id;

export interface StreamingLink {
  id: StreamingServiceId;
  name: string;
  url: string;
}

/** Links for every service that has this album, in the canonical order. */
export function streamingLinks(album: Album): StreamingLink[] {
  return STREAMING_SERVICES.flatMap((service) => {
    const id = service.albumId(album);
    return id ? [{ id: service.id, name: service.name, url: service.url(id) }] : [];
  });
}

/**
 * The link for the person's preferred service, or the first available one if
 * this album isn't on it. `others` keeps the canonical order minus `primary`.
 */
export function pickStreamingLinks(album: Album, preferred: StreamingServiceId) {
  const links = streamingLinks(album);
  const primary = links.find((l) => l.id === preferred) ?? links[0] ?? null;
  return { primary, others: links.filter((l) => l !== primary) };
}
