import { Button, HStack, Menu, Section } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, labelStyle, tint } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";

import { openExternal, selectionHaptic, shareAlbum } from "@/data/actions";
import { NativeHost } from "./native-host";
import type { ListenActionsProps } from "./listen-actions.types";

/**
 * iOS: SwiftUI buttons. On iOS 26 the play button is prominent Liquid Glass
 * tinted with the album's colour and the overflow is a glass circle; earlier
 * versions get the bordered equivalents. The overflow is a native UIMenu.
 */
export function ListenActions({ album, primary, others, accent }: ListenActionsProps) {
  const glass = isLiquidGlassAvailable();
  if (!primary) return null;
  return (
    <NativeHost matchContents seedColor={accent}>
      <HStack spacing={12}>
        <Button
          label={`Play on ${primary.name}`}
          systemImage="play.fill"
          onPress={() => openExternal(primary.url)}
          modifiers={[
            buttonStyle(glass ? "glassProminent" : "borderedProminent"),
            controlSize("large"),
            tint(accent),
            frame({ maxWidth: 10_000 }),
          ]}
        />
        <Menu
          label="More"
          systemImage="ellipsis"
          modifiers={[
            buttonStyle(glass ? "glass" : "bordered"),
            controlSize("large"),
            labelStyle("iconOnly"),
            tint(accent),
          ]}
        >
          {others.length > 0 ? (
            <Section title="Listen on">
              {others.map((link) => (
                <Button key={link.id} label={link.name} onPress={() => openExternal(link.url)} />
              ))}
            </Section>
          ) : null}
          <Button
            label="Share Album"
            systemImage="square.and.arrow.up"
            onPress={() => {
              selectionHaptic();
              void shareAlbum(album, primary.url);
            }}
          />
        </Menu>
      </HStack>
    </NativeHost>
  );
}
