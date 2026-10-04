"use client";

import type { MatchView } from "@/lib/engine/versus/player";
import { useMatchValue } from "@/lib/engine/versus/use-match-value";
import { cn } from "@/lib/utils";

import { ATTACKS, TAKEOVER as C, type PowerUpKind } from "./config";
import type { MatchState, Seat } from "./match/types";

type PowerCardProps = {
  view: MatchView<MatchState>;
  seat: Seat;
  power: PowerUpKind;
  onUse: (power: PowerUpKind) => void;
};

const BLURB: Record<PowerUpKind, string> = {
  insider: "Strike 2 wrong options, or see the first digit",
  hedge: "Your next miss costs nothing",
  squeeze: `Their next ${C.powerUps.squeeze.questions} questions are harder`,
  halt: `Freeze their input ${C.powerUps.halt.durationMs / 1000}s`,
  pill: `Bounce the next attack back · ${C.powerUps.pill.durationMs / 1000}s`,
};

/** One power-up. Re-renders only when it becomes (un)affordable or its cooldown starts/ends. */
export function PowerCard({ view, seat, power, onUse }: PowerCardProps) {
  const spec = C.powerUps[power];
  const canAfford = useMatchValue(view, (s) => s.seats[seat].cash >= spec.cost);
  const readyAt = useMatchValue(view, (s) => s.seats[seat].readyAt[power]);
  const isCooling = useMatchValue(view, (s) => s.elapsed < s.seats[seat].readyAt[power]);
  const isHalted = useMatchValue(view, (s) => s.elapsed < s.seats[seat].haltedUntil);
  const isLive = useMatchValue(view, (s) => s.status === "live");

  const isUsable = canAfford && !isCooling && !isHalted && isLive;
  const isAttack = ATTACKS.includes(power);
  // A card that mounts mid-cooldown starts its sweep part-way through.
  const elapsed = view.get().elapsed;
  const sweepDelay = -(C.cooldownMs - Math.max(0, readyAt - elapsed));

  return (
    <button
      type="button"
      onClick={() => onUse(power)}
      disabled={!isUsable}
      aria-keyshortcuts={spec.key.toUpperCase()}
      title={`${spec.name} — ${BLURB[power]}`}
      className={cn(
        "relative flex min-w-0 flex-col gap-1 overflow-hidden border px-2 py-1.5 text-left font-mono transition-colors",
        isUsable
          ? "border-border-strong bg-panel hover:border-terminal-amber"
          : "cursor-not-allowed border-border bg-bg opacity-45",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <kbd className="bg-terminal-amber px-1 text-[10px] font-medium text-bg">
          {spec.key.toUpperCase()}
        </kbd>
        <span className={cn("text-[11px] tabular-nums", canAfford ? "text-fg" : "text-down")}>
          ${spec.cost}
        </span>
      </span>
      <span
        className={cn("truncate text-[11px] tracking-wide", isAttack ? "text-down" : "text-up")}
      >
        {spec.name.toUpperCase()}
      </span>
      <span className="hidden truncate font-sans text-[11px] text-muted lg:block">
        {BLURB[power]}
      </span>

      {isCooling && (
        <span
          key={readyAt}
          aria-hidden
          className="cooldown-sweep absolute inset-x-0 bottom-0 h-0.5 bg-terminal-amber"
          style={{ animationDuration: `${C.cooldownMs}ms`, animationDelay: `${sweepDelay}ms` }}
        />
      )}
    </button>
  );
}
