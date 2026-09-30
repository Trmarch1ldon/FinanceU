import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  /** Secondary line: context, not decoration. */
  note?: string;
  trend?: "up" | "down" | "flat";
  chart?: React.ReactNode;
};

const GLYPH = { up: "▲", down: "▼", flat: "▬" } as const;

export function StatCard({ label, value, note, trend, chart }: StatCardProps) {
  return (
    <div className="panel flex min-w-0 flex-col gap-2 px-4 py-3">
      <p className="label">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <p className="font-mono text-[26px] leading-none font-medium tracking-tight text-fg tabular-nums">
          {value}
        </p>
        {chart}
      </div>
      {note && (
        <p
          className={cn(
            "font-mono text-[11px] tabular-nums",
            trend === "up" && "text-up",
            trend === "down" && "text-down",
            (!trend || trend === "flat") && "text-muted",
          )}
        >
          {trend && trend !== "flat" && <span aria-hidden>{GLYPH[trend]} </span>}
          {note}
        </p>
      )}
    </div>
  );
}
