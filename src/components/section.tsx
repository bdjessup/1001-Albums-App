import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/theme/theme-context";
import { Icon, type IconName } from "./icon";
import { AppText } from "./text";

/**
 * A titled group of content. iOS: an inset-grouped section (small uppercase
 * header, rounded card). Android: an M3 section with a title-small header in
 * the primary colour over a filled surface container.
 */
export function Section({
  title,
  footer,
  children,
  style,
  padded = true,
}: {
  title?: string;
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <AppText
          variant={theme.isIOS ? "footnote" : "label"}
          tone={theme.isIOS ? "secondary" : "accent"}
          style={[styles.header, theme.isIOS && styles.iosHeader]}
          accessibilityRole="header"
        >
          {theme.isIOS ? title.toUpperCase() : title}
        </AppText>
      ) : null}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderRadius: theme.isIOS ? 12 : theme.shapes.card },
          padded && styles.padded,
        ]}
      >
        {children}
      </View>
      {footer ? (
        <AppText variant="footnote" tone="secondary" style={styles.footer}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

/** Rows separated by inset hairlines (iOS) or nothing (Android M3 lists). */
export function Rows({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <>
      {items.map((child, index) => (
        <Fragment key={child.key ?? index}>
          {index > 0 && theme.isIOS ? (
            <View style={[styles.separator, { backgroundColor: theme.colors.separator }]} />
          ) : null}
          {child}
        </Fragment>
      ))}
    </>
  );
}

export function ActionRow({
  icon,
  label,
  detail,
  onPress,
  external = false,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress: () => void;
  external?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={external ? "link" : "button"}
      android_ripple={{ color: theme.colors.fill }}
      style={({ pressed }) => [styles.row, pressed && theme.isIOS && { backgroundColor: theme.colors.fill }]}
    >
      <Icon name={icon} size={20} color={theme.colors.accent} />
      <View style={styles.rowText}>
        <AppText numberOfLines={1}>{label}</AppText>
        {detail ? (
          <AppText variant="footnote" tone="secondary" numberOfLines={1}>
            {detail}
          </AppText>
        ) : null}
      </View>
      <Icon name={external ? "external" : "chevronRight"} size={14} color={theme.colors.textTertiary} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  header: {
    paddingHorizontal: 16,
  },
  iosHeader: {
    paddingHorizontal: 20,
  },
  card: {
    overflow: "hidden",
    borderCurve: "continuous",
  },
  padded: {
    padding: 16,
  },
  footer: {
    paddingHorizontal: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
