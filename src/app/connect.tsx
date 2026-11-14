import { router, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { KeyboardAvoidingView, ScrollView, StyleSheet } from "react-native";

import { ConnectForm } from "@/components/connect-form";
import { AppText } from "@/components/text";
import { projectIdAtom } from "@/data/atoms";
import { useTheme } from "@/theme/theme-context";

/** Switching to a different project, from Settings. */
export default function ConnectScreen() {
  const theme = useTheme();
  const current = useAtomValue(projectIdAtom);
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={theme.isIOS ? "padding" : undefined}>
      {theme.isIOS ? (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
        <AppText variant="subheadline" tone="secondary">
          {`Follow a different 1001 Albums Generator project on this device. Your current project${current ? ` (${current})` : ""} isn't changed.`}
        </AppText>
        <ConnectForm onConnected={() => router.dismissAll()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    padding: 20,
  },
});
