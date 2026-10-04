/** Number formatting for the ticker. Fixed decimals everywhere, so digits never jitter. */

export const money = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const signedMoney = (value: number) => `${value >= 0 ? "+" : "−"}${money(Math.abs(value))}`;

export const signedPct = (value: number) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;

/** 84_300 → "1:24". */
export function clock(ms: number) {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
