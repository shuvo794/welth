import cc from "currency-codes";
import getSymbol from "currency-symbol-map";

export type CurrencyEntry = { code: string; name: string; symbol: string };

export const ALL_CURRENCIES: CurrencyEntry[] = cc
  .codes()
  .map((code) => ({
    code,
    name: cc.code(code)?.currency ?? code,
    symbol: getSymbol(code) ?? code,
  }))
  .filter((c) => c.symbol !== c.code); // drop ones with no real symbol

export function CurrencyPicker() {}
