import { Gauge, Text } from "@expo/ui/swift-ui";
import { font, gaugeStyle, scaleEffect, tint } from "@expo/ui/swift-ui/modifiers";

import { NativeHost } from "./native-host";
import type { ProgressRingProps } from "./progress-ring.types";

/** iOS: a SwiftUI capacity gauge, the ring used by Fitness and widgets. */
export function ProgressRing({ value, total, label, color, size = 96 }: ProgressRingProps) {
  return (
    <NativeHost style={{ width: size, height: size }}>
      <Gauge
        value={Math.min(value, total)}
        min={0}
        max={total}
        currentValueLabel={<Text modifiers={[font({ size: 13, weight: "semibold", design: "rounded" })]}>{label}</Text>}
        modifiers={[gaugeStyle("circularCapacity"), tint(color), scaleEffect(size / 56)]}
      />
    </NativeHost>
  );
}
