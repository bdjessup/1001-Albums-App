import { SymbolView, type AndroidSymbol, type SFSymbol, type SymbolViewProps } from "expo-symbols";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

/**
 * Every icon in the app, as an SF Symbol for iOS and a Material Symbol for
 * Android. Both names are type-checked against each platform's catalogue, so
 * a typo fails `tsc` instead of rendering nothing on one platform.
 */
export const ICONS = {
  today: { ios: "opticaldisc", android: "album" },
  history: { ios: "rectangle.stack", android: "library_music" },
  stats: { ios: "chart.bar", android: "bar_chart" },
  settings: { ios: "gearshape", android: "settings" },
  play: { ios: "play.fill", android: "play_arrow" },
  listen: { ios: "headphones", android: "headphones" },
  external: { ios: "arrow.up.right", android: "open_in_new" },
  wikipedia: { ios: "book", android: "menu_book" },
  rate: { ios: "star.bubble", android: "rate_review" },
  share: { ios: "square.and.arrow.up", android: "share" },
  more: { ios: "ellipsis", android: "more_vert" },
  filter: { ios: "line.3.horizontal.decrease", android: "filter_list" },
  sort: { ios: "arrow.up.arrow.down", android: "sort" },
  search: { ios: "magnifyingglass", android: "search" },
  check: { ios: "checkmark", android: "check" },
  chevronRight: { ios: "chevron.right", android: "chevron_right" },
  music: { ios: "music.note", android: "music_note" },
  warning: { ios: "exclamationmark.triangle", android: "warning" },
  offline: { ios: "wifi.slash", android: "wifi_off" },
  paused: { ios: "pause.circle", android: "pause_circle" },
  quote: { ios: "quote.opening", android: "format_quote" },
  globe: { ios: "globe", android: "public" },
  calendar: { ios: "calendar", android: "calendar_today" },
  person: { ios: "person.crop.circle", android: "account_circle" },
  link: { ios: "link", android: "link" },
  flame: { ios: "flame", android: "local_fire_department" },
  thumbsUp: { ios: "hand.thumbsup", android: "thumb_up" },
  thumbsDown: { ios: "hand.thumbsdown", android: "thumb_down" },
  sparkles: { ios: "sparkles", android: "auto_awesome" },
  close: { ios: "xmark", android: "close" },
} as const satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 22,
  color,
  weight,
  style,
  accessibilityLabel,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  weight?: SymbolViewProps["weight"];
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <SymbolView
      name={ICONS[name]}
      size={size}
      tintColor={color}
      weight={weight}
      style={style}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    />
  );
}

/** The SF Symbol name alone, for iOS-only APIs (toolbars, menus, tabs). */
export const sfSymbol = (name: IconName): SFSymbol => ICONS[name].ios;
export const materialSymbol = (name: IconName): AndroidSymbol => ICONS[name].android;
