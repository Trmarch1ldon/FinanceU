"use client";

import { useEffect, useRef } from "react";

import type { LiveState } from "@/features/game-modes/types";

import { MARGIN_CALL as C } from "../config";
import { readMarket } from "../market";
import { TERMINAL as T } from "./terminal-config";

/**
 * LIMIT DOWN: flashes over the chart when the price falls fast — `limitDownDrop` from its high
 * within `limitDownWindowMs`. Shown by toggling data-limit on the chart panel, no re-render.
 */
export function LimitDownWatch({ live }: { live: LiveState }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const panel = anchorRef.current?.closest<HTMLElement>("[data-limit]");
    if (!panel) return;
    const windowSamples = T.limitDownWindowMs / C.sampleMs;
    let hideAt = 0;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const check = () => {
      const { history, price } = readMarket(live.get().modeState);
      let high = price;
      for (let i = Math.max(0, history.length - windowSamples); i < history.length; i++)
        high = Math.max(high, history[i]);
      if (high <= 0 || (high - price) / high < T.limitDownDrop) return;

      const now = performance.now();
      if (now < hideAt) return;
      hideAt = now + T.limitDownShowMs;
      panel.dataset.limit = "true";
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        panel.dataset.limit = "false";
      }, T.limitDownShowMs);
    };

    const unsubscribe = live.subscribe(check);
    return () => {
      unsubscribe();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [live]);

  return (
    <span ref={anchorRef} className="limit-down absolute inset-x-0 top-1/3 flex justify-center">
      <span className="border-2 border-down bg-bg/90 px-4 py-1.5 font-mono text-[18px] font-medium tracking-[0.2em] text-down">
        ▼ LIMIT DOWN
      </span>
    </span>
  );
}
