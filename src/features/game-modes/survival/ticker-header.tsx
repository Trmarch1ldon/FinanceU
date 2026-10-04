"use client";

import { useEffect, useRef } from "react";

import type { LiveState } from "@/features/game-modes/types";
import { cn } from "@/lib/utils";

import { MARGIN_CALL as C } from "./config";
import { clock, money, signedMoney, signedPct } from "./format";
import { drainPerSec, isBullRun, readMarket } from "./market";

type TickerHeaderProps = {
  ticker: string;
  live: LiveState;
  /** From the session's React state, which refreshes on every answer. */
  streak: number;
};

/**
 * The quote line. Price, change, clock and drain change ten times a second, so they're
 * written straight to their text nodes from the live subscription; only the streak — which
 * changes on answers — goes through React.
 */
export function TickerHeader({ ticker, live, streak }: TickerHeaderProps) {
  const priceRef = useRef<HTMLSpanElement>(null);
  const changeRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const drainRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const render = () => {
      const state = live.get();
      const { price } = readMarket(state.modeState);
      const change = price - C.startPrice;
      const trend = change >= 0 ? "up" : "down";

      if (priceRef.current) {
        priceRef.current.textContent = money(price);
        priceRef.current.dataset.trend = trend;
      }
      if (changeRef.current) {
        changeRef.current.textContent = `${trend === "up" ? "▲" : "▼"} ${signedMoney(change)}  ${signedPct((change / C.startPrice) * 100)}`;
        changeRef.current.dataset.trend = trend;
      }
      if (timeRef.current) timeRef.current.textContent = clock(state.elapsedMs);
      if (drainRef.current)
        drainRef.current.textContent = `−${drainPerSec(state.elapsedMs).toFixed(2)}/s`;
    };

    render();
    return live.subscribe(render);
  }, [live]);

  const isBull = isBullRun(streak);

  return (
    <header className="panel flex flex-wrap items-end justify-between gap-x-8 gap-y-3 px-4 py-3">
      <div className="flex items-end gap-4">
        <div>
          <p className="label">Ticker</p>
          <p className="mt-1.5 font-mono text-[15px] tracking-[0.14em] text-accent">{ticker}</p>
        </div>
        <div>
          <span
            ref={priceRef}
            className="block font-mono text-[34px] leading-none font-medium tracking-tight tabular-nums data-[trend=down]:text-down data-[trend=up]:text-up"
            aria-live="off"
          >
            {money(C.startPrice)}
          </span>
          <span
            ref={changeRef}
            className="mt-1.5 block font-mono text-[12px] whitespace-pre tabular-nums data-[trend=down]:text-down data-[trend=up]:text-up"
          >
            ▲ +$0.00 +0.00%
          </span>
        </div>
      </div>

      <dl className="flex gap-8 font-mono tabular-nums">
        <div>
          <dt className="label">Survived</dt>
          <dd ref={timeRef} className="mt-1.5 text-[18px] leading-none text-fg">
            0:00
          </dd>
        </div>
        <div>
          <dt className="label">Drain</dt>
          <dd ref={drainRef} className="mt-1.5 text-[18px] leading-none text-down">
            −{C.baseDrainPerSec.toFixed(2)}/s
          </dd>
        </div>
        <div>
          <dt className="label">Streak</dt>
          <dd className={cn("mt-1.5 text-[18px] leading-none", isBull ? "text-up" : "text-fg")}>
            {streak}
            {isBull && (
              <span className="ml-2 align-middle text-[11px] tracking-wide">
                BULL RUN ×{C.bullRunMultiplier}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </header>
  );
}
