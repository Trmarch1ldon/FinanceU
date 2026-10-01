import { rankProgress } from "@/data/ranks";

type RankBadgeProps = { xp: number };

/** The career ladder, shown as position + distance to the next rung. Expanded it's a
 *  full panel; collapsed it shrinks to the rank's initial over a progress ring.
 *
 *  The two forms are stacked and trade height through grid rows (0fr ⇄ 1fr) rather than
 *  swapping with display:none. CSS can transition grid tracks but not height:auto, and
 *  this keeps the nav below gliding up instead of jumping 70px on the first frame. */
export function RankBadge({ xp }: RankBadgeProps) {
  const { rank, next, nextThreshold, percent } = rankProgress(xp);

  return (
    <div
      className="mt-3 grid grid-rows-[1fr_0fr] transition-[grid-template-rows,margin] duration-[250ms] ease-out collapsed:mt-2 collapsed:grid-rows-[0fr_1fr]"
      aria-label={
        next
          ? `Rank ${rank.name}. ${xp.toLocaleString()} of ${nextThreshold?.toLocaleString()} XP to ${next.name}.`
          : `Rank ${rank.name}, top of the ladder.`
      }
    >
      {/* Expanded. Fixed width so the text never rewraps as the rail narrows — the rail
          clips it while it fades instead. */}
      <div className="min-h-0 overflow-hidden transition-opacity duration-150 collapsed:opacity-0">
        <div className="panel w-[256px] px-3 py-3">
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
            <div
              className="bar-grow h-full rounded-full bg-accent"
              style={{ width: `${percent}%`, animationDelay: "200ms" }}
            />
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
      </div>

      {/* Collapsed: initial in a ring filled to the same percent. Its left edge matches
          the avatar's, so the two stack on the rail's centre line. */}
      <div className="min-h-0 overflow-hidden opacity-0 transition-opacity duration-150 collapsed:opacity-100 collapsed:delay-100">
        <div className="px-1.5" title={`${rank.name} · ${percent}%`}>
          <span
            className="rank-ring grid size-9 place-items-center rounded-full font-mono text-[12px] text-accent"
            style={{ ["--rank-pct" as string]: percent }}
          >
            <span className="grid size-7 place-items-center rounded-full bg-panel">
              {rank.name.charAt(0)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
