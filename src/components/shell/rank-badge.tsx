import { rankProgress } from "@/data/ranks";
import { cn } from "@/lib/utils";

type RankBadgeProps = { xp: number };

/** The career ladder, shown as position + distance to the next rung. Expanded it's a
 *  full panel; collapsed it shrinks to the rank's initial over a progress ring. */
export function RankBadge({ xp }: RankBadgeProps) {
  const { rank, next, nextThreshold, percent } = rankProgress(xp);

  return (
    <div
      className={cn("panel px-3 py-3 collapsed:border-0 collapsed:bg-transparent collapsed:p-0")}
      aria-label={
        next
          ? `Rank ${rank.name}. ${xp.toLocaleString()} of ${nextThreshold?.toLocaleString()} XP to ${next.name}.`
          : `Rank ${rank.name}, top of the ladder.`
      }
    >
      {/* Expanded */}
      <div className="collapsed:hidden">
        <p className="label">Rank</p>
        <p className="mt-1.5 font-mono text-[17px] leading-none font-medium tracking-tight text-accent">
          {rank.name}
        </p>

        <div
          className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={next ? `Progress to ${next.name}` : "Ladder complete"}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>

        <p className="mt-2 font-mono text-[11px] text-muted tabular-nums">
          {next ? (
            <>
              {xp.toLocaleString()} / {nextThreshold?.toLocaleString()} XP
              <span className="text-muted/70"> → {next.name}</span>
            </>
          ) : (
            <>{xp.toLocaleString()} XP · top of the ladder</>
          )}
        </p>
      </div>

      {/* Collapsed: initial in a ring filled to the same percent. */}
      <div className="hidden justify-center collapsed:flex" title={`${rank.name} · ${percent}%`}>
        <span
          className="grid size-9 place-items-center rounded-full font-mono text-[12px] text-accent"
          style={{
            background: `conic-gradient(var(--accent) ${percent * 3.6}deg, var(--border) 0deg)`,
          }}
        >
          <span className="grid size-7 place-items-center rounded-full bg-panel">
            {rank.name.charAt(0)}
          </span>
        </span>
      </div>
    </div>
  );
}
