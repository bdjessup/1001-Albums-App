import { Button } from "@expo/ui";
import { ContentUnavailableView } from "@expo/ui/swift-ui";
import { StyleSheet } from "react-native";

import { sfSymbol } from "../icon";
import { NativeHost } from "./native-host";
import type { ScreenMessageProps } from "./screen-message.types";

/** iOS: SwiftUI's ContentUnavailableView, the system's empty/error state. */
export function ScreenMessage({ icon, title, description, action }: ScreenMessageProps) {
  return (
    <NativeHost style={StyleSheet.absoluteFill}>
      <ContentUnavailableView
        title={title}
        systemImage={sfSymbol(icon)}
        description={description}
        actions={action ? <Button label={action.label} onPress={action.onPress} variant="filled" /> : undefined}
      />
    </NativeHost>
  );
}
