import { queryOptions, useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useState } from "react";

import { numberHistory } from "@/core/history";
import { DAY, HOUR, MINUTE, albumsClient, queryClient } from "./query-client";

import { projectIdAtom } from "./atoms";

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

export const projectKey = (projectId: string) => ["project", projectId.toLowerCase()] as const;

export const projectQuery = (projectId: string) =>
  queryOptions({
    queryKey: projectKey(projectId),
    queryFn: ({ signal }) => albumsClient.getProject(projectId, { signal }),
    // A new album arrives each day: data from before today is always stale,
    // otherwise it's fresh for 15 minutes (the API allows ~3 requests/min).
    staleTime: (query) => (query.state.dataUpdatedAt < startOfToday() ? 0 : 15 * MINUTE),
  });

export const albumStatsQuery = queryOptions({
  queryKey: ["albumStats"] as const,
  queryFn: ({ signal }) => albumsClient.getAlbumStats({ signal }),
  // Global averages move slowly and the payload covers every album.
  staleTime: 12 * HOUR,
  gcTime: 30 * DAY,
});

export function useProjectId() {
  return useAtomValue(projectIdAtom);
}

export function useProject() {
  const projectId = useProjectId();
  return useQuery({ ...projectQuery(projectId ?? ""), enabled: !!projectId });
}

/** History with album numbers, oldest first. */
export function useNumberedHistory() {
  const { data } = useProject();
  return useMemo(() => numberHistory(data?.history ?? []), [data?.history]);
}

export function useAlbumStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...albumStatsQuery, enabled });
}

/**
 * Pull-to-refresh state that only reflects refreshes the person started, so
 * background refetches (app foregrounded) don't flash the spinner.
 */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return { refreshing, onRefresh };
}

/** For "Rate on 1001 Albums": the rating only shows up after a refetch. */
export function refreshProject(projectId: string) {
  return queryClient.invalidateQueries({ queryKey: projectKey(projectId) });
}

/** Validates an identifier during onboarding and seeds the cache with it. */
export function fetchProject(projectId: string) {
  return queryClient.fetchQuery({ ...projectQuery(projectId), staleTime: 0 });
}
