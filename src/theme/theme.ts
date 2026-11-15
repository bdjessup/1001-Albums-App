/**
 * One set of semantic tokens, two native vocabularies:
 *
 * - iOS uses Apple's system colours (grouped backgrounds, label greys,
 *   separators) and the HIG text styles, so React Native views sit flush with
 *   the SwiftUI lists, sheets and Liquid Glass bars around them.
 * - Android uses a Material 3 tonal palette seeded from the brand orange and
 *   the M3 type scale, matching the Compose components and the M3 tab bar.
 *
 * Screens only ever read the semantic names, never the platform, so layout code
 * is shared and each platform still looks like itself.
 */

// Must stay the exact `process.env.EXPO_OS` expression: babel-preset-expo
// inlines only that spelling, which lets Metro drop the other platform's code.
export const isIOS = process.env.EXPO_OS === "ios";

export type ColorSchemeName = "light" | "dark";

export interface Palette {
  /** Grouped screens (settings, stats). */
  background: string;
  /** Content screens (today, album). */
  backgroundPlain: string;
  /** Cards and list cells on `background`. */
  surface: string;
  /** Raised elements on `surface` (chips, inner wells). */
  surfaceRaised: string;
  separator: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  /** Tracks, placeholders, chip fills. */
  fill: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  star: string;
  positive: string;
  negative: string;
}

export const BRAND = "#F2542D";

const iosLight: Palette = {
  background: "#F2F2F7",
  backgroundPlain: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceRaised: "#F2F2F7",
  separator: "#C6C6C8",
  text: "#000000",
  textSecondary: "#3C3C4399",
  textTertiary: "#3C3C434D",
  fill: "#7676801F",
  accent: "#E8461F",
  onAccent: "#FFFFFF",
  accentSoft: "#E8461F1F",
  star: "#FF9500",
  positive: "#34C759",
  negative: "#FF3B30",
};

const iosDark: Palette = {
  background: "#000000",
  backgroundPlain: "#000000",
  surface: "#1C1C1E",
  surfaceRaised: "#2C2C2E",
  separator: "#38383A",
  text: "#FFFFFF",
  textSecondary: "#EBEBF599",
  textTertiary: "#EBEBF54D",
  fill: "#7676803D",
  accent: "#FF6B47",
  onAccent: "#FFFFFF",
  accentSoft: "#FF6B472E",
  star: "#FF9F0A",
  positive: "#30D158",
  negative: "#FF453A",
};

// Material 3 roles from a tonal palette seeded with BRAND (SchemeTonalSpot).
const androidLight: Palette = {
  background: "#FFF8F6", // surface
  backgroundPlain: "#FFF8F6",
  surface: "#FCEAE5", // surfaceContainer
  surfaceRaised: "#F6E4DF", // surfaceContainerHigh
  separator: "#D8C2BC", // outlineVariant
  text: "#231917", // onSurface
  textSecondary: "#534340", // onSurfaceVariant
  textTertiary: "#85736F", // outline
  fill: "#F1DFDA", // surfaceContainerHighest
  accent: "#AE3214", // primary
  onAccent: "#FFFFFF",
  accentSoft: "#FFDBD1", // primaryContainer
  star: "#B26B00",
  positive: "#3B6939",
  negative: "#BA1A1A",
};

const androidDark: Palette = {
  background: "#1A110F",
  backgroundPlain: "#1A110F",
  surface: "#271D1B",
  surfaceRaised: "#322825",
  separator: "#534340",
  text: "#F1DFDA",
  textSecondary: "#D8C2BC",
  textTertiary: "#A08C87",
  fill: "#3D3230",
  accent: "#FFB5A1",
  onAccent: "#601500",
  accentSoft: "#852208",
  star: "#FFB95C",
  positive: "#A1D39A",
  negative: "#FFB4AB",
};

export function paletteFor(scheme: ColorSchemeName, os: string | undefined): Palette {
  if (os === "ios") return scheme === "dark" ? iosDark : iosLight;
  return scheme === "dark" ? androidDark : androidLight;
}

export interface TextStyleToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600" | "700" | "800";
  letterSpacing?: number;
}

/**
 * Semantic text roles. iOS maps them to the HIG styles (Large Title, Title 1,
 * Headline, Body, Footnote...); Android to the M3 scale (Headline, Title, Body,
 * Label). Body text is 17pt on iOS and 16sp on Android, as on each platform.
 */
export function typographyFor(os: string | undefined) {
  if (os === "ios") {
    return {
      display: { fontSize: 34, lineHeight: 41, fontWeight: "800", letterSpacing: 0.4 },
      title: { fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: 0.38 },
      title2: { fontSize: 22, lineHeight: 28, fontWeight: "700", letterSpacing: -0.26 },
      title3: { fontSize: 20, lineHeight: 25, fontWeight: "600", letterSpacing: -0.45 },
      headline: { fontSize: 17, lineHeight: 22, fontWeight: "600", letterSpacing: -0.43 },
      body: { fontSize: 17, lineHeight: 22, fontWeight: "400", letterSpacing: -0.43 },
      callout: { fontSize: 16, lineHeight: 21, fontWeight: "400", letterSpacing: -0.31 },
      subheadline: { fontSize: 15, lineHeight: 20, fontWeight: "400", letterSpacing: -0.23 },
      footnote: { fontSize: 13, lineHeight: 18, fontWeight: "400", letterSpacing: -0.08 },
      caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
      label: { fontSize: 13, lineHeight: 18, fontWeight: "600", letterSpacing: -0.08 },
    } satisfies Record<string, TextStyleToken>;
  }
  return {
    display: { fontSize: 32, lineHeight: 40, fontWeight: "400" }, // headlineLarge
    title: { fontSize: 28, lineHeight: 36, fontWeight: "400" }, // headlineMedium
    title2: { fontSize: 22, lineHeight: 28, fontWeight: "400" }, // titleLarge
    title3: { fontSize: 20, lineHeight: 26, fontWeight: "500" },
    headline: { fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15 }, // titleMedium
    body: { fontSize: 16, lineHeight: 24, fontWeight: "400", letterSpacing: 0.5 }, // bodyLarge
    callout: { fontSize: 14, lineHeight: 20, fontWeight: "400", letterSpacing: 0.25 }, // bodyMedium
    subheadline: { fontSize: 14, lineHeight: 20, fontWeight: "400", letterSpacing: 0.25 },
    footnote: { fontSize: 12, lineHeight: 16, fontWeight: "400", letterSpacing: 0.4 }, // bodySmall
    caption: { fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.5 }, // labelMedium
    label: { fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1 }, // labelLarge
  } satisfies Record<string, TextStyleToken>;
}

export type TextRole = keyof ReturnType<typeof typographyFor>;

/**
 * Corner radii. iOS uses continuous ("squircle") corners at HIG sizes; Android
 * uses the M3 shape scale (small 8, medium 12, large 16, extra large 28).
 */
export function shapesFor(os: string | undefined) {
  return os === "ios"
    ? { cover: 8, coverLarge: 14, card: 16, chip: 999, button: 999 }
    : { cover: 12, coverLarge: 16, card: 16, chip: 8, button: 999 };
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32 } as const;

export function makeTheme(scheme: ColorSchemeName, os: string | undefined = process.env.EXPO_OS) {
  return {
    scheme,
    dark: scheme === "dark",
    colors: paletteFor(scheme, os),
    type: typographyFor(os),
    shapes: shapesFor(os),
    spacing,
    isIOS: os === "ios",
  };
}

export type Theme = ReturnType<typeof makeTheme>;
