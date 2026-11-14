import type { IconName } from "../icon";

export interface SettingsChoiceProps<T extends string> {
  label: string;
  icon?: IconName;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}
