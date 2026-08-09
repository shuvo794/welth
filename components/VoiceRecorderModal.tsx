import { FormSheetModal } from "./FormSheetModal";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ExtractedTransaction,
  parseVoiceTranscript,
} from "@/lib/services/extractTransaction";

const VOICE_SAMPLES = [
  "Fish & Chips 41.29",
  "Groceries 500 taka",
  "Salary 50000 office",
  "House rent 12000",
  "Uber ride 350",
  "Shopping 2500",
];

export function VoiceRecorderModal({
  visible,
  onClose,
  onExtracted,
}: {
  visible: boolean;
  onClose: () => void;
  onExtracted: (result: ExtractedTransaction) => void;
}) {
  const [inputText, setInputText] = useState("Fish & Chips 41.29");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Microphone access is needed for voice entry.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsRecording(true);
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch (err) {
        console.error("Stop recording error:", err);
      } finally {
        recordingRef.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleProcess = (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    if (isRecording) {
      stopRecording();
    }
    const extracted = parseVoiceTranscript(textToProcess);
    onExtracted(extracted);
    onClose();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <FormSheetModal visible={visible} title="Voice log" onClose={onClose}>
      <View className="py-2">
        <View className="items-center mb-4">
          <TouchableOpacity
            onPress={toggleRecording}
            activeOpacity={0.8}
            className={`w-16 h-16 rounded-full items-center justify-center mb-2 shadow-sm ${
              isRecording ? "bg-[#FF6B4A]" : "bg-[#FF6B4A1A]"
            }`}
          >
            <Feather
              name={isRecording ? "square" : "mic"}
              size={28}
              color={isRecording ? "#FFFFFF" : "#FF6B4A"}
            />
          </TouchableOpacity>
          <Text className="text-brand-bg text-base font-semibold mb-1">
            {isRecording
              ? `🎙️ Recording audio (${formatSeconds(recordingDuration)})...`
              : "Tap Mic & Speak"}
          </Text>
          <Text className="text-brand-text-muted text-xs text-center px-4">
            Say what you bought and the price (e.g. &quot;Fish and chips 41.29&quot; or &quot;Groceries 500&quot;)
          </Text>
        </View>

        {/* Voice Input Box */}
        <Text className="text-brand-bg text-xs font-semibold mb-1.5">
          Spoken Voice Text / Price & Category:
        </Text>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="e.g. Fish and chips 41.29 or Groceries 500"
          placeholderTextColor="#8A8D96"
          multiline
          numberOfLines={2}
          className="bg-white border border-[#E8E6DF] rounded-xl px-4 py-3 text-sm text-brand-bg mb-3"
        />

        {/* Quick Voice Chips */}
        <Text className="text-brand-bg text-xs font-semibold mb-2">
          Or tap a sample voice command:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {VOICE_SAMPLES.map((sample, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  setInputText(sample);
                  handleProcess(sample);
                }}
                className="bg-white border border-[#E8E6DF] px-3.5 py-2 rounded-full flex-row items-center gap-1.5"
              >
                <Feather name="mic" size={12} color="#FF6B4A" />
                <Text className="text-brand-bg text-xs font-medium">{sample}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => handleProcess(inputText)}
          className="bg-brand-bg rounded-xl py-3.5 px-6 items-center flex-row justify-center gap-2 mb-2"
        >
          <Feather name="check-circle" size={18} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold">
            Apply Voice Data to Form
          </Text>
        </TouchableOpacity>
      </View>
    </FormSheetModal>
  );
}



