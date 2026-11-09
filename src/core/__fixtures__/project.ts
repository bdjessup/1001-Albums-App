/**
 * API-shaped fixtures. Album payloads are copied from real responses (via the
 * albums-generator-client test suite), including quirks such as numeric
 * tidalId values and null subGenres.
 */

export const channelOrangeRaw = {
  uuid: "5f34ee8bf0857e55ed2ebcb2",
  artist: "Frank Ocean",
  artistOrigin: "us",
  images: [
    { height: 300, url: "https://i.scdn.co/image/ab67616d00001e02f11f1c4ad183b7fa625f8534", width: 300 },
    { height: 640, url: "https://i.scdn.co/image/ab67616d0000b273f11f1c4ad183b7fa625f8534", width: 640 },
    { height: 64, url: "https://i.scdn.co/image/ab67616d00004851f11f1c4ad183b7fa625f8534", width: 64 },
  ],
  genres: ["hip-hop", "soul", "pop"],
  subGenres: ["alternative-r&b", "hip-hop", "lgbtq+-hip-hop", "neo-soul", "pop"],
  name: "Channel Orange",
  slug: "channel-orange",
  releaseDate: "2012",
  globalReviewsUrl: "https://1001albumsgenerator.com/albums/623Ef2ZEB3Njklix4PC0Rs/channel-orange",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Channel_Orange",
  spotifyId: "623Ef2ZEB3Njklix4PC0Rs",
  appleMusicId: "1440765580",
  tidalId: 35181031,
  amazonMusicId: "B07GJ9XQH9",
  youtubeMusicId: "OLAK5uy_ltvAnceM9UdipqjI7-fJpcE5nZmvlZT9s",
  qobuzId: "v0kr9kd1oh9cc",
  deezerId: "9908666",
};

const album = (overrides: Record<string, unknown>) => ({ ...channelOrangeRaw, ...overrides });

export const surferRosaRaw = album({
  uuid: "5f34ee8bf0857e55ed5ebebb",
  artist: "Pixies",
  genres: ["rock", "indie"],
  subGenres: ["alternative-rock", "boston-rock", "modern-rock", "permanent-wave", "rock"],
  name: "Surfer Rosa",
  slug: "surfer-rosa",
  releaseDate: "1988",
  spotifyId: "2l7RPWC3E6eStJJLBsUeCI",
  appleMusicId: null,
});

export const suicideRaw = album({
  uuid: "5f34ee8bf0857e55ed5ebded",
  artist: "Suicide",
  genres: ["rock", "punk", "electronica", "post-punk"],
  subGenres: null,
  name: "Suicide",
  slug: "suicide",
  releaseDate: "1977",
});

export const morningGloryRaw = album({
  uuid: "5f34ee8bf0857e55ed5ebefe",
  artist: "Oasis",
  artistOrigin: "uk",
  genres: ["rock", "britpop", "indie"],
  subGenres: ["beatlesque", "britpop", "madchester", "permanent-wave", "rock"],
  name: "(What's the Story) Morning Glory?",
  slug: "whats-the-story-morning-glory",
  releaseDate: "1995",
});

export const allHopeIsGoneRaw = album({
  uuid: "5f34ee8bf0857e55ed5ebdeb",
  artist: "Slipknot",
  genres: ["metal"],
  subGenres: ["alternative-metal", "nu-metal", "rap-metal"],
  name: "All Hope Is Gone",
  slug: "all-hope-is-gone",
  releaseDate: "2008",
});

export const projectRaw = {
  name: "liner-test",
  shareableUrl: "https://1001albumsgenerator.com/shareable/liner-test",
  paused: false,
  updateFrequency: "dailyWithWeekends",
  currentAlbum: allHopeIsGoneRaw,
  currentAlbumNotes: "  ",
  // Deliberately out of order: normalize sorts oldest first.
  history: [
    { album: morningGloryRaw, rating: 2, review: "Fine.", revealedAlbum: true, generatedAt: "2026-10-04T05:00:00.000Z", globalRating: 3.6 },
    { album: suicideRaw, rating: "did-not-listen", revealedAlbum: true, generatedAt: "2026-10-03T05:00:00.000Z", globalRating: 2.9 },
    { album: channelOrangeRaw, rating: 5, review: "  Pyramids!  ", revealedAlbum: true, generatedAt: "2026-09-30T05:00:00.000Z", globalRating: 3.9 },
    { album: surferRosaRaw, rating: 4, revealedAlbum: true, generatedAt: "2026-10-01T05:00:00.000Z", globalRating: 3.7 },
    { album: suicideRaw, rating: null, revealedAlbum: false, generatedAt: "not a date", globalRating: null },
    { album: { name: "Broken" }, rating: 3, generatedAt: "2026-10-02T05:00:00.000Z" },
  ],
};

export const albumStatsRaw = {
  stats: [
    {
      albumName: "All Hope Is Gone",
      albumArtist: "Slipknot",
      albumSlug: "all-hope-is-gone",
      albumSpotifyId: "0hFWapnP7orzXCMwNU5DuA",
      albumCoverUrl: null,
      averageRating: 2.4,
      totalRating: 240,
      totalVotes: 100,
      globalAverageRating: 2.51,
      globalTotalRating: 2510,
      globalTotalVotes: 1000,
    },
    { albumName: "Broken entry" },
  ],
};
