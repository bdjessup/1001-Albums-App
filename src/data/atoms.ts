import { atom, createStore } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import Storage from "expo-sqlite/kv-store";

import type { HistorySort, RatingFilter } from "@/core/history";
import { DEFAULT_STREAMING_SERVICE, type StreamingServiceId } from "@/core/streaming";

/**
 * Explicit store so non-React code (query callbacks, deep-link handlers) can
 * read and write the same atoms the UI uses.
 */
export const appStore = createStore();

/**
 * Settings live in expo-sqlite's key-value store and are read synchronously
 * on first access. That means the app knows on its first frame whether a
 * project is connected, so there's no flash of the onboarding screen.
 */
function persisted<T>(key: string, initialValue: T) {
  const storage = createJSONStorage<T>(() => ({
    getItem: (k) => Storage.getItemSync(k),
    setItem: (k, v) => Storage.setItemSync(k, v),
    removeItem: (k) => {
      Storage.removeItemSync(k);
    },
  }));
  return atomWithStorage<T>(`liner.${key}`, initialValue, storage, { getOnInit: true });
}

/** The 1001 Albums Generator project this device follows, or null. */
export const projectIdAtom = persisted<string | null>("projectId", null);

export const preferredServiceAtom = persisted<StreamingServiceId>("preferredService", DEFAULT_STREAMING_SERVICE);

export type AppearancePreference = "system" | "light" | "dark";
export const appearanceAtom = persisted<AppearancePreference>("appearance", "system");

/** Tint album screens with colours from the cover art. */
export const albumColorsAtom = persisted<boolean>("albumColors", true);

export const historySortAtom = persisted<HistorySort>("historySort", "newest");

/** Session-only: resets to "all" on launch, like a search field. */
export const ratingFilterAtom = atom<RatingFilter>("all");
