import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  return (
    <View className="p-4 flex-1 items-center justify-center">
      <Text className="text-3xl font-bold text-center">Welcome to Welth</Text>
      <Text className="text-sm font-semibold text-center mt-2">
        Manage your finances
      </Text>
      <View className="w-full max-w-md">
        <TextInput
          placeholder="Email"
          className="border-2 border-gray-300 p-2 rounded-lg mt-10"
        />
        <TextInput
          placeholder="Password"
          className="border-2 border-gray-300 p-2 rounded-lg mt-10"
          secureTextEntry
        />
        <TouchableOpacity
          onPress={() => alert("Sign In")}
          className="bg-blue-500 p-2 rounded-lg mt-10"
        >
          <Text className="text-white text-center">Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
