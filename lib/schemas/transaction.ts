import { CATEGORIES, CategoryKey } from "@/constans/categories";
import { z } from "zod";

const categoryKeys = Object.keys(CATEGORIES) as [CategoryKey, ...CategoryKey[]];

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().min(1, "Amount is required").refine((val) => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num > 0;
  }, "Enter a valid amount"),
  category: z.enum(categoryKeys, { message: "Category is required" }),
  accountId: z.string().min(1, "Please select an account"),
  description: z.string().optional(),
  date: z.date(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

