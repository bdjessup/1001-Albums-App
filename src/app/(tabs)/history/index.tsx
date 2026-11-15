import { Stack } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { RefreshControl, SectionList, StyleSheet, View } from "react-native";

import { HistoryRow } from "@/components/history-row";
import { HeaderActions } from "@/components/native/header-actions";
import { ScreenMessage } from "@/components/native/screen-message";
import { ErrorView, LoadingView } from "@/components/query-state";
import { AppText } from "@/components/text";
import {
  filterHistory,
  HISTORY_SORTS,
  RATING_FILTERS,
  sectionByMonth,
  type HistorySection,
  type NumberedEntry,
} from "@/core/history";
import { selectionHaptic } from "@/data/actions";
import { historySortAtom, preferredServiceAtom, ratingFilterAtom } from "@/data/atoms";
import { useNumberedHistory, useProject, usePullToRefresh } from "@/data/queries";
import { useTheme } from "@/theme/theme-context";

export default function HistoryScreen() {
  const theme = useTheme();
  const { data: project, error, isPending, refetch } = useProject();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const entries = useNumberedHistory();
  const preferredService = useAtomValue(preferredServiceAtom);
  const [sort, setSort] = useAtom(historySortAtom);
  const [rating, setRating] = useAtom(ratingFilterAtom);
  const [query, setQuery] = useState("");
  // Keep typing responsive while a long history re-filters.
  const deferredQuery = useDeferredValue(query);

  const sections = useMemo<HistorySection<NumberedEntry>[]>(() => {
    const filtered = filterHistory(entries, { query: deferredQuery, rating, sort });
    if (sort === "newest" || sort === "oldest") return sectionByMonth(filtered);
    return filtered.length ? [{ key: "all", title: "", data: filtered }] : [];
  }, [entries, deferredQuery, rating, sort]);

  const renderItem = useCallback(
    ({ item }: { item: NumberedEntry }) => <HistoryRow entry={item} preferredService={preferredService} />,
    [preferredService],
  );

  const filtering = rating !== "all" || deferredQuery.length > 0;

  const header = (
    <>
      <Stack.SearchBar
        placeholder="Albums, artists, genres, years"
        onChangeText={(event) => setQuery(event.nativeEvent.text)}
        onCancelButtonPress={() => setQuery("")}
        autoCapitalize="none"
        tintColor={theme.colors.accent}
      />
      <HeaderActions
        actions={[
          {
            id: "filter",
            icon: "filter",
            label: "Sort and filter",
            menu: [
              {
                title: "Sort by",
                items: HISTORY_SORTS.map((option) => ({
                  id: `sort:${option.value}`,
                  title: option.label,
                  selected: sort === option.value,
                  onPress: () => {
                    selectionHaptic();
                    setSort(option.value);
                  },
                })),
              },
              {
                title: "Show",
                items: RATING_FILTERS.map((option) => ({
                  id: `rating:${option.value}`,
                  title: option.label,
                  selected: rating === option.value,
                  onPress: () => {
                    selectionHaptic();
                    setRating(option.value);
                  },
                })),
              },
            ],
          },
        ]}
      />
    </>
  );

  if (isPending) {
    return (
      <>
        {header}
        <LoadingView />
      </>
    );
  }
  if (!project) {
    return (
      <>
        {header}
        <ErrorView error={error} onRetry={() => refetch()} />
      </>
    );
  }

  return (
    <>
      {header}
      <SectionList
        sections={sections}
        keyExtractor={(item) => `${item.number}-${item.album.uuid}`}
        renderItem={renderItem}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
              <AppText variant={theme.isIOS ? "headline" : "label"} tone={theme.isIOS ? "primary" : "accent"}>
                {section.title}
              </AppText>
            </View>
          ) : null
        }
        stickySectionHeadersEnabled={theme.isIOS}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        initialNumToRender={14}
        windowSize={11}
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={sections.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
          {filtering ? (
            <ScreenMessage
              icon="search"
              title="No matches"
              description={deferredQuery ? `Nothing in your history matches “${deferredQuery}”.` : "No albums match this filter."}
              action={rating !== "all" ? { label: "Show All Albums", onPress: () => setRating("all") } : undefined}
            />
          ) : (
            <ScreenMessage
              icon="history"
              title="No albums yet"
              description="Albums you've been given will collect here, with your ratings and reviews."
            />
          )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    minHeight: 420,
  },
});
