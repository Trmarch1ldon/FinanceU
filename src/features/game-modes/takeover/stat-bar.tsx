type StatBarProps = { label: string; value: number };

/** A 0–100 rating as a bar, for the opponent cards. */
export function StatBar({ label, value }: StatBarProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px]">
      <span className="w-14 shrink-0 text-muted">{label}</span>
      <span className="h-1.5 flex-1 bg-border">
        <span className="block h-full bg-rival" style={{ width: `${value}%` }} />
      </span>
      <span className="w-7 text-right text-fg tabular-nums">{value}</span>
    </div>
  );
}
