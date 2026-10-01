import { cn } from "@/lib/utils";
import type { Friend } from "@/types/dashboard";

import { CountedValue } from "./counted-value";

const GLYPH = { up: "▲", down: "▼", flat: "▬" } as const;

function movement(delta: number) {
  if (delta > 0) return { key: "up" as const, text: `${delta}`, className: "text-up" };
  if (delta < 0)
    return { key: "down" as const, text: `${Math.abs(delta)}`, className: "text-down" };
  return { key: "flat" as const, text: "", className: "text-muted" };
}

type StandingRowProps = { friend: Friend; position: number; isYou: boolean };

export function StandingRow({ friend, position, isYou }: StandingRowProps) {
  const move = movement(friend.rankDelta);

  return (
    <li
      className={cn(
        "grid grid-cols-[2ch_1fr_auto_4ch] items-center gap-3 rounded-sm px-2 py-1.5",
        isYou && "bg-accent-dim",
      )}
    >
      <span className="font-mono text-[11px] text-muted tabular-nums">{position}</span>
      <span className={cn("truncate text-[12px]", isYou ? "text-accent" : "text-fg")}>
        {friend.name}
        {isYou && <span className="ml-1.5 font-mono text-[10px] text-accent/70">YOU</span>}
      </span>
      <CountedValue
        value={friend.weeklyXp}
        // Standings resolve top-down, so the leader settles first.
        delayMs={(position - 1) * 100}
        className="font-mono text-[12px] text-fg"
      />
      <span className={cn("font-mono text-[11px] tabular-nums", move.className)}>
        <span aria-hidden>{GLYPH[move.key]}</span>
        <span className="sr-only">
          {move.key === "up" ? "up" : move.key === "down" ? "down" : "no change"}
        </span>
        {move.text}
      </span>
    </li>
  );
}
