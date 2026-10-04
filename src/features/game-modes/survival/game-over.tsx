"use client";

import type { LiveState } from "@/features/game-modes/types";

import { MARGIN_CALL as C } from "./config";
import { clock, money } from "./format";
import { PriceChart } from "./price-chart";

type GameOverProps = {
  ticker: string;
  live: LiveState;
  score: number;
  elapsedMs: number;
  ath: number;
  answered: number;
  correct: number;
  bestStreak: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
};

export function GameOver({
  ticker,
  live,
  score,
  elapsedMs,
  ath,
  answered,
  correct,
  bestStreak,
  isNewBest,
  onPlayAgain,
  onExit,
}: GameOverProps) {
  const accuracy = answered ? (correct / answered) * 100 : 0;
  const seconds = Math.floor(elapsedMs / 1000);

  const stats = [
    { label: "Score", value: score.toLocaleString("en-US"), isAccent: true },
    { label: "Survived", value: clock(elapsedMs) },
    { label: "All-time high", value: money(ath) },
    { label: "Answered", value: `${answered}` },
    { label: "Accuracy", value: `${accuracy.toFixed(1)}%` },
    { label: "Best streak", value: `${bestStreak}` },
  ];

  return (
    <section className="panel overflow-hidden" aria-labelledby="margin-call-title">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <h1
            id="margin-call-title"
            className="font-mono text-[28px] leading-none font-medium tracking-[0.08em] text-down"
          >
            <span aria-hidden>▼ </span>MARGIN CALL
          </h1>
          <p className="mt-2 font-mono text-[12px] text-muted">
            <span className="text-accent">{ticker}</span> delisted after {clock(elapsedMs)}
            {isNewBest && <span className="ml-2 text-up">· new best</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            autoFocus
            onClick={onPlayAgain}
            className="rounded-md bg-accent px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-bg transition-opacity hover:opacity-90"
          >
            PLAY AGAIN
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md border border-border-strong px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-fg transition-colors hover:bg-panel-hover"
          >
            BACK TO DASHBOARD <span className="text-muted">Esc</span>
          </button>
        </div>
      </header>

      <div className="px-4 pt-4">
        <PriceChart live={live} span="full" className="block h-[260px] w-full" />
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border p-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="label">{stat.label}</dt>
            <dd
              className={`mt-2 font-mono text-[20px] leading-none tabular-nums ${stat.isAccent ? "text-accent" : "text-fg"}`}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-border px-4 py-3 font-mono text-[11px] text-muted tabular-nums">
        Score = {seconds}s × {C.pointsPerSecond} + {money(ath)} ATH ={" "}
        <span className="text-fg">{score.toLocaleString("en-US")}</span>
      </p>
    </section>
  );
}
