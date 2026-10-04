"use client";

import Link from "next/link";
import { TrendingDown } from "lucide-react";

import { MARGIN_CALL as C } from "@/features/game-modes/survival/config";
import { useBestScore } from "@/features/game-modes/survival/use-best-score";

/** The way into Survival from the dashboard. A client leaf only because the best score lives
 *  in this device's storage. */
export function MarginCallCard() {
  const bestScore = useBestScore();

  return (
    <section
      className="panel flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 transition-colors duration-200 hover:border-border-strong"
      aria-label="Margin Call"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border-strong text-down">
          <TrendingDown size={18} strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="label">Survival · Margin Call</p>
          <p className="mt-1.5 truncate text-[13px] text-fg">
            Your share price is your health. Answer fast or get margin called.
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted tabular-nums">
            Open ${C.startPrice} · drain ${C.baseDrainPerSec.toFixed(2)}/s and rising · +$
            {C.baseSpike}–{C.fastSpike} right · −${C.wrongGap} wrong
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="label">Best</p>
          <p className="mt-1.5 font-mono text-[18px] leading-none text-fg tabular-nums">
            {bestScore === null ? "—" : bestScore.toLocaleString("en-US")}
          </p>
        </div>
        <Link
          href="/play/survival"
          className="rounded-md bg-accent px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-bg transition-opacity hover:opacity-90"
        >
          OPEN MARKET
        </Link>
      </div>
    </section>
  );
}
