import type { ActivityDay } from "@/types/dashboard";

type ActivityHeatmapProps = { days: ActivityDay[] };

/** Sequential, one hue light-to-dark against the dark surface. Level 0 is the border
 *  grey, not a faint orange — "nothing happened" should not look like a small amount. */
const LEVEL_FILL = [
  "var(--border)",
  "rgba(255, 159, 28, 0.22)",
  "rgba(255, 159, 28, 0.45)",
  "rgba(255, 159, 28, 0.7)",
  "var(--accent)",
] as const;

const WEEKDAYS = ["Mon", "Wed", "Fri"];

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const total = days.reduce((sum, day) => sum + day.count, 0);
  const active = days.filter((day) => day.level > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <ul className="flex shrink-0 flex-col justify-between py-px font-mono text-[9px] text-muted">
          {WEEKDAYS.map((day) => (
            <li key={day}>{day}</li>
          ))}
        </ul>

        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${day.date}: ${day.count} question${day.count === 1 ? "" : "s"}`}
                  className="cell-in size-[11px] rounded-[2px]"
                  style={{
                    backgroundColor: LEVEL_FILL[day.level],
                    // By column, not by cell — 12 steps reads as a feed loading,
                    // 84 would read as confetti.
                    animationDelay: `${weekIndex * 22}ms`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] text-muted tabular-nums">
          {total.toLocaleString()} questions · {active} active days
        </p>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
          <span>Less</span>
          {LEVEL_FILL.map((fill, index) => (
            <span
              key={index}
              className="size-[11px] rounded-[2px]"
              style={{ backgroundColor: fill }}
              aria-hidden
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
