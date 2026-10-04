"use client";

import { TerminalPanel } from "@/components/game/terminal-panel";
import type { MatchView } from "@/lib/engine/versus/player";
import { useMatchValue } from "@/lib/engine/versus/use-match-value";
import { cn } from "@/lib/utils";

import { TAKEOVER as C } from "./config";
import type { MatchState, Seat } from "./match/types";

type SeatPanelProps = {
  view: MatchView<MatchState>;
  seat: Seat;
  number: number;
  name: string;
  side: "you" | "rival";
  /** Bots and remote players report typing; the local player doesn't need to see their own. */
  showTyping?: boolean;
};

/** Active effects as chip labels, joined into one string so the panel re-renders only when a
 *  chip actually changes (a countdown's whole second, an effect starting or ending). */
function effectsOf(state: MatchState, seat: Seat) {
  const me = state.seats[seat];
  const t = state.elapsed;
  const secs = (until: number) => Math.ceil((until - t) / 1000);
  const chips: string[] = [];
  if (t < me.haltedUntil) chips.push(`down:HALTED ${secs(me.haltedUntil)}s`);
  if (me.squeezedFor > 0) chips.push(`down:SQUEEZED ×${me.squeezedFor}`);
  if (t < me.pillUntil) chips.push(`up:POISON PILL ${secs(me.pillUntil)}s`);
  if (me.isHedged) chips.push("up:HEDGED");
  if (me.hasTip) chips.push("up:INSIDER TIP");
  return chips.join("|");
}

export function SeatPanel({ view, seat, number, name, side, showTyping = false }: SeatPanelProps) {
  const cash = useMatchValue(view, (s) => s.seats[seat].cash);
  const streak = useMatchValue(view, (s) => s.seats[seat].streak);
  const record = useMatchValue(view, (s) => `${s.seats[seat].correct}/${s.seats[seat].answered}`);
  const effects = useMatchValue(view, (s) => effectsOf(s, seat));
  const isTyping = useMatchValue(view, (s) => s.status === "live" && s.seats[seat].isTyping);
  const chips = effects ? effects.split("|") : [];

  return (
    <TerminalPanel
      number={number}
      title={name}
      className={cn("border-t-2", side === "you" ? "border-t-terminal-amber" : "border-t-rival")}
      bodyClassName="space-y-3 p-3"
    >
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 font-mono tabular-nums">
        <div className="col-span-2">
          <dt className="text-[10px] tracking-wide text-muted">CASH</dt>
          <dd className="text-[22px] leading-none text-fg">${cash.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-wide text-muted">STREAK</dt>
          <dd className={cn("text-[16px]", streak >= 3 ? "text-up" : "text-fg")}>{streak}</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-wide text-muted">RIGHT</dt>
          <dd className="text-[16px] text-fg">{record}</dd>
        </div>
      </dl>

      <ul className="flex min-h-6 flex-wrap gap-1" aria-label="Active effects">
        {chips.length === 0 && (
          <li className="font-mono text-[10px] text-muted">NO ACTIVE EFFECTS</li>
        )}
        {chips.map((chip) => {
          const [tone, label] = chip.split(":");
          return (
            <li
              key={label.replace(/\d+s$/, "")}
              className={cn(
                "border px-1.5 py-px font-mono text-[10px] tracking-wide",
                tone === "up" ? "border-up text-up" : "border-down text-down",
              )}
            >
              {label}
            </li>
          );
        })}
      </ul>

      {showTyping && (
        <p className="h-4 font-mono text-[11px] text-rival" aria-live="polite">
          {isTyping && (
            <>
              {name.toLowerCase()} is typing
              <span className="typing-dot">.</span>
              <span className="typing-dot [animation-delay:150ms]">.</span>
              <span className="typing-dot [animation-delay:300ms]">.</span>
            </>
          )}
        </p>
      )}
      <p className="font-mono text-[10px] text-muted">
        CORRECT +{C.correctControl}–{C.fastControl}% · WRONG −{C.wrongControl}%
      </p>
    </TerminalPanel>
  );
}
