import { ALL_CURRENCIES, CurrencyPicker } from "@/components/CurrencyPicker";
import { useSupabase } from "@/hooks/useSupabase";
import { OnboardingFormValues, onboardingSchema } from "@/lib/schemas/onboarding";
import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const authSupabase = useSupabase();
  const setCurrency = useUserStore((state) => state.setCurrency);
  const setNeedsOnboarding = useUserStore((state) => state.setNeedsOnboarding);

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onBlur",
    defaultValues: { startingBalance: "" },
  });

  const [selectedCurrency, setSelectedCurrency] = useState(
    ALL_CURRENCIES.find((c) => c.code === "INR") ?? ALL_CURRENCIES[0]
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data: OnboardingFormValues) => {
    if (!user) return;
    setSaving(true);
    setError("");

    try {
      const parsedBalance = parseFloat(data.startingBalance.replace(/,/g, ""));

      setCurrency(selectedCurrency.code);

      const { error: userError } = await authSupabase
        .from("users")
        .update({ currency: selectedCurrency.code })
        .eq("clerk_id", user.id);

      if (userError) console.warn("Supabase user update note:", userError.message);

      const { error: accountError } = await authSupabase
        .from("accounts")
        .update({ balance: parsedBalance })
        .eq("user_id", user.id)
        .eq("is_default", true);

      if (accountError) console.warn("Supabase account balance update note:", accountError.message);

      setNeedsOnboarding(false);
      router.replace("/(root)/(tabs)");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err?.message || "Failed to complete setup.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F6]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: Math.max(insets.top + 20, 36),
            paddingBottom: Math.max(insets.bottom + 20, 24),
            paddingHorizontal: 24,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Header */}
          <View className="mb-10 mt-2">
            <View className="flex-row items-center">
              <Ionicons name="stats-chart" size={28} color="#1E293B" />
              <Text className="text-3xl font-extrabold text-[#0F172A] tracking-tight ml-2">
                Welth<Text className="text-blue-600">.</Text>
              </Text>
            </View>
          </View>

          {/* Heading & Subtitle */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 tracking-tight">
              Let's get you set up
            </Text>
            <Text className="text-sm text-gray-500 mt-2 font-normal">
              A couple of quick details to personalise your experience.
            </Text>
          </View>

          {/* Starting balance field */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Starting balance
            </Text>
            <Controller
              control={control}
              name="startingBalance"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="w-full relative flex-row items-center bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3.5">
                  <Text className="text-base text-gray-400 mr-2 font-medium">
                    {selectedCurrency.symbol}
                  </Text>
                  <TextInput
                    placeholder="e.g. 50000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    className="flex-1 text-base text-gray-900 font-medium py-0"
                  />
                </View>
              )}
            />
            {formErrors.startingBalance && (
              <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
                {formErrors.startingBalance.message}
              </Text>
            )}
          </View>

          {/* Currency field */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Currency
            </Text>
            <TouchableOpacity
              onPress={() => setPickerOpen(true)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 flex-row items-center justify-between shadow-sm active:bg-gray-50"
            >
              <Text
                className="text-base text-gray-900 font-medium flex-1 pr-2"
                numberOfLines={1}
              >
                {selectedCurrency.symbol} {selectedCurrency.code} — {selectedCurrency.name}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex-row items-center">
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text className="text-red-600 text-sm font-medium flex-1 ml-2">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Get started button */}
          <View className="mt-4">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={saving}
              className="w-full bg-[#0F172A] active:bg-gray-800 py-4 rounded-2xl items-center justify-center shadow-sm"
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Get started
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Currency Picker Modal Component */}
      <CurrencyPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setSelectedCurrency}
        selectedCurrency={selectedCurrency}
      />
    </SafeAreaView>
  );
}
