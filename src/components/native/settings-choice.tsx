import { Column, Picker, Text } from "@expo/ui";

import type { SettingsChoiceProps } from "./settings-choice.types";

/** Android: a labelled Material 3 exposed dropdown menu. */
export function SettingsChoice<T extends string>({ label, value, options, onChange }: SettingsChoiceProps<T>) {
  return (
    <Column spacing={8} style={{ paddingVertical: 8 }}>
      <Text textStyle={{ fontSize: 14, fontWeight: "500" }}>{label}</Text>
      <Picker selectedValue={value} onValueChange={(next) => onChange(next as T)}>
        {options.map((option) => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </Column>
  );
}
