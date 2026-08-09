import { Transaction } from "@/lib/services/transactions";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export async function exportTransactionsToCsv(transactions: Transaction[]) {
  if (!transactions || transactions.length === 0) {
    return { count: 0 };
  }

  const header = "ID,Date,Type,Category,Amount,Description,Status\n";
  const rows = transactions
    .map((t) => {
      const desc = (t.description || "").replace(/"/g, '""');
      return `"${t.id}","${t.date}","${t.type}","${t.category}","${t.amount}","${desc}","${t.status}"`;
    })
    .join("\n");

  const csvContent = header + rows;
  const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  const fileUri = `${dir}transactions_${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType?.UTF8 || "utf8",
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: "Export Transactions CSV",
      UTI: "public.comma-separated-values-text",
    });
  }

  return { count: transactions.length };
}
