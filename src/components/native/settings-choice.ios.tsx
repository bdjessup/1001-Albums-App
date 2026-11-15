import { Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import { sfSymbol } from "../icon";
import type { SettingsChoiceProps } from "./settings-choice.types";

/** iOS: a Form row with the label on the left and a menu of choices on the right, as in Settings. */
export function SettingsChoice<T extends string>({ label, icon, value, options, onChange }: SettingsChoiceProps<T>) {
  return (
    <Picker
      label={label}
      systemImage={icon ? sfSymbol(icon) : undefined}
      selection={value}
      onSelectionChange={(next) => onChange(next as T)}
      modifiers={[pickerStyle("menu")]}
    >
      {options.map((option) => (
        <Text key={option.value} modifiers={[tag(option.value)]}>
          {option.label}
        </Text>
      ))}
    </Picker>
  );
}
