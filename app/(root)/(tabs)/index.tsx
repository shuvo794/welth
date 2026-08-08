import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const QUICK_ACTIONS = [
  {
    icon: "camera",
    label: "AI Receipt Scan",
    action: "scan",
    color: "#1A85FF",
  },
  {
    icon: "mic",
    label: "Voice Entry",
    action: "voice",
    color: "#FF6B4A",
  },
  {
    icon: "plus",
    label: "Add Manually",
    action: "manual",
    color: "#3DDC84",
  },
] as const;

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const currency = useUserStore((s) => s.currency);
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-lg font-bold text-gray-800">Home Screen</Text>
    </View>
  );
}
