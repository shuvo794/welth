import { formatPrice } from "@/lib/utils";
import type { Budgets } from "./budgets";
import type { Transaction } from "./transactions";

export async function askAssistant(
  question: string,
  transactions: Transaction[],
  budget: Budgets | null,
  currency: string = "BDT",
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  // Calculate summary metrics
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const categoryBreakdown = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => `- ${cat}: ${formatPrice(amount, currency)}`)
    .join("\n");

  const topTransactions = [...transactions]
    .filter((t) => t.type === "EXPENSE")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map(
      (t) =>
        `- ${t.description || t.category}: ${formatPrice(t.amount, currency)} (${t.category}, ${t.date.split("T")[0]})`,
    )
    .join("\n");

  const budgetInfo = budget
    ? `Monthly Budget Limit: ${formatPrice(budget.amount, currency)}. Spent so far: ${formatPrice(totalExpense, currency)} (${((totalExpense / budget.amount) * 100).toFixed(1)}%).`
    : "No monthly budget limit is set.";

  const promptContext = `
You are Welth AI, an intelligent, helpful, and friendly personal finance assistant.
Your goal is to answer the user's financial question based on their recent transactions and budget data.

Financial Overview:
- Currency: ${currency}
- Total Income: ${formatPrice(totalIncome, currency)}
- Total Expense: ${formatPrice(totalExpense, currency)}
- Net Balance: ${formatPrice(totalIncome - totalExpense, currency)}
- ${budgetInfo}

Expenses by Category:
${categoryBreakdown || "No expenses recorded."}

Top Expenses:
${topTransactions || "No expenses recorded."}

Instructions:
- Provide a clear, concise, and direct response (maximum 2-3 short paragraphs).
- Use ${currency} for money amounts.
- If asked about budget, compare expenses against the budget.
- Be encouraging and offer practical financial tips if relevant.
`;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptContext },
                  { text: `User Question: ${question}` },
                ],
              },
            ],
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const textResponse =
          data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          return textResponse.trim();
        }
      } else {
        console.warn("Gemini API HTTP Error:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Gemini API Request Error:", error);
    }
  }

  // Local fallback if API key is missing or fails
  const q = question.toLowerCase();

  if (q.includes("food") || q.includes("eating") || q.includes("restaurant")) {
    const foodSpend = categoryTotals["food"] || 0;
    return `You have spent ${formatPrice(foodSpend, currency)} on food recently.`;
  }

  if (q.includes("biggest") || q.includes("highest") || q.includes("most expensive")) {
    const highest = [...transactions]
      .filter((t) => t.type === "EXPENSE")
      .sort((a, b) => b.amount - a.amount)[0];
    if (highest) {
      return `Your largest expense was ${formatPrice(highest.amount, currency)} for "${highest.description || highest.category}" on ${highest.date.split("T")[0]}.`;
    }
    return "You have no recorded expenses yet.";
  }

  if (q.includes("budget") || q.includes("limit") || q.includes("over budget")) {
    if (!budget) {
      return "You haven't set a monthly budget limit yet. You can set one in the Profile tab.";
    }
    const percent = ((totalExpense / budget.amount) * 100).toFixed(1);
    if (totalExpense > budget.amount) {
      return `Warning: You are over budget! You spent ${formatPrice(totalExpense, currency)}, which is ${percent}% of your ${formatPrice(budget.amount, currency)} budget limit.`;
    }
    return `You're within your budget! You've spent ${formatPrice(totalExpense, currency)} out of your ${formatPrice(budget.amount, currency)} budget limit (${percent}%).`;
  }

  return `Based on your data:
- Total Income: ${formatPrice(totalIncome, currency)}
- Total Expenses: ${formatPrice(totalExpense, currency)}
- Net Balance: ${formatPrice(totalIncome - totalExpense, currency)}

Feel free to ask specific questions about your spending by category or budget!`;
}
