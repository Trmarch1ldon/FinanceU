"use client";

import { useEffect, useRef } from "react";

import type { LiveState } from "@/features/game-modes/types";

import { MARGIN_CALL as C } from "../config";
import { clock, money } from "../format";
import { drainPerSec, readMarket } from "../market";
import { SoundToggle } from "../sound-toggle";
import { wallClock } from "./feed";
import { setCell } from "./flash";
import { TERMINAL as T } from "./terminal-config";

type StatusStripProps = { ticker: string; live: LiveState };

/**
 * The top quote line. Repaints on its own 250ms timer rather than every tick: a cell that
 * flashes ten times a second is noise, four times is a market moving. All writes go straight
 * to the DOM; this component renders once.
 */
export function StatusStrip({ ticker, live }: StatusStripProps) {
  const priceRef = useRef<HTMLSpanElement>(null);
  const changeRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const survivedRef = useRef<HTMLSpanElement>(null);
  const drainRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const marketRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastPrice: number = C.startPrice;
    const paint = () => {
      const state = live.get();
      const { price } = readMarket(state.modeState);
      const change = price - C.startPrice;
      const trend = change >= 0 ? "up" : "down";

      setCell(priceRef.current, money(price), price, lastPrice);
      if (priceRef.current) priceRef.current.dataset.trend = trend;
      if (changeRef.current) {
        changeRef.current.textContent = `${trend === "up" ? "▲" : "▼"}${Math.abs(change).toFixed(2)}`;
        changeRef.current.dataset.trend = trend;
      }
      if (pctRef.current) {
        pctRef.current.textContent = `${change >= 0 ? "+" : "−"}${Math.abs((change / C.startPrice) * 100).toFixed(2)}%`;
        pctRef.current.dataset.trend = trend;
      }
      if (survivedRef.current) survivedRef.current.textContent = clock(state.elapsedMs);
      if (drainRef.current)
        drainRef.current.textContent = `−${drainPerSec(state.elapsedMs).toFixed(2)}/s`;
      if (clockRef.current) clockRef.current.textContent = wallClock(Date.now());
      if (marketRef.current) marketRef.current.dataset.halted = String(state.status !== "playing");
      lastPrice = price;
    };

    paint();
    const timer = setInterval(paint, T.quoteRefreshMs);
    return () => clearInterval(timer);
  }, [live]);

  const trendClass = "data-[trend=down]:text-down data-[trend=up]:text-up";

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border border-border bg-panel px-3 py-1.5 font-mono tabular-nums">
      <span className="text-[13px] tracking-[0.14em] text-terminal-amber">{ticker}</span>
      <span ref={priceRef} className={`px-1 text-[20px] leading-none font-medium ${trendClass}`}>
        {money(C.startPrice)}
      </span>
      <span ref={changeRef} className={`text-[12px] ${trendClass}`}>
        ▲0.00
      </span>
      <span ref={pctRef} className={`text-[12px] ${trendClass}`}>
        +0.00%
      </span>
      <span ref={marketRef} className="group/market text-[11px] tracking-wide">
        <span className="flex items-center gap-1.5 text-up group-data-[halted=true]/market:hidden">
          <span aria-hidden className="market-pulse">
            ●
          </span>
          MARKET OPEN
        </span>
        <span className="hidden items-center gap-1.5 text-down group-data-[halted=true]/market:flex">
          <span aria-hidden>■</span>
          HALTED
        </span>
      </span>

      <span className="ml-auto flex items-center gap-5 text-[11px] text-muted">
        <span>
          SURV{" "}
          <span ref={survivedRef} className="text-fg">
            0:00
          </span>
        </span>
        <span>
          DRAIN{" "}
          <span ref={drainRef} className="text-down">
            −{C.baseDrainPerSec.toFixed(2)}/s
          </span>
        </span>
        <span ref={clockRef} className="text-fg">
          --:--:--
        </span>
        <SoundToggle />
      </span>
    </div>
  );
}
