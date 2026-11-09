import { CircularWavyProgressIndicator } from "@expo/ui/jetpack-compose";
import { size as sizeModifier } from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/theme-context";
import { AppText } from "../text";
import { NativeHost } from "./native-host";
import type { ProgressRingProps } from "./progress-ring.types";

/** Android: Material 3 Expressive's wavy circular progress indicator. */
export function ProgressRing({ value, total, label, color, size = 96 }: ProgressRingProps) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <NativeHost style={StyleSheet.absoluteFill}>
        <CircularWavyProgressIndicator
          progress={total > 0 ? Math.min(1, value / total) : 0}
          color={color}
          trackColor={theme.colors.fill}
          modifiers={[sizeModifier(size, size)]}
        />
      </NativeHost>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <AppText variant="label" tabular>
          {label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});
