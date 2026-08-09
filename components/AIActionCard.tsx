import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function AIActionCard({
  icon,
  title,
  subtitle,
  colors,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  colors: [string, string];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-1 rounded-2xl overflow-hidden"
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 14, borderRadius: 16 }}
      >
        <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mb-2">
          <Feather name={icon} size={16} color="#FFFFFF" />
        </View>
        <Text className="text-white text-xs font-semibold">{title}</Text>
        <Text className="text-white/80 text-[10px] mt-0.5">{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
