import type { IconName } from "../icon";

export interface ScreenMessageProps {
  icon: IconName;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}
