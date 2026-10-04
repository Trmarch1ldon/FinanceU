"use client";

import { useEffect, useState } from "react";

import type { GameState, LiveState } from "@/features/game-modes/types";

/**
 * A slow-moving value derived from the live state, polled on a timer. React bails out when the
 * value is unchanged, so a badge that changes twice a run re-renders twice a run — not on
 * every tick. `derive` must return a primitive and be a module-level function.
 */
export function useLiveValue<V extends string | number>(
  live: LiveState,
  derive: (state: GameState) => V,
  intervalMs = 500,
) {
  const [value, setValue] = useState<V>(() => derive(live.get()));

  useEffect(() => {
    const timer = setInterval(() => setValue(derive(live.get())), intervalMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- derive is module-level by contract
  }, [live, intervalMs]);

  return value;
}
