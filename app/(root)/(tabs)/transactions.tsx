import { TransactionRow } from "@/components/TransactionRow";
import { useTransactionsQuery } from "@/hooks/queries/useTransactionsQuery";
import { TransactionType } from "@/types/transaction";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const FILTER_TABS: { label: string; value: TransactionType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Expenses", value: "EXPENSE" },
  { label: "Income", value: "INCOME" },
];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<TransactionType | "ALL">(
    "ALL",
  );
  const {
    data: transactions = [],
    isLoading,
    refetch,
    isRefetching,
  } = useTransactionsQuery();

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "ALL") return transactions;
    return transactions.filter((t) => t.type === activeFilter);
  }, [transactions, activeFilter]);

  return (
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top"]}>
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-[#1A1D26]">
        <Text className="text-brand-text-primary text-xl font-bold">
          Transactions
        </Text>
      </View>

      <View className="flex-row px-5 py-3 gap-2 bg-brand-bg">
        {FILTER_TABS.map((tab) => {
          const active = activeFilter === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-xl border ${
                active
                  ? "bg-brand-blue border-brand-blue"
                  : "bg-brand-surface border-brand-surface-border"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  active ? "text-white" : "text-brand-text-secondary"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-1 bg-brand-body px-5 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1A85FF" />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Feather name="inbox" size={40} color="#BDC3C7" />
            <Text className="text-brand-text-muted text-base mt-3">
              No transactions found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionRow tx={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom + 100, 120),
            }}
            onRefresh={refetch}
            refreshing={isRefetching}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
