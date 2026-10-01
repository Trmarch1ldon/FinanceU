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

function longestRun(days: ActivityDay[]) {
  let best = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** A grid at a readable cell size is ~200px wide, so the panel's spare width carries
 *  the numbers the grid implies but can't state. */
export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const total = days.reduce((sum, day) => sum + day.count, 0);
  const active = days.filter((day) => day.count > 0).length;
  const bestDay = days.reduce((best, day) => (day.count > best.count ? day : best), days[0]);

  const readouts = [
    { label: "Questions", value: total.toLocaleString(), note: `over ${weeks.length} weeks` },
    { label: "Active days", value: `${active}`, note: `of ${days.length}` },
    { label: "Per active day", value: active ? (total / active).toFixed(1) : "0", note: "avg" },
    { label: "Longest run", value: `${longestRun(days)}d`, note: `in ${weeks.length} weeks` },
    {
      label: "Best day",
      value: `${bestDay?.count ?? 0}`,
      note: bestDay
        ? new Date(`${bestDay.date}T00:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "",
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
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
                    className="cell-in size-[13px] rounded-[2px]"
                    style={{
                      backgroundColor: LEVEL_FILL[day.level],
                      // By column, not by cell — 12 steps reads as a feed loading,
                      // 84 would read as confetti.
                      animationDelay: `${weekIndex * 34}ms`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted">
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

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-border sm:grid-cols-3 lg:border-l lg:pl-6 xl:grid-cols-5">
        {readouts.map((readout) => (
          <div key={readout.label} className="min-w-0">
            <dt className="label">{readout.label}</dt>
            <dd className="mt-2 font-mono text-[20px] leading-none font-medium tracking-tight text-fg tabular-nums">
              {readout.value}
            </dd>
            <dd className="mt-1.5 font-mono text-[11px] text-muted tabular-nums">{readout.note}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
