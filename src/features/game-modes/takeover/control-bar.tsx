"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

import type { MatchView } from "@/lib/engine/versus/player";

import type { MatchState } from "./match/types";

type ControlBarProps = { view: MatchView<MatchState>; you: string; rival: string };

/**
 * THOM 62% | 38% ANALYST. The split slides on a spring whenever control changes — no overshoot,
 * because a stake doesn't bounce past where it settled. Driven by a motion value, so React
 * never re-renders for it.
 */
export function ControlBar({ view, you, rival }: ControlBarProps) {
  const control = useMotionValue(view.get().control);
  // scaleX, not width: a transform animates without relayout.
  const scaleX = useTransform(control, [0, 100], [0, 1]);
  const youRef = useRef<HTMLSpanElement>(null);
  const rivalRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let last = view.get().control;
    const paint = (value: number) => {
      if (youRef.current) youRef.current.textContent = `${value.toFixed(1)}%`;
      if (rivalRef.current) rivalRef.current.textContent = `${(100 - value).toFixed(1)}%`;
    };
    paint(last);
    return view.subscribe((state) => {
      if (state.control === last) return;
      last = state.control;
      paint(last);
      animate(control, last, { type: "spring", bounce: 0, visualDuration: 0.35 });
    });
  }, [view, control]);

  return (
    <div className="border border-border bg-panel px-3 py-2" aria-label="Control split">
      <div className="mb-1.5 flex items-baseline justify-between font-mono tabular-nums">
        <span className="text-[13px] tracking-[0.1em] text-terminal-amber">
          {you}{" "}
          <span ref={youRef} className="text-[18px] text-fg">
            50.0%
          </span>
        </span>
        <span className="text-[13px] tracking-[0.1em] text-rival">
          <span ref={rivalRef} className="text-[18px] text-fg">
            50.0%
          </span>{" "}
          {rival}
        </span>
      </div>
      <div className="relative h-4 overflow-hidden bg-rival/70">
        <motion.div className="absolute inset-0 origin-left bg-terminal-amber" style={{ scaleX }} />
        {/* The majority line. */}
        <div aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-bg" />
      </div>
    </div>
  );
}
