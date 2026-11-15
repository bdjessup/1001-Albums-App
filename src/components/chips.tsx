import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/theme-context";
import { AppText } from "./text";

/** Non-interactive tags (genres). Capsules on iOS, M3 assist-chip shape on Android. */
export function Chips({ labels, color, background }: { labels: string[]; color?: string; background?: string }) {
  const theme = useTheme();
  if (labels.length === 0) return null;
  return (
    <View style={styles.wrap}>
      {labels.map((label) => (
        <View
          key={label}
          style={[
            styles.chip,
            {
              borderRadius: theme.shapes.chip,
              backgroundColor: background ?? theme.colors.fill,
              borderColor: theme.isIOS ? "transparent" : theme.colors.separator,
              borderWidth: theme.isIOS || background ? 0 : StyleSheet.hairlineWidth * 2,
            },
          ]}
        >
          <AppText variant="footnote" color={color} tone="secondary">
            {label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderCurve: "continuous",
  },
});
