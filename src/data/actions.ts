import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { AppState, type NativeEventSubscription, Share } from "react-native";

import { projectPageUrl } from "@/core/client";
import { pickStreamingLinks } from "@/core/streaming";
import type { Album } from "@/core/types";
import { isIOS } from "@/theme/theme";
import { preferredServiceAtom, projectIdAtom } from "./atoms";
import { refreshProject } from "./queries";

/** A light tap for selections, the system's own feedback on each platform. */
export const selectionHaptic = () => {
  Haptics.selectionAsync().catch(() => {});
};

/**
 * Streaming links are universal/app links: the OS opens the installed app
 * (Spotify, Apple Music...) or falls back to the browser.
 */
export async function openExternal(url: string) {
  selectionHaptic();
  try {
    await Linking.openURL(url);
  } catch {
    await WebBrowser.openBrowserAsync(url);
  }
}

/** Reading material (Wikipedia, reviews) opens in-app: Safari View Controller / Custom Tabs. */
export function openReader(url: string) {
  return WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
}

export async function shareAlbum(album: Album, preferred = pickStreamingLinks(album, "spotify").primary?.url) {
  const message = `${album.name} by ${album.artist}`;
  await Share.share(
    isIOS && preferred ? { message, url: preferred } : { message: preferred ? `${message}\n${preferred}` : message },
  ).catch(() => {});
}

export function usePreferredLinks(album: Album | null | undefined) {
  const preferred = useAtomValue(preferredServiceAtom);
  return album ? pickStreamingLinks(album, preferred) : { primary: null, others: [] };
}

/**
 * Opens the project page on 1001 Albums Generator in an in-app browser and
 * refreshes the project once the person is back, since anything they change
 * there (ratings, reviews, pausing) only reaches the app through the API.
 *
 * iOS resolves when the sheet is dismissed. Android's Custom Tab resolves
 * immediately, so wait for the app to become active again instead. That
 * listener is removed when it fires, when a newer call replaces it, or when
 * the calling component unmounts.
 */
export function useOpenProjectPage() {
  const projectId = useAtomValue(projectIdAtom);
  const pendingReturn = useRef<NativeEventSubscription | null>(null);

  const clearPendingReturn = useCallback(() => {
    pendingReturn.current?.remove();
    pendingReturn.current = null;
  }, []);

  useEffect(() => clearPendingReturn, [clearPendingReturn]);

  return useCallback(async () => {
    if (!projectId) return;
    selectionHaptic();
    const url = projectPageUrl(projectId);
    if (isIOS) {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
      await refreshProject(projectId);
      return;
    }
    clearPendingReturn();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      if (pendingReturn.current === subscription) pendingReturn.current = null;
      subscription.remove();
      void refreshProject(projectId);
    });
    pendingReturn.current = subscription;
    await WebBrowser.openBrowserAsync(url);
  }, [projectId, clearPendingReturn]);
}

/**
 * Ratings and reviews can only be written on the website (the API is
 * read-only), so rating means opening the project page and refreshing after.
 */
export const useRateOnSite = useOpenProjectPage;
