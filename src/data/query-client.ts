import { focusManager, QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import Storage from "expo-sqlite/kv-store";
import { AppState } from "react-native";

import { createAlbumsClient, isApiError } from "@/core/client";

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** One client, one rate limiter, shared by every query in the app. */
export const albumsClient = createAlbumsClient();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * MINUTE,
      // Must outlive the persisted cache's maxAge, or restored data is
      // garbage-collected before anything reads it.
      gcTime: 30 * DAY,
      retry: (failureCount, error) => {
        if (!isApiError(error)) return failureCount < 2;
        if (error.kind === "not-found" || error.kind === "invalid-response") return false;
        return failureCount < 2;
      },
      retryDelay: (attempt, error) =>
        isApiError(error) && error.kind === "rate-limited"
          ? (error.retryAfterMs ?? 30_000)
          : Math.min(1000 * 2 ** attempt, 15_000),
    },
  },
});

// React Native has no window focus: treat the app returning to the foreground
// as focus, so stale queries (a new day's album) refresh when it's reopened.
focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener("change", (state) => setFocused(state === "active"));
  return () => subscription.remove();
});

/**
 * The whole query cache is persisted to SQLite, so the app opens straight to
 * today's album (even offline) and only hits the rate-limited API when data
 * is actually stale.
 */
export const queryPersister = createAsyncStoragePersister({
  storage: Storage,
  key: "liner.queryCache",
  throttleTime: 2000,
});

export const persistOptions = {
  persister: queryPersister,
  maxAge: 30 * DAY,
  // Bump when a cached shape changes so old caches are discarded.
  buster: "1",
};
