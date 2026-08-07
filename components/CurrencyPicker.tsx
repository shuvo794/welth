import cc from "currency-codes";
import getSymbol from "currency-symbol-map";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type CurrencyEntry = { code: string; name: string; symbol: string };

export const ALL_CURRENCIES: CurrencyEntry[] = cc
  .codes()
  .map((code) => ({
    code,
    name: cc.code(code)?.currency ?? code,
    symbol: getSymbol(code) ?? code,
  }))
  .filter((c) => c.symbol !== c.code); // drop ones with no real symbol

interface CurrencyPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: CurrencyEntry) => void;
  selectedCurrency?: CurrencyEntry;
}

export function CurrencyPicker({
  visible,
  onClose,
  onSelect,
  selectedCurrency,
}: CurrencyPickerProps) {
  const [search, setSearch] = useState("");

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return ALL_CURRENCIES;
    const query = search.toLowerCase();
    return ALL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Search Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
          <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex-row items-center mr-3">
            <TextInput
              placeholder="Search currency..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 text-base text-gray-900 py-0"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-base text-gray-500 font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Currency List */}
        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => (
            <View className="h-[1px] bg-gray-100 ml-16" />
          )}
          renderItem={({ item }) => {
            const isSelected = selectedCurrency?.code === item.code;
            return (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                className={`flex-row items-center px-4 py-3.5 bg-white active:bg-gray-50 ${
                  isSelected ? "bg-gray-50" : ""
                }`}
              >
                {/* Currency Symbol */}
                <Text className="w-10 text-center text-sm font-semibold text-gray-500 mr-3">
                  {item.symbol}
                </Text>
                {/* Currency Code */}
                <Text className="text-base font-bold text-gray-900 w-14 mr-2">
                  {item.code}
                </Text>
                {/* Currency Name */}
                <Text
                  className="text-sm text-gray-400 font-medium flex-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}
