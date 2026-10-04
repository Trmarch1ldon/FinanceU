"use client";

import type { GameState, LiveState } from "@/features/game-modes/types";
import { cn } from "@/lib/utils";

import { readMarket } from "../market";
import { currentMomentum, ratingFor } from "./candles";
import { useLiveValue } from "./use-live-value";

const ratingLabel = (state: GameState) => {
  const { history, marks } = readMarket(state.modeState);
  return ratingFor(currentMomentum(history, marks)).label;
};

/** Analyst consensus, from momentum: Strong Sell → Strong Buy. */
export function RatingBadge({ live }: { live: LiveState }) {
  const label = useLiveValue(live, ratingLabel);
  const tone = label.includes("BUY") ? "up" : label.includes("SELL") ? "down" : "muted";

  return (
    <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide">
      <span className="text-muted">RATING</span>
      <span
        className={cn(
          "border px-1.5 py-px",
          tone === "up" && "border-up text-up",
          tone === "down" && "border-down text-down",
          tone === "muted" && "border-border-strong text-fg",
        )}
      >
        {label}
      </span>
    </span>
  );
}
