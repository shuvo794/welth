import getSymbol from "currency-symbol-map";

export function formatPrice(amount: number, currency: string = "USD"): string {
  const symbol = getSymbol(currency) ?? currency ?? "$";
  const formattedAmount = Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedAmount}`;
}
