import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { describeRating } from "@/core/album";
import type { AlbumRating } from "@/core/types";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "./text";

/**
 * Five stars. iOS uses SF Symbols (star.fill / star) like Music and the App
 * Store; Android draws the star glyph, since the Material Symbols font only
 * ships the outlined style.
 */
export function RatingStars({ rating, size = 14, color }: { rating: AlbumRating; size?: number; color?: string }) {
  const theme = useTheme();
  if (rating === "did-not-listen" || rating === null) {
    return (
      <AppText variant="footnote" tone="tertiary" accessibilityLabel={describeRating(rating)}>
        {rating === null ? "Not rated" : "Didn't listen"}
      </AppText>
    );
  }
  const filled = color ?? theme.colors.star;
  return (
    <View style={styles.row} accessible accessibilityLabel={describeRating(rating)}>
      {[1, 2, 3, 4, 5].map((n) =>
        theme.isIOS ? (
          <SymbolView
            key={n}
            name={n <= rating ? "star.fill" : "star"}
            size={size}
            tintColor={n <= rating ? filled : theme.colors.textTertiary}
          />
        ) : (
          <Text
            key={n}
            style={{ fontSize: size + 2, lineHeight: size + 4, color: n <= rating ? filled : theme.colors.separator }}
          >
            ★
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
