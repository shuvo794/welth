import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { format, subDays } from "date-fns";

export function CalendarPicker({
  value,
  maximumDate,
  onChange,
}: {
  value: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
}) {
  const dates = [
    subDays(new Date(), 3),
    subDays(new Date(), 2),
    subDays(new Date(), 1),
    new Date(),
  ];

  return (
    <View className="p-3 flex-row justify-around">
      {dates.map((d) => {
        const isSelected =
          format(d, "yyyy-MM-dd") === format(value, "yyyy-MM-dd");
        return (
          <TouchableOpacity
            key={d.toISOString()}
            onPress={() => onChange(d)}
            className={`px-3 py-2 rounded-xl border ${
              isSelected
                ? "bg-brand-bg border-brand-bg"
                : "bg-white border-[#E8E6DF]"
            }`}
          >
            <Text
              className={`text-xs ${
                isSelected ? "text-white font-semibold" : "text-brand-text-secondary"
              }`}
            >
              {format(d, "d MMM")}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
