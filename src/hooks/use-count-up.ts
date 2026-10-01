"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** useLayoutEffect warns during SSR; the effect only matters in the browser anyway. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Options = {
  durationMs?: number;
  delayMs?: number;
};

/**
 * Counts 0 → `target` once, on mount.
 *
 * Three things this has to get right:
 *
 * 1. **Hydration.** The server has no clock, so it renders `target`. State starts there too,
 *    then a layout effect resets to 0 *before paint* — so the real number is never briefly
 *    visible and the markup still matches.
 * 2. **Reduced motion.** The global CSS rule can't stop a rAF loop, so this checks the media
 *    query itself and simply stays at `target`.
 * 3. **Once.** Navigating back to the dashboard shouldn't replay the whole arrival, so the
 *    animation is keyed to mount, not to `target` changing.
 */
export function useCountUp(target: number, { durationMs = 700, delayMs = 0 }: Options = {}) {
  const [value, setValue] = useState(target);
  const frame = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion() || durationMs <= 0) return;

    setValue(0);

    const run = () => {
      const started = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - started) / durationMs, 1);
        // Same decelerating curve as --ease-arrive, so JS and CSS arrivals agree.
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) frame.current = requestAnimationFrame(step);
        else setValue(target);
      };

      frame.current = requestAnimationFrame(step);
    };

    if (delayMs > 0) timer.current = setTimeout(run, delayMs);
    else run();

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (timer.current !== null) clearTimeout(timer.current);
    };
    // Mount only — see (3) above. `target` is deliberately not a dependency: the count
    // is an arrival animation, not a live subscription to the value.
  }, []);

  return value;
}
