/**
 * Height of the native tab bar above the bottom safe area, for screens that
 * manage their own insets (full-bleed heroes use contentInsetAdjustment
 * "never"). iOS UITabBar is 49pt; the M3 navigation bar is 80dp.
 */
export const TAB_BAR_HEIGHT = process.env.EXPO_OS === "ios" ? 49 : 80;

/** Standard navigation bar height (iOS 44pt; M3 small top app bar 64dp). */
export const NAV_BAR_HEIGHT = process.env.EXPO_OS === "ios" ? 44 : 64;
