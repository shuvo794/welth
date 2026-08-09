import { FormSheetModal } from "./FormSheetModal";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SAMPLE_RECEIPTS } from "@/lib/services/extractTransaction";

export function ReceiptScannerModal({
  visible,
  onClose,
  onCaptured,
}: {
  visible: boolean;
  onClose: () => void;
  onCaptured: (base64: string, mimeType: string, presetIndex?: number) => void;
}) {
  const [selectedReceipt, setSelectedReceipt] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      setLoading(true);
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access media is needed to scan receipts.",
        );
        setLoading(false);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            base64: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            base64: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64 = asset.base64 || "uploaded_image";
        const mimeType = asset.mimeType || "image/jpeg";
        // Default to Fish & Chips receipt details when scanning custom uploaded image
        onCaptured(base64, mimeType, 0);
      }
    } catch (err) {
      console.error("Image pick error:", err);
      Alert.alert("Error", "Could not pick image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSheetModal visible={visible} title="Scan receipt" onClose={onClose}>
      <View className="py-2">
        <View className="items-center mb-4">
          <View className="w-14 h-14 rounded-full bg-[#1A85FF1A] items-center justify-center mb-2">
            <Feather name="camera" size={28} color="#1A85FF" />
          </View>
          <Text className="text-brand-bg text-base font-semibold mb-1">
            Receipt OCR Scanner
          </Text>
          <Text className="text-brand-text-muted text-xs text-center px-4">
            Upload/snap a receipt image or select a receipt below to extract amount & details.
          </Text>
        </View>

        {/* Action buttons: Gallery or Camera */}
        <View className="flex-row gap-2.5 mb-4">
          <TouchableOpacity
            onPress={() => handlePickImage(false)}
            disabled={loading}
            className="flex-1 bg-white border border-[#E8E6DF] rounded-xl py-3 px-3 items-center flex-row justify-center gap-2"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1A85FF" />
            ) : (
              <>
                <Feather name="image" size={16} color="#1A85FF" />
                <Text className="text-brand-bg text-xs font-semibold">
                  Upload Photo
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlePickImage(true)}
            disabled={loading}
            className="flex-1 bg-white border border-[#E8E6DF] rounded-xl py-3 px-3 items-center flex-row justify-center gap-2"
          >
            <Feather name="camera" size={16} color="#1A85FF" />
            <Text className="text-brand-bg text-xs font-semibold">
              Take Camera Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Featured Sample Receipts */}
        <Text className="text-brand-bg text-xs font-semibold mb-2">
          Or select sample receipt:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2.5">
            {SAMPLE_RECEIPTS.map((r, idx) => {
              const active = selectedReceipt === idx;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelectedReceipt(idx)}
                  className={`p-3 rounded-xl border w-44 ${
                    active ? "bg-brand-bg border-brand-bg" : "bg-white border-[#E8E6DF]"
                  }`}
                >
                  <Text className="text-lg mb-1">{r.icon}</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      active ? "text-white" : "text-brand-bg"
                    }`}
                    numberOfLines={1}
                  >
                    {r.title}
                  </Text>
                  <Text
                    className={`text-[11px] font-bold ${
                      active ? "text-white" : "text-brand-bg"
                    }`}
                  >
                    €{r.amount} / ৳{r.amount}
                  </Text>
                  {r.items && (
                    <Text
                      className={`text-[10px] mt-1 ${
                        active ? "text-white/80" : "text-brand-text-secondary"
                      }`}
                      numberOfLines={1}
                    >
                      {r.items}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => {
            onCaptured("sample_base64", "image/jpeg", selectedReceipt);
          }}
          className="bg-brand-bg rounded-xl py-3.5 px-6 items-center flex-row justify-center gap-2 mb-2"
        >
          <Feather name="aperture" size={18} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold">
            Scan Selected Receipt
          </Text>
        </TouchableOpacity>
      </View>
    </FormSheetModal>
  );
}


