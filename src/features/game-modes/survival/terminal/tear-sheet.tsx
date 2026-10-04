"use client";

import type { LiveState } from "@/features/game-modes/types";
import { cn } from "@/lib/utils";

import { MARGIN_CALL as C } from "../config";
import { clock, money } from "../format";
import { drainPerSec, readMarket } from "../market";
import { CandleChart } from "./candle-chart";
import { currentMomentum, ratingFor, unpackMarks } from "./candles";
import { TerminalPanel } from "./terminal-panel";

type TearSheetProps = {
  ticker: string;
  live: LiveState;
  score: number;
  elapsedMs: number;
  answered: number;
  correct: number;
  bestStreak: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
};

/** Biggest single-answer moves and bull runs, read back off the chart's own history. */
function runStats(history: number[], marks: number[]) {
  let bestGain = 0;
  let worstGap = 0;
  let bullRuns = 0;
  let streak = 0;
  for (const mark of unpackMarks(marks)) {
    streak = mark.isCorrect ? streak + 1 : 0;
    if (streak === C.bullRunStreak) bullRuns += 1;
    if (mark.sample < 1 || mark.sample >= history.length) continue;
    const move = history[mark.sample] - history[mark.sample - 1];
    bestGain = Math.max(bestGain, move);
    worstGap = Math.min(worstGap, move);
  }
  return { bestGain, worstGap, bullRuns };
}

export function TearSheet({
  ticker,
  live,
  score,
  elapsedMs,
  answered,
  correct,
  bestStreak,
  isNewBest,
  onPlayAgain,
  onExit,
}: TearSheetProps) {
  const { history, marks, ath } = readMarket(live.get().modeState);
  const { bestGain, worstGap, bullRuns } = runStats(history, marks);
  const rating = ratingFor(currentMomentum(history, marks));
  const seconds = Math.floor(elapsedMs / 1000);
  const accuracy = answered ? (correct / answered) * 100 : 0;

  const rows: [string, string, string?][] = [
    ["LISTED", money(C.startPrice)],
    ["CLOSE", money(0), "down"],
    ["ALL-TIME HIGH", money(ath), "up"],
    ["SURVIVED", clock(elapsedMs)],
    ["PEAK DRAIN", `−${drainPerSec(elapsedMs).toFixed(2)}/s`, "down"],
    ["QUESTIONS", `${answered}`],
    ["CORRECT", `${correct}`],
    ["ACCURACY", `${accuracy.toFixed(1)}%`],
    ["BEST STREAK", `${bestStreak}`],
    ["BULL RUNS", `${bullRuns}`],
    ["BEST FILL", bestGain > 0 ? `+${bestGain.toFixed(2)}` : "—", "up"],
    ["WORST GAP", worstGap < 0 ? `−${Math.abs(worstGap).toFixed(2)}` : "—", "down"],
  ];

  return (
    <div className="space-y-1">
      <header className="flex flex-wrap items-end justify-between gap-3 border border-border bg-panel px-3 py-2.5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-terminal-amber">
            DELISTING NOTICE
          </p>
          <h1 className="mt-1 font-mono text-[24px] leading-none font-medium tracking-[0.08em] text-down">
            <span aria-hidden>▼ </span>
            {ticker} · MARGIN CALL
          </h1>
          <p className="mt-1.5 font-mono text-[11px] text-muted">
            Trading halted after {clock(elapsedMs)}
            {isNewBest && <span className="ml-2 text-up">· NEW BEST</span>}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            autoFocus
            onClick={onPlayAgain}
            className="bg-terminal-amber px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-bg transition-opacity hover:opacity-90"
          >
            PLAY AGAIN &lt;GO&gt;
          </button>
          <button
            type="button"
            onClick={onExit}
            className="border border-border-strong px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-fg transition-colors hover:bg-panel-hover"
          >
            DASHBOARD <span className="text-muted">ESC</span>
          </button>
        </div>
      </header>

      <div className="grid gap-1 lg:grid-cols-[1fr_320px]">
        <TerminalPanel number={1} title="Full session · 2s candles" bodyClassName="p-2">
          <CandleChart live={live} span="full" className="block h-[320px] w-full" />
        </TerminalPanel>

        <TerminalPanel number={2} title="Statistics">
          <table className="w-full font-mono text-[12px] tabular-nums">
            <tbody>
              <tr className="border-b border-border bg-panel">
                <th className="px-2 py-1.5 text-left font-normal text-terminal-amber">SCORE</th>
                <td className="px-2 py-1.5 text-right text-[16px] text-terminal-amber">
                  {score.toLocaleString("en-US")}
                </td>
              </tr>
              {rows.map(([label, value, tone]) => (
                <tr key={label} className="border-b border-border/60">
                  <th className="px-2 py-1 text-left font-normal text-muted">{label}</th>
                  <td
                    className={cn(
                      "px-2 py-1 text-right",
                      tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-fg",
                    )}
                  >
                    {value}
                  </td>
                </tr>
              ))}
              <tr>
                <th className="px-2 py-1.5 text-left font-normal text-muted">RATING AT CLOSE</th>
                <td
                  className={cn(
                    "px-2 py-1.5 text-right",
                    rating.tone === "up"
                      ? "text-up"
                      : rating.tone === "down"
                        ? "text-down"
                        : "text-fg",
                  )}
                >
                  {rating.label}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="border-t border-border px-2 py-1.5 font-mono text-[10px] text-muted tabular-nums">
            SCORE = {seconds}s × {C.pointsPerSecond} + {money(ath)} ATH ={" "}
            <span className="text-fg">{score.toLocaleString("en-US")}</span>
          </p>
        </TerminalPanel>
      </div>
    </div>
  );
}
