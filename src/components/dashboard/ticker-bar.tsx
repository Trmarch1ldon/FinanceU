import { cn } from "@/lib/utils";
import type { TickerItem } from "@/types/dashboard";

type TickerBarProps = { items: TickerItem[] };

const GLYPH: Record<TickerItem["trend"], string> = { up: "▲", down: "▼", flat: "▬" };

/** Friend activity as tape. Colour carries the move, but the ▲▼ glyph carries it too,
 *  so the row survives greyscale and colour-blind readers. */
export function TickerBar({ items }: TickerBarProps) {
  const run = [...items, ...items];

  return (
    <div
      className="ticker-viewport panel overflow-hidden"
      aria-label="Friend activity"
      role="marquee"
    >
      <div className="ticker-track flex w-max items-center">
        {run.map((item, index) => (
          <span
            key={`${item.id}-${index}`}
            aria-hidden={index >= items.length}
            className="flex shrink-0 items-center gap-2 border-r border-border px-4 py-2 font-mono text-[11px] tracking-wide whitespace-nowrap"
          >
            <span className="text-fg">{item.symbol}</span>
            <span
              className={cn(
                "tabular-nums",
                item.trend === "up" && "text-up",
                item.trend === "down" && "text-down",
                item.trend === "flat" && "text-muted",
              )}
            >
              {GLYPH[item.trend]} {item.event}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
