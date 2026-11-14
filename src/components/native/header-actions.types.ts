import type { IconName } from "../icon";

export interface HeaderMenuItem {
  id: string;
  title: string;
  selected?: boolean;
  onPress: () => void;
}

export interface HeaderMenuGroup {
  title: string;
  items: HeaderMenuItem[];
}

export interface HeaderAction {
  id: string;
  icon: IconName;
  label: string;
  onPress?: () => void;
  /** When set, the button opens a menu of grouped, checkable items instead. */
  menu?: HeaderMenuGroup[];
}
