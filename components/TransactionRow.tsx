import { getCategoryConfig } from "@/constans/categories";
import { useDeleteTransaction } from "@/hooks/queries/useTransactionsQuery";
import { formatPrice } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { Transaction } from "@/types/transaction";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

export function TransactionRow({
  tx,
  onDelete,
}: {
  tx: Transaction;
  onDelete?: () => void;
}) {
  const currency = useUserStore((s) => s.currency);
  const config = getCategoryConfig(tx.category) || {
    label: tx.category || "Other",
    icon: "📦",
    color: "#BDC3C7",
    type: "EXPENSE",
  };
  const isIncome = tx.type === "INCOME";
  const deleteMutation = useDeleteTransaction();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onDelete) {
      onDelete();
      return;
    }

    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(tx.id),
        },
      ]
    );
  };

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={handleDelete}
      activeOpacity={0.85}
      className="bg-[#FF4D4F] rounded-[18px] ml-2 px-5 items-center justify-center flex-row"
    >
      <Feather name="trash-2" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <View className="mb-2.5">
      <Swipeable
        overshootRight={false}
        renderRightActions={renderRightActions}
      >
        <View
          className="flex-row items-center bg-white rounded-[18px] border border-[#E8E6DF] px-3.5 py-3.5 shadow-sm"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: config.color,
          }}
        >
          {/* Category Icon Circle */}
          <View
            className="w-11 h-11 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${config.color}1F` }}
          >
            <Text className="text-xl">{config.icon}</Text>
          </View>

          {/* Title & Category Pill */}
          <View className="flex-1 mr-2">
            <Text
              className="text-[#1A1D26] text-[14px] font-semibold mb-1"
              numberOfLines={1}
            >
              {tx.description || config.label}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Feather name="edit-2" size={11} color="#8A8D96" />
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${config.color}18` }}
              >
                <Text
                  className="text-[11px] font-medium"
                  style={{ color: config.color }}
                >
                  {config.label}
                </Text>
              </View>
              {tx.is_flagged && (
                <View className="flex-row items-center gap-0.5 ml-1">
                  <Feather name="alert-triangle" size={11} color="#FF6B4A" />
                  <Text className="text-[#FF6B4A] text-[11px] font-medium">
                    Flagged
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Amount */}
          <Text
            className={`text-[14px] font-semibold ${
              isIncome ? "text-[#3DDC84]" : "text-[#FF6B4A]"
            }`}
          >
            {isIncome ? "+" : "-"}
            {formatPrice(tx.amount, currency)}
          </Text>
        </View>
      </Swipeable>
    </View>
  );
}
