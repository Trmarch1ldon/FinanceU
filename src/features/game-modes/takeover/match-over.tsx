"use client";

import { TerminalPanel } from "@/components/game/terminal-panel";
import type { MatchView } from "@/lib/engine/versus/player";
import { cn } from "@/lib/utils";

import type { BotProfile } from "./bots";
import { ControlChart } from "./control-chart";
import type { MatchState, Seat } from "./match/types";

type MatchOverProps = {
  state: MatchState;
  ticker: string;
  bot: BotProfile;
  hasNextOpponent: boolean;
  onRematch: () => void;
  onNext: () => void;
  onExit: () => void;
};

/** A finished match never changes, so the chart gets a view that never notifies. */
const frozenView = (state: MatchState): MatchView<MatchState> => ({
  get: () => state,
  subscribe: () => () => {},
});

const REASON = {
  takeover: "100% control",
  bell: "majority at the closing bell",
  "sudden-death": "first correct answer in sudden death",
} as const;

export function MatchOver({
  state,
  ticker,
  bot,
  hasNextOpponent,
  onRematch,
  onNext,
  onExit,
}: MatchOverProps) {
  const didWin = state.winner === "p1";
  const names: Record<Seat, string> = { p1: ticker, p2: bot.ticker };

  const stat = (seat: Seat) => {
    const s = state.seats[seat];
    return [
      ["FINAL CONTROL", `${(seat === "p1" ? state.control : 100 - state.control).toFixed(1)}%`],
      ["ANSWERS", `${s.correct}/${s.answered}`],
      ["ACCURACY", s.answered ? `${((s.correct / s.answered) * 100).toFixed(1)}%` : "—"],
      ["CASH EARNED", `$${s.cashEarned.toLocaleString("en-US")}`],
      ["POWER-UPS USED", `${s.powerUpsUsed}`],
      ["BIGGEST SWING", `+${s.biggestSwing.toFixed(1)}%`],
      ["BEST STREAK", `${s.bestStreak}`],
    ];
  };
  const rows = stat("p1").map(([label, you], i) => [label, you, stat("p2")[i][1]]);

  return (
    <div className="space-y-1">
      <header className="flex flex-wrap items-end justify-between gap-3 border border-border bg-panel px-3 py-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-terminal-amber">
            HOSTILE TAKEOVER · {names.p1} vs {names.p2}
          </p>
          <h1
            className={cn(
              "mt-1 font-mono text-[26px] leading-none font-medium tracking-[0.08em]",
              didWin ? "text-up" : "text-down",
            )}
          >
            {didWin ? "TAKEOVER COMPLETE" : "YOU'VE BEEN ACQUIRED"}
          </h1>
          <p className="mt-1.5 font-mono text-[11px] text-muted">
            {names[state.winner ?? "p2"]} wins on {state.reason ? REASON[state.reason] : "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            autoFocus
            onClick={onRematch}
            className="bg-terminal-amber px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-bg hover:opacity-90"
          >
            REMATCH &lt;GO&gt;
          </button>
          {hasNextOpponent && (
            <button
              type="button"
              onClick={onNext}
              className="border border-rival px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-rival hover:bg-rival-dim"
            >
              NEXT OPPONENT
            </button>
          )}
          <button
            type="button"
            onClick={onExit}
            className="border border-border-strong px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-fg hover:bg-panel-hover"
          >
            DASHBOARD <span className="text-muted">ESC</span>
          </button>
        </div>
      </header>

      <div className="grid gap-1 lg:grid-cols-[1fr_380px]">
        <TerminalPanel number={1} title="Control · full match" bodyClassName="p-2">
          <ControlChart view={frozenView(state)} className="block h-[300px] w-full" />
        </TerminalPanel>
        <TerminalPanel number={2} title="Tale of the tape">
          <table className="w-full font-mono text-[12px] tabular-nums">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-1.5 text-left font-normal text-muted" />
                <th className="px-2 py-1.5 text-right font-normal text-terminal-amber">
                  {names.p1}
                </th>
                <th className="px-2 py-1.5 text-right font-normal text-rival">{names.p2}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, you, them]) => (
                <tr key={label} className="border-b border-border/60">
                  <th className="px-2 py-1 text-left font-normal text-muted">{label}</th>
                  <td className="px-2 py-1 text-right text-fg">{you}</td>
                  <td className="px-2 py-1 text-right text-fg">{them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TerminalPanel>
      </div>
    </div>
  );
}
