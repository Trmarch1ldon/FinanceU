"use client";

import { useEffect, useState } from "react";

import { MARGIN_CALL as C } from "./config";

type CountdownProps = { onDone: () => void };

/** "Market opens in 3…" — the price doesn't move until this calls `onDone`. */
export function Countdown({ onDone }: CountdownProps) {
  const [left, setLeft] = useState<number>(C.countdownSec);

  useEffect(() => {
    if (left === 0) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [left, onDone]);

  return (
    <section className="panel mx-auto max-w-xl px-6 py-16 text-center" aria-live="assertive">
      <p className="label">Market opens in</p>
      <p
        key={left}
        className="countdown-tick mt-4 font-mono text-[72px] leading-none font-medium text-accent tabular-nums"
      >
        {Math.max(left, 1)}
      </p>
    </section>
  );
}
