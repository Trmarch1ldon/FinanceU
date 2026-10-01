import type { Friend } from "@/types/dashboard";

import { StandingRow } from "./standing-row";

type FriendsLeaderboardProps = {
  friends: Friend[];
  /** Highlighted as "you" in the standings. */
  currentHandle: string;
};

const SHOWN = 5;

/** Top five, plus your own row pinned underneath when you're outside them — a friends
 *  board that can leave you off entirely doesn't answer the only question it's for. */
export function FriendsLeaderboard({ friends, currentHandle }: FriendsLeaderboardProps) {
  const standings = [...friends].sort((a, b) => b.weeklyXp - a.weeklyXp);
  const yourIndex = standings.findIndex((friend) => friend.handle === currentHandle);
  const isYouPinned = yourIndex >= SHOWN;

  const you = standings[yourIndex];
  const ahead = yourIndex > 0 ? standings[yourIndex - 1] : undefined;

  return (
    <div className="flex h-full flex-col gap-3">
      <ol className="space-y-px">
        {standings.slice(0, SHOWN).map((friend, index) => (
          <StandingRow
            key={friend.id}
            friend={friend}
            position={index + 1}
            isYou={index === yourIndex}
          />
        ))}
      </ol>

      {isYouPinned && you && (
        <ol start={yourIndex + 1} className="border-t border-dashed border-border pt-2">
          <StandingRow friend={you} position={yourIndex + 1} isYou />
        </ol>
      )}

      {you && (
        <p className="mt-auto border-t border-border pt-3 font-mono text-[11px] text-muted tabular-nums">
          {ahead ? (
            <>
              <span className="text-fg">{(ahead.weeklyXp - you.weeklyXp).toLocaleString()} XP</span>{" "}
              behind {ahead.name} for #{yourIndex}
            </>
          ) : (
            <>Leading by {(you.weeklyXp - (standings[1]?.weeklyXp ?? 0)).toLocaleString()} XP</>
          )}
        </p>
      )}
    </div>
  );
}
