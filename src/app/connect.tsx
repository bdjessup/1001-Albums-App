import { router, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { sfSymbol } from "@/components/icon";
import { ConnectForm } from "@/components/connect-form";
import { AppText } from "@/components/text";
import { projectIdAtom } from "@/data/atoms";
import { useTheme } from "@/theme/theme-context";

/** Switching to a different project, from Settings. */
export default function ConnectScreen() {
  const theme = useTheme();
  const current = useAtomValue(projectIdAtom);
  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={theme.isIOS ? "padding" : undefined}>
        {theme.isIOS ? (
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button icon={sfSymbol("close")} accessibilityLabel="Cancel" onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
          </Stack.Toolbar>
        ) : null}
        <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
          <SafeAreaView edges={["left", "right"]} cornerAdaptation="horizontal">
            <View style={styles.content}>
              <AppText variant="subheadline" tone="secondary">
                {`Follow a different 1001 Albums Generator project on this device. Your current project${current ? ` (${current})` : ""} isn't changed.`}
              </AppText>
              <ConnectForm onConnected={() => router.dismissAll()} />
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: 20,
    padding: 20,
  },
});
