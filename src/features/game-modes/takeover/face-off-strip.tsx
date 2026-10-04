"use client";

import { useEffect, useRef } from "react";

import { SoundToggle } from "@/components/game/sound-toggle";
import type { MatchView } from "@/lib/engine/versus/player";

import { TAKEOVER as C } from "./config";
import type { MatchState } from "./match/types";

type FaceOffStripProps = { view: MatchView<MatchState>; you: string; rival: string };

const clock = (ms: number) => {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/** THOM vs ANALYST, the match clock counting down, market status. Clock writes are direct. */
export function FaceOffStrip({ view, you, rival }: FaceOffStripProps) {
  const clockRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const paint = () => {
      const state = view.get();
      if (clockRef.current) {
        clockRef.current.textContent = state.isSuddenDeath
          ? "0:00"
          : clock(C.matchMs - state.elapsed);
        clockRef.current.dataset.late = String(C.matchMs - state.elapsed < 30000);
      }
      if (statusRef.current) {
        statusRef.current.dataset.status =
          state.status === "over" ? "closed" : state.isSuddenDeath ? "sudden" : "open";
      }
    };
    paint();
    const timer = setInterval(paint, 250);
    return () => clearInterval(timer);
  }, [view]);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border border-border bg-panel px-3 py-1.5 font-mono tabular-nums">
      <span className="text-[15px] tracking-[0.14em]">
        <span className="text-terminal-amber">{you}</span>
        <span className="mx-2 text-[11px] text-muted">vs</span>
        <span className="text-rival">{rival}</span>
      </span>
      <span className="flex items-baseline gap-2">
        <span className="text-[10px] text-muted">CLOSE IN</span>
        <span
          ref={clockRef}
          className="text-[20px] leading-none text-fg data-[late=true]:text-down"
        >
          5:00
        </span>
      </span>
      <span ref={statusRef} className="group/status text-[11px] tracking-wide">
        <span className="hidden items-center gap-1.5 text-up group-data-[status=open]/status:flex">
          <span aria-hidden className="market-pulse">
            ●
          </span>{" "}
          MARKET OPEN
        </span>
        <span className="hidden items-center gap-1.5 text-down group-data-[status=sudden]/status:flex">
          <span aria-hidden className="market-pulse">
            ●
          </span>{" "}
          SUDDEN DEATH
        </span>
        <span className="hidden items-center gap-1.5 text-muted group-data-[status=closed]/status:flex">
          <span aria-hidden>■</span> MARKET CLOSED
        </span>
      </span>
      <span className="ml-auto">
        <SoundToggle />
      </span>
    </div>
  );
}
