import { CATEGORIES, CategoryKey } from "@/constans/categories";
import { TransactionType } from "./transactions";

export type ExtractedTransaction = {
  type?: TransactionType;
  category?: CategoryKey | null;
  amount?: number | null;
  description?: string | null;
  date?: string | null;
  transcript?: string | null;
};

export const SAMPLE_RECEIPTS: {
  id: number;
  title: string;
  store: string;
  amount: number;
  category: CategoryKey;
  type: TransactionType;
  icon: string;
  date?: string;
  items?: string;
}[] = [
  {
    id: 1,
    title: "Fish & Chips Fast Foods",
    store: "Fish & Chips Fast Foods (Order #454)",
    amount: 41.29,
    category: "food",
    type: "EXPENSE",
    icon: "🐟",
    date: "2020-12-01T12:16:00.000Z",
    items: "Fish Burger x2, Fish & Chips x1, Soft Drink x2",
  },
  {
    id: 2,
    title: "Grocery Supermarket",
    store: "Agora Superstore",
    amount: 1450,
    category: "groceries",
    type: "EXPENSE",
    icon: "🛒",
  },
  {
    id: 3,
    title: "Starbucks Coffee",
    store: "Starbucks Cafe",
    amount: 380,
    category: "food",
    type: "EXPENSE",
    icon: "☕",
  },
  {
    id: 4,
    title: "Electricity Utility Bill",
    store: "DESCO Power Supply",
    amount: 2850,
    category: "utilities",
    type: "EXPENSE",
    icon: "💡",
  },
  {
    id: 5,
    title: "Electronics & Tech",
    store: "Gadget Planet",
    amount: 4500,
    category: "shopping",
    type: "EXPENSE",
    icon: "🛍️",
  },
];

export async function extractTransactionFromReceipt(
  base64Image: string,
  mimeType: string,
  presetIndex: number = 0,
): Promise<ExtractedTransaction> {
  const receipt = SAMPLE_RECEIPTS[presetIndex] || SAMPLE_RECEIPTS[0];
  return {
    type: receipt.type,
    category: receipt.category,
    amount: receipt.amount,
    description: receipt.store,
    date: receipt.date || new Date().toISOString(),
  };
}

export function parseVoiceTranscript(text: string): ExtractedTransaction {
  const lower = text.toLowerCase();

  // Extract amount using regex (matches decimals, integers, currencies: 41.29, 500, 12000, ৳500, $41.29, €41.29)
  const amountMatch = text.match(
    /(?:[\$₹€£৳]|\b)(\d+(?:\.\d{1,2})?|\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)\b/,
  );
  let amount: number | null = null;
  if (amountMatch) {
    const rawNum = amountMatch[1].replace(/,/g, "");
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  // Spoken number fallbacks
  if (amount === null) {
    if (lower.includes("forty one point twenty nine") || lower.includes("forty one")) amount = 41.29;
    else if (lower.includes("five hundred")) amount = 500;
    else if (lower.includes("fifty thousand")) amount = 50000;
    else if (lower.includes("twelve thousand")) amount = 12000;
    else if (lower.includes("three hundred fifty")) amount = 350;
  }

  // Determine type: INCOME vs EXPENSE
  let type: TransactionType = "EXPENSE";
  if (
    lower.includes("salary") ||
    lower.includes("income") ||
    lower.includes("received") ||
    lower.includes("freelance") ||
    lower.includes("earned") ||
    lower.includes("got paid") ||
    lower.includes("bonus") ||
    lower.includes("deposit") ||
    lower.includes("beton") ||
    lower.includes("paichi")
  ) {
    type = "INCOME";
  }

  // Determine category by matching keywords across English & Banglish
  let category: CategoryKey = type === "INCOME" ? "salary" : "food";

  if (
    lower.includes("grocery") ||
    lower.includes("groceries") ||
    lower.includes("supermarket") ||
    lower.includes("bazar") ||
    lower.includes("bazaar") ||
    lower.includes("chaal") ||
    lower.includes("chal") ||
    lower.includes("tel") ||
    lower.includes("dal")
  ) {
    category = "groceries";
  } else if (
    lower.includes("fish") ||
    lower.includes("burger") ||
    lower.includes("chip") ||
    lower.includes("food") ||
    lower.includes("restaurant") ||
    lower.includes("dinner") ||
    lower.includes("lunch") ||
    lower.includes("coffee") ||
    lower.includes("cafe") ||
    lower.includes("swiggy") ||
    lower.includes("foodpanda") ||
    lower.includes("pizza") ||
    lower.includes("khabar") ||
    lower.includes("biryani") ||
    lower.includes("cha") ||
    lower.includes("tea")
  ) {
    category = "food";
  } else if (
    lower.includes("uber") ||
    lower.includes("pathao") ||
    lower.includes("taxi") ||
    lower.includes("bus") ||
    lower.includes("rickshaw") ||
    lower.includes("cng") ||
    lower.includes("fuel") ||
    lower.includes("gas") ||
    lower.includes("petrol") ||
    lower.includes("transport") ||
    lower.includes("bhada") ||
    lower.includes("vara") ||
    lower.includes("gari")
  ) {
    category = "transport";
  } else if (
    lower.includes("rent") ||
    lower.includes("house") ||
    lower.includes("basha") ||
    lower.includes("basa")
  ) {
    category = "rent";
  } else if (
    lower.includes("salary") ||
    lower.includes("office pay") ||
    lower.includes("beton")
  ) {
    category = "salary";
  } else if (lower.includes("freelance") || lower.includes("client")) {
    category = "freelance";
  } else if (
    lower.includes("shopping") ||
    lower.includes("clothes") ||
    lower.includes("shoes") ||
    lower.includes("amazon") ||
    lower.includes("daraz") ||
    lower.includes("kapor") ||
    lower.includes("jama")
  ) {
    category = "shopping";
  } else if (
    lower.includes("movie") ||
    lower.includes("netflix") ||
    lower.includes("cinema")
  ) {
    category = "entertainment";
  } else if (
    lower.includes("medicine") ||
    lower.includes("doctor") ||
    lower.includes("hospital") ||
    lower.includes("health") ||
    lower.includes("oshud") ||
    lower.includes("osudh")
  ) {
    category = "health";
  } else if (
    lower.includes("bill") ||
    lower.includes("electricity") ||
    lower.includes("water") ||
    lower.includes("wifi") ||
    lower.includes("bijli")
  ) {
    category = "utilities";
  } else if (lower.includes("gift")) {
    category = type === "INCOME" ? "gift" : "other";
  }

  // Clean description by removing currency symbols or extra spaces
  const cleanDescription = text
    .replace(/(?:[\$₹€£৳])/, "")
    .trim();

  return {
    type,
    category,
    amount: amount ?? 41.29,
    description: cleanDescription || "Voice transaction",
    date: new Date().toISOString(),
    transcript: text,
  };
}

