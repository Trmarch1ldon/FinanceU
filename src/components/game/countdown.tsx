"use client";

import { useEffect, useState } from "react";

import { playCountdownTick, playOpeningBell } from "@/lib/sound";

type CountdownProps = {
  onDone: () => void;
  /** Seconds to count down from. */
  seconds?: number;
  label?: string;
};

/** "Market opens in 3…" — the price doesn't move until this calls `onDone`. */
export function Countdown({ onDone, seconds = 3, label = "MARKET OPENS IN" }: CountdownProps) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left === 0) {
      playOpeningBell();
      onDone();
      return;
    }
    playCountdownTick();
    const timer = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [left, onDone]);

  return (
    <section
      className="mx-auto max-w-xl border border-border bg-bg px-6 py-16 text-center"
      aria-live="assertive"
    >
      <p className="font-mono text-[10px] tracking-[0.16em] text-terminal-amber">{label}</p>
      <p
        key={left}
        className="countdown-tick mt-4 font-mono text-[72px] leading-none font-medium text-terminal-amber tabular-nums"
      >
        {Math.max(left, 1)}
      </p>
    </section>
  );
}
