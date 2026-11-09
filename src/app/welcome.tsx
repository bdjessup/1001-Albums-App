import { Image } from "expo-image";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConnectForm } from "@/components/connect-form";
import { Icon, type IconName } from "@/components/icon";
import { AppText } from "@/components/text";
import { useTheme } from "@/theme/theme-context";

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: "today", title: "Today's album", body: "Cover, story and one tap to play it on your service." },
  { icon: "history", title: "Your history", body: "Every album, rating and review, searchable." },
  { icon: "stats", title: "Your stats", body: "Favourite genres, decades and your hottest takes." },
];

/** First run: shown until a project is connected (see the root layout's guards). */
export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.backgroundPlain }} behavior={theme.isIOS ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Image source={require("@/assets/images/splash-icon.png")} style={styles.mark} accessibilityIgnoresInvertColors />
          <AppText variant="display" align="center" accessibilityRole="header">
            Liner
          </AppText>
          <AppText variant="body" tone="secondary" align="center">
            A companion for your 1001 Albums Generator project.
          </AppText>
        </View>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature.title} style={styles.feature}>
              <Icon name={feature.icon} size={28} color={theme.colors.accent} style={styles.featureIcon} />
              <View style={styles.featureText}>
                <AppText variant="headline">{feature.title}</AppText>
                <AppText variant="subheadline" tone="secondary">
                  {feature.body}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <ConnectForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: 36,
    paddingHorizontal: 24,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  mark: {
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  features: {
    gap: 20,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureIcon: {
    width: 36,
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
});
