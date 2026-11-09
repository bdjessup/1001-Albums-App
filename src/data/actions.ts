import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { AppState, Share } from "react-native";

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
 * Ratings can only be written on the website (the API is read-only), so open
 * the project page in an in-app browser and refresh once the person is back.
 * iOS resolves when the sheet is dismissed; Android's Custom Tab resolves
 * immediately, so wait for the app to become active again instead.
 */
export function useRateOnSite() {
  const projectId = useAtomValue(projectIdAtom);
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
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      subscription.remove();
      void refreshProject(projectId);
    });
    await WebBrowser.openBrowserAsync(url);
  }, [projectId]);
}
