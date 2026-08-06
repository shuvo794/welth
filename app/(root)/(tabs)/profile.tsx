import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut } = useClerk();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const email = user?.primaryEmailAddress?.emailAddress || "No email provided";
  const avatarUrl = user?.imageUrl;

  const handleLogoutPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 16, 32),
          paddingBottom: Math.max(insets.bottom + 100, 120),
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <Text className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</Text>
        </View>

        {/* User Profile Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 items-center mb-6">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 88, height: 88, borderRadius: 44 }}
              className="mb-4 bg-gray-200"
            />
          ) : (
            <View className="w-22 h-22 rounded-full bg-blue-600 items-center justify-center mb-4">
              <Text className="text-3xl font-bold text-white">
                {fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text className="text-xl font-bold text-gray-900 text-center">{fullName}</Text>
          <Text className="text-sm font-medium text-gray-500 mt-1 text-center">{email}</Text>

          <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full mt-3">
            <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
            <Text className="text-xs font-semibold text-blue-700">Signed In</Text>
          </View>
        </View>

        {/* Menu Section 1: Account Settings */}
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
            Account
          </Text>
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <TouchableOpacity className="flex-row items-center px-4 py-3.5 border-b border-gray-100 active:bg-gray-50">
              <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#2563EB" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-800">Personal Information</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center px-4 py-3.5 border-b border-gray-100 active:bg-gray-50">
              <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-800">Security & Privacy</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center px-4 py-3.5 active:bg-gray-50">
              <View className="w-9 h-9 rounded-xl bg-purple-50 items-center justify-center mr-3">
                <Ionicons name="card-outline" size={20} color="#8B5CF6" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-800">Payment Methods</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Section 2: Preferences */}
        <View className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
            Preferences
          </Text>
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <TouchableOpacity className="flex-row items-center px-4 py-3.5 border-b border-gray-100 active:bg-gray-50">
              <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-800">Notifications</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center px-4 py-3.5 active:bg-gray-50">
              <View className="w-9 h-9 rounded-xl bg-sky-50 items-center justify-center mr-3">
                <Ionicons name="help-circle-outline" size={20} color="#0EA5E9" />
              </View>
              <Text className="flex-1 text-base font-semibold text-gray-800">Help & Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogoutPress}
          className="bg-red-50 border border-red-100 rounded-2xl py-4 flex-row items-center justify-center active:bg-red-100"
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-600 font-bold text-base ml-2">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isLoggingOut && setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full max-w-sm rounded-3xl p-6 items-center shadow-xl">
            <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
              <Ionicons name="log-out-outline" size={32} color="#EF4444" />
            </View>

            <Text className="text-xl font-bold text-gray-900 text-center">Log Out?</Text>
            <Text className="text-sm text-gray-500 text-center mt-2 mb-6">
              Are you sure you want to log out of your account?
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                disabled={isLoggingOut}
                onPress={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-100 py-3.5 rounded-2xl items-center"
              >
                <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isLoggingOut}
                onPress={confirmLogout}
                className="flex-1 bg-red-600 py-3.5 rounded-2xl items-center justify-center"
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">Log Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
