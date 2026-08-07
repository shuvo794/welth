import { ALL_CURRENCIES, CurrencyEntry } from "@/components/CurrencyPicker";
import { useSupabase } from "@/hooks/useSupabase";
import { OnboardingFormValues, onboardingSchema } from "@/lib/schemas/onboarding";
import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

const Onboarding = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const authSupabase = useSupabase();
  const setCurrency = useUserStore((state) => state.setCurrency);
  const setNeedsOnboarding = useUserStore((state) => state.setNeedsOnboarding);

  const [isLoading, setIsLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onBlur",
    defaultValues: { startingBalance: "" },
  });

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyEntry>(
    ALL_CURRENCIES.find((c) => c.code === "INR") ??
      ALL_CURRENCIES.find((c) => c.code === "BDT") ??
      ALL_CURRENCIES[0],
  );

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return ALL_CURRENCIES;
    const query = searchQuery.toLowerCase();
    return ALL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const onOnboardingSubmit = async (data: OnboardingFormValues) => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const parsedBalance = parseFloat(data.startingBalance.replace(/,/g, ""));

      // 1. Update Zustand store state
      setCurrency(selectedCurrency.code);

      // 2. Update users table in Supabase
      const { error: userError } = await authSupabase
        .from("users")
        .update({ currency: selectedCurrency.code })
        .eq("clerk_id", user.id);

      if (userError) {
        console.warn("Supabase user update note:", userError.message);
      }

      // 3. Update default Cash account in Supabase
      const { error: accountError } = await authSupabase
        .from("accounts")
        .update({ balance: parsedBalance })
        .eq("user_id", user.id)
        .eq("is_default", true);

      if (accountError) {
        console.warn("Supabase account balance update note:", accountError.message);
      }

      setNeedsOnboarding(false);
      router.replace("/(root)/(tabs)");
    } catch (err: any) {
      console.error("Onboarding submission error:", err);
      setErrorMessage(err?.message || "Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 24, 32),
            paddingHorizontal: 24,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8">
            <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="wallet-outline" size={26} color="#2563EB" />
            </View>
            <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome to Welth
            </Text>
            <Text className="text-base text-gray-500 mt-2">
              Let's set up your preferred currency and starting cash balance.
            </Text>
          </View>

          {/* Form Container */}
          <View className="flex-1 justify-between">
            <View className="w-full space-y-6">
              {/* Currency Picker Card */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Primary Currency
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCurrencyModal(true)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center justify-between shadow-sm active:bg-gray-50"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                      <Text className="text-lg font-bold text-blue-600">
                        {selectedCurrency.symbol}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">
                        {selectedCurrency.code}
                      </Text>
                      <Text
                        className="text-xs text-gray-500"
                        numberOfLines={1}
                      >
                        {selectedCurrency.name}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Starting Balance Field */}
              <View className="mt-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Starting Cash Balance
                </Text>
                <Controller
                  control={control}
                  name="startingBalance"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="w-full relative flex-row items-center">
                      <View className="absolute left-4 z-10">
                        <Text className="text-lg font-bold text-gray-500">
                          {selectedCurrency.symbol}
                        </Text>
                      </View>
                      <TextInput
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="decimal-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-lg font-semibold text-gray-900 shadow-sm"
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

              {/* Error Display */}
              {errorMessage && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3.5 mt-4 flex-row items-center">
                  <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                  <Text className="text-red-600 text-sm font-medium flex-1 ml-2">
                    {errorMessage}
                  </Text>
                </View>
              )}
            </View>

            {/* Complete Setup Button */}
            <View className="mt-8">
              <TouchableOpacity
                onPress={handleSubmit(onOnboardingSubmit)}
                disabled={isLoading}
                className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-2xl items-center justify-center shadow-md shadow-blue-500/20"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Complete Setup
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[80%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Select Currency
              </Text>
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 mb-4">
              <Ionicons name="search" size={18} color="#9CA3AF" className="mr-2" />
              <TextInput
                placeholder="Search by code or name..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-base text-gray-900 ml-2"
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Currency List */}
            <FlatList
              data={filteredCurrencies}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = selectedCurrency.code === item.code;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCurrency(item);
                      setShowCurrencyModal(false);
                    }}
                    className={`flex-row items-center justify-between p-3.5 rounded-xl mb-1 ${
                      isSelected ? "bg-blue-50 border border-blue-200" : "bg-transparent"
                    }`}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <Text className="text-base font-bold text-gray-900 w-16">
                        {item.code}
                      </Text>
                      <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-base font-bold text-gray-700 mr-2">
                        {item.symbol}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default Onboarding;
