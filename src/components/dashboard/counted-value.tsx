"use client";

import { useCountUp } from "@/hooks/use-count-up";

type CountedValueProps = {
  value: number;
  /** Digits after the decimal point. Fixed, so the width never jumps mid-count. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delayMs?: number;
  className?: string;
};

/**
 * A number that ticks up on arrival. Always rendered with `tabular-nums` and a fixed
 * decimal count, so the glyph width is constant and nothing reflows while it counts.
 */
export function CountedValue({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delayMs = 0,
  className,
}: CountedValueProps) {
  const current = useCountUp(value, { delayMs });
  const text = current.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
