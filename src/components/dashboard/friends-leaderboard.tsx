import { cn } from "@/lib/utils";
import type { Friend } from "@/types/dashboard";

type FriendsLeaderboardProps = {
  friends: Friend[];
  /** Highlighted as "you" in the standings. */
  currentHandle: string;
};

const GLYPH = { up: "▲", down: "▼", flat: "▬" } as const;

function movement(delta: number) {
  if (delta > 0) return { key: "up" as const, text: `${delta}`, className: "text-up" };
  if (delta < 0)
    return { key: "down" as const, text: `${Math.abs(delta)}`, className: "text-down" };
  return { key: "flat" as const, text: "", className: "text-muted" };
}

export function FriendsLeaderboard({ friends, currentHandle }: FriendsLeaderboardProps) {
  const standings = [...friends].sort((a, b) => b.weeklyXp - a.weeklyXp).slice(0, 5);

  return (
    <ol className="space-y-px">
      {standings.map((friend, index) => {
        const move = movement(friend.rankDelta);
        const isYou = friend.handle === currentHandle;

        return (
          <li
            key={friend.id}
            className={cn(
              "grid grid-cols-[2ch_1fr_auto_4ch] items-center gap-3 rounded-sm px-2 py-1.5",
              isYou && "bg-accent-dim",
            )}
          >
            <span className="font-mono text-[11px] text-muted tabular-nums">{index + 1}</span>
            <span className={cn("truncate text-[12px]", isYou ? "text-accent" : "text-fg")}>
              {friend.name}
              {isYou && <span className="ml-1.5 font-mono text-[10px] text-accent/70">YOU</span>}
            </span>
            <span className="font-mono text-[12px] text-fg tabular-nums">
              {friend.weeklyXp.toLocaleString()}
            </span>
            <span className={cn("font-mono text-[11px] tabular-nums", move.className)}>
              <span aria-hidden>{GLYPH[move.key]}</span>
              <span className="sr-only">
                {move.key === "up" ? "up" : move.key === "down" ? "down" : "no change"}
              </span>
              {move.text}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
