/**
 * Small colour helpers for album-art theming. Pure, so they're unit tested
 * and shared by both platforms.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function parseHex(hex: string): Rgb | null {
  const match = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})(?:[0-9a-f]{2})?$/i);
  if (!match) return null;
  let digits = match[1]!;
  if (digits.length === 3) digits = [...digits].map((d) => d + d).join("");
  const n = parseInt(digits, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export const toHex = ({ r, g, b }: Rgb) =>
  `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(rgb: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** HSL saturation, 0..1. */
export function saturation({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return 0;
  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

export const mix = (a: Rgb, b: Rgb, amount: number): Rgb => ({
  r: a.r + (b.r - a.r) * amount,
  g: a.g + (b.g - a.g) * amount,
  b: a.b + (b.b - a.b) * amount,
});

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/** Black or white, whichever reads better on `background`. */
export function readableTextOn(background: string): "#000000" | "#ffffff" {
  const rgb = parseHex(background);
  if (!rgb) return "#ffffff";
  return contrastRatio(rgb, WHITE) >= contrastRatio(rgb, BLACK) ? "#ffffff" : "#000000";
}

/**
 * The most colourful candidate, nudged toward black or white until white or
 * black text on it reaches 4.5:1 (WCAG AA). Returns null if none parse.
 */
export function pickAccent(candidates: readonly (string | null | undefined)[]): string | null {
  const parsed = candidates.map((c) => (c ? parseHex(c) : null)).filter((c): c is Rgb => c !== null);
  if (parsed.length === 0) return null;
  // Prefer saturated colours that aren't near-black or near-white.
  const score = (c: Rgb) => {
    const l = luminance(c);
    return saturation(c) - (l < 0.03 ? 0.6 : 0) - (l > 0.8 ? 0.6 : 0);
  };
  let best = [...parsed].sort((a, b) => score(b) - score(a))[0]!;
  // Darken until white text is legible (most covers suit a dark button).
  for (let i = 0; i < 10 && contrastRatio(best, WHITE) < 4.5; i++) best = mix(best, BLACK, 0.12);
  return toHex(best);
}

/** Darkens a colour for use behind light text (e.g. a hero backdrop). */
export function backdropColor(color: string, dark: boolean): string {
  const rgb = parseHex(color);
  if (!rgb) return dark ? "#000000" : "#f2f2f7";
  return toHex(mix(rgb, dark ? BLACK : WHITE, dark ? 0.35 : 0.55));
}
