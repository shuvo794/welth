import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export type PillOption<T extends string = string> = {
  key: T;
  label: string;
  icon?: string;
};

export function PillGroup<T extends string = string>({
  options,
  value,
  onChange,
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2">
        {options.map((opt) => {
          const active = value === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onChange(opt.key)}
              className={`px-3.5 py-2 rounded-full border flex-row items-center gap-1.5 ${
                active
                  ? "bg-brand-bg border-brand-bg"
                  : "bg-white border-[#E8E6DF]"
              }`}
            >
              {opt.icon && <Text className="text-xs">{opt.icon}</Text>}
              <Text
                className={`text-xs ${
                  active ? "text-white font-medium" : "text-brand-text-secondary"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
