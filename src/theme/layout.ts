import { HeaderHeightContext } from "expo-router/react-navigation";
import { use } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Fallback height of the native tab bar above the bottom safe area: iOS
 * UITabBar is 49pt; the M3 navigation bar is 80dp.
 */
export const TAB_BAR_HEIGHT = process.env.EXPO_OS === "ios" ? 49 : 80;

/**
 * Fallback navigation bar height, below the status bar (iOS 44pt; M3 small
 * top app bar 64dp). Only used until the native stack reports its own.
 */
export const NAV_BAR_HEIGHT = process.env.EXPO_OS === "ios" ? 44 : 64;

/**
 * Space taken by the status bar plus the (transparent) header, for full-bleed
 * screens that manage their own insets (contentInsetAdjustmentBehavior
 * "never"). The native stack measures its header and provides it through
 * HeaderHeightContext, status bar included; outside a stack, or before the
 * first measurement, it falls back to the constants above.
 */
export function useHeaderInset(): number {
  const measured = use(HeaderHeightContext);
  const insets = useSafeAreaInsets();
  return measured !== undefined && measured > 0 ? measured : insets.top + NAV_BAR_HEIGHT;
}

/**
 * Space taken by the tab bar plus the bottom safe area. Expo Router's
 * NativeTabs (SDK 58) don't expose a measured height: BottomTabBarHeightContext
 * is only provided by the JS tab navigator. So this uses the platform
 * constant.
 */
export function useTabBarInset(): number {
  return useSafeAreaInsets().bottom + TAB_BAR_HEIGHT;
}
