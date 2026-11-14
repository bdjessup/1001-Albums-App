import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { getColors } from "react-native-image-colors";

import { coverUrl } from "@/core/album";
import { pickAccent } from "@/core/color";
import type { Album } from "@/core/types";
import { albumColorsAtom } from "./atoms";

export interface AlbumColors {
  /** The cover's overall colour, for backdrops. */
  background: string;
  /** A saturated colour from the cover, legible under white text. */
  accent: string;
}

async function extractColors(url: string): Promise<AlbumColors> {
  const result = await getColors(url, { fallback: "#222222", cache: true, key: url, quality: "low", pixelSpacing: 5 });
  switch (result.platform) {
    case "ios":
      return {
        background: result.background,
        accent: pickAccent([result.primary, result.secondary, result.detail, result.background]) ?? result.primary,
      };
    case "android":
    case "web":
      return {
        background: result.dominant,
        accent:
          pickAccent([result.vibrant, result.darkVibrant, result.muted, result.lightVibrant, result.dominant]) ??
          result.dominant,
      };
  }
}

/**
 * Colours sampled from an album's cover (on-device, via the native image
 * colour APIs). Cached forever per cover URL, and persisted with the rest of
 * the query cache. Returns undefined while loading or when turned off.
 */
export function useAlbumColors(album: Pick<Album, "images"> | null | undefined): AlbumColors | undefined {
  const enabled = useAtomValue(albumColorsAtom);
  // The small cover is plenty for colour sampling and much faster to decode.
  const url = album ? coverUrl(album, 200) : undefined;
  const { data } = useQuery({
    queryKey: ["albumColors", url],
    queryFn: () => extractColors(url!),
    enabled: enabled && !!url,
    staleTime: Infinity,
    retry: false,
  });
  return enabled ? data : undefined;
}
