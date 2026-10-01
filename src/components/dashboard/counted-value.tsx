"use client";

import { useEffect, useLayoutEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

/** useLayoutEffect warns during SSR; the effect only matters in the browser anyway. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Same decelerating curve as --ease-arrive, so JS and CSS arrivals agree. */
const EASE_ARRIVE = [0.22, 1, 0.36, 1] as const;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type CountedValueProps = {
  value: number;
  /** Digits after the decimal point. Fixed, so the width never jumps mid-count. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delayMs?: number;
  durationMs?: number;
  className?: string;
};

/**
 * A number that ticks up on arrival. Always rendered with `tabular-nums` and a fixed
 * decimal count, so the glyph width is constant and nothing reflows while it counts.
 *
 * The count lives in a motion value that writes the text node directly — a dashboard
 * of these used to re-render React every frame for a second.
 *
 * - **Hydration.** The value starts at `value`, so the server markup matches. A layout
 *   effect drops it to 0 before paint, so the real number is never briefly visible.
 * - **Reduced motion.** MotionConfig only governs motion components, not a bare
 *   `animate()`, so this checks the media query itself and stays at `value`.
 * - **Once.** The count is an arrival, keyed to mount — not a live subscription.
 */
export function CountedValue({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delayMs = 0,
  durationMs = 1000,
  className,
}: CountedValueProps) {
  const count = useMotionValue(value);
  const text = useTransform(
    () =>
      prefix +
      count.get().toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) +
      suffix,
  );

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || durationMs <= 0) return;

    count.jump(0);
    const controls = animate(count, value, {
      duration: durationMs / 1000,
      delay: delayMs / 1000,
      ease: EASE_ARRIVE,
    });
    return () => controls.stop();
    // Mount only — see "Once" above.
  }, []);

  return (
    <motion.span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {text}
    </motion.span>
  );
}
