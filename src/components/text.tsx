import { Text, type TextProps } from "react-native";

import type { TextRole } from "@/theme/theme";
import { useTheme } from "@/theme/theme-context";

type Tone = "primary" | "secondary" | "tertiary" | "accent";

export interface AppTextProps extends TextProps {
  variant?: TextRole;
  tone?: Tone;
  /** Overrides `tone`, e.g. for text on album-coloured backgrounds. */
  color?: string;
  align?: "left" | "center" | "right";
  /** Tabular figures, so counts and averages don't jitter. */
  tabular?: boolean;
}

/**
 * Text in one of the theme's semantic roles. The variant resolves to the HIG
 * style on iOS and the Material 3 type scale on Android, always in the system
 * font, and respects the user's text size setting.
 */
export function AppText({ variant = "body", tone = "primary", color, align, tabular, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const toneColor = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    accent: theme.colors.accent,
  }[tone];
  return (
    <Text
      maxFontSizeMultiplier={variant === "display" || variant === "title" ? 1.4 : 2}
      {...rest}
      style={[
        theme.type[variant],
        { color: color ?? toneColor, textAlign: align },
        tabular && { fontVariant: ["tabular-nums"] },
        style,
      ]}
    />
  );
}
