"use client";

import type { GameState, LiveState } from "@/features/game-modes/types";
import { cn } from "@/lib/utils";

import { difficultyAt } from "../market";
import { useLiveValue } from "./use-live-value";

const LEVELS = ["LOW", "ELEVATED", "EXTREME"] as const;
const level = (state: GameState) => difficultyAt(state);

/** Current question difficulty, read as market volatility. */
export function VolatilityGauge({ live }: { live: LiveState }) {
  const value = useLiveValue(live, level);

  return (
    <span
      className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide"
      aria-label={`Volatility ${LEVELS[value - 1]}, difficulty ${value} of 3`}
    >
      <span className="text-muted">VOLATILITY</span>
      <span aria-hidden className="flex gap-0.5">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn(
              "h-2.5 w-1.5",
              bar > value ? "bg-border-strong" : value === 3 ? "bg-down" : "bg-terminal-amber",
            )}
          />
        ))}
      </span>
      <span className={value === 3 ? "text-down" : "text-fg"}>{LEVELS[value - 1]}</span>
    </span>
  );
}
