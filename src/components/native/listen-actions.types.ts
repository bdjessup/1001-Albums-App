import type { StreamingLink } from "@/core/streaming";
import type { Album } from "@/core/types";

export interface ListenActionsProps {
  album: Album;
  primary: StreamingLink | null;
  others: StreamingLink[];
  /** Album-derived colour for the buttons; falls back to the app accent. */
  accent: string;
}
