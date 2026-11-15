import { Button, FieldGroup, ListItem, Switch, Text } from "@expo/ui";
import { useQueryClient } from "@tanstack/react-query";
import * as Application from "expo-application";
import { router, Stack } from "expo-router";
import { useAtom } from "jotai";
import { Alert, StyleSheet } from "react-native";

import { NativeHost } from "@/components/native/native-host";
import { SettingsChoice } from "@/components/native/settings-choice";
import { projectPageUrl, SITE_URL } from "@/core/client";
import { STREAMING_SERVICES, isStreamingServiceId, DEFAULT_STREAMING_SERVICE } from "@/core/streaming";
import { openReader, selectionHaptic } from "@/data/actions";
import {
  albumColorsAtom,
  appearanceAtom,
  preferredServiceAtom,
  projectIdAtom,
  type AppearancePreference,
} from "@/data/atoms";
import { useTheme } from "@/theme/theme-context";

const APPEARANCE_OPTIONS: readonly { value: AppearancePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const SERVICE_OPTIONS = STREAMING_SERVICES.map((s) => ({ value: s.id, label: s.name }));

/**
 * Settings are built from @expo/ui's universal components: one tree that
 * renders as a SwiftUI Form on iOS and a Material 3 settings list in Jetpack
 * Compose on Android.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useAtom(projectIdAtom);
  const [service, setService] = useAtom(preferredServiceAtom);
  const [appearance, setAppearance] = useAtom(appearanceAtom);
  const [albumColors, setAlbumColors] = useAtom(albumColorsAtom);
  const version = `${Application.nativeApplicationVersion ?? "1.0.0"} (${Application.nativeBuildVersion ?? "dev"})`;

  const disconnect = () =>
    Alert.alert("Disconnect project?", "Your ratings stay on 1001 Albums Generator. You can reconnect any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: () => {
          router.dismissAll();
          queryClient.clear();
          setProjectId(null);
        },
      },
    ]);

  return (
    <>
      {theme.isIOS ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button variant="done" onPress={() => router.back()}>
            Done
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <NativeHost style={StyleSheet.absoluteFill}>
        <FieldGroup>
          <FieldGroup.Section title="Project">
            <ListItem supportingText="Following on 1001 Albums Generator">{projectId ?? "None"}</ListItem>
            <ListItem onPress={() => projectId && openReader(projectPageUrl(projectId))}>
              Open Project Page
            </ListItem>
            <ListItem onPress={() => router.push("/connect")}>Change Project</ListItem>
          </FieldGroup.Section>

          <FieldGroup.Section title="Listening">
            <SettingsChoice
              label="Play albums on"
              icon="listen"
              value={isStreamingServiceId(service) ? service : DEFAULT_STREAMING_SERVICE}
              options={SERVICE_OPTIONS}
              onChange={(next) => {
                selectionHaptic();
                setService(next);
              }}
            />
            <FieldGroup.SectionFooter>
              <Text>Used for the Play button. Other services are one tap away in the … menu.</Text>
            </FieldGroup.SectionFooter>
          </FieldGroup.Section>

          <FieldGroup.Section title="Appearance">
            <SettingsChoice
              label="Theme"
              icon="sparkles"
              value={appearance}
              options={APPEARANCE_OPTIONS}
              onChange={(next) => {
                selectionHaptic();
                setAppearance(next);
              }}
            />
            <Switch label="Colours from album art" value={albumColors} onValueChange={setAlbumColors} />
          </FieldGroup.Section>

          <FieldGroup.Section title="About">
            <ListItem supportingText={version}>Liner</ListItem>
            <ListItem onPress={() => openReader(SITE_URL)}>About 1001 Albums Generator</ListItem>
            <FieldGroup.SectionFooter>
              <Text>
                Liner is an independent app, not affiliated with 1001 Albums Generator. Album data comes from its public
                API; ratings and reviews are saved on its website.
              </Text>
            </FieldGroup.SectionFooter>
          </FieldGroup.Section>

          <FieldGroup.Section>
            <Button label="Disconnect Project" variant="text" onPress={disconnect} />
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}
