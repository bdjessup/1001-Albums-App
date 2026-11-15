import { Button } from "@expo/ui";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";

import { isApiError, parseProjectInput, SITE_URL } from "@/core/client";
import { openReader } from "@/data/actions";
import { projectIdAtom } from "@/data/atoms";
import { fetchProject } from "@/data/queries";
import { useTheme } from "@/theme/theme-context";
import { NativeHost } from "./native/native-host";
import { AppText } from "./text";

function errorMessage(error: unknown, projectId: string): string {
  if (isApiError(error)) {
    switch (error.kind) {
      case "not-found":
      case "invalid-response":
        return `Couldn't find a project called “${projectId}”. Check the name in your project's web address.`;
      case "rate-limited":
        return "1001 Albums Generator is busy. Wait a minute and try again.";
      case "network":
        return "You're offline. Connect to the internet and try again.";
      default:
        return "1001 Albums Generator didn't respond. Try again shortly.";
    }
  }
  return "Something went wrong. Try again.";
}

/**
 * Asks for the 1001 Albums Generator project name (or a pasted project link),
 * checks it against the API, and stores it. The fetched project seeds the
 * query cache, so the next screen renders immediately.
 */
export function ConnectForm({ initialValue = "", onConnected }: { initialValue?: string; onConnected?: () => void }) {
  const theme = useTheme();
  const setProjectId = useSetAtom(projectIdAtom);
  const [text, setText] = useState(initialValue);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const projectId = parseProjectInput(text);
    if (!projectId) {
      setError("Enter your project name, or paste your project's link.");
      return;
    }
    setChecking(true);
    setError(null);
    try {
      await fetchProject(projectId);
      setProjectId(projectId);
      onConnected?.();
    } catch (caught) {
      setError(errorMessage(caught, projectId));
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        value={text}
        onChangeText={(next) => {
          setText(next);
          if (error) setError(null);
        }}
        onSubmitEditing={submit}
        placeholder="Project name or link"
        placeholderTextColor={theme.colors.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        keyboardType={theme.isIOS ? "url" : "default"}
        returnKeyType="go"
        editable={!checking}
        accessibilityLabel="1001 Albums Generator project name or link"
        cursorColor={theme.colors.accent}
        selectionColor={theme.colors.accent}
        style={[
          styles.input,
          theme.type.body,
          { color: theme.colors.text },
          theme.isIOS
            ? { backgroundColor: theme.colors.surface, borderRadius: 12, borderCurve: "continuous" }
            : {
                // M3 outlined text field.
                borderRadius: 4,
                borderWidth: error ? 2 : 1,
                borderColor: error ? theme.colors.negative : theme.colors.textTertiary,
              },
        ]}
      />
      <AppText variant="footnote" tone="secondary" color={error ? theme.colors.negative : undefined} style={styles.help}>
        {error ?? "It's the last part of your project's address: 1001albumsgenerator.com/your-name"}
      </AppText>

      <View style={styles.button}>
        {checking ? (
          <ActivityIndicator color={theme.colors.accent} />
        ) : (
          <NativeHost matchContents={{ vertical: true }} style={styles.buttonHost}>
            <Button label="Continue" variant="filled" onPress={submit} style={{ width: "100%" }} />
          </NativeHost>
        )}
      </View>

      <AppText variant="footnote" tone="accent" align="center" onPress={() => openReader(SITE_URL)} accessibilityRole="link">
        New to 1001 Albums Generator? Start a project
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
  },
  help: {
    paddingHorizontal: 4,
  },
  button: {
    minHeight: 52,
    justifyContent: "center",
    marginVertical: 8,
  },
  buttonHost: {
    width: "100%",
  },
});
