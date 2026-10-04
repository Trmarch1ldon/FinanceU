import { cn } from "@/lib/utils";

type TerminalPanelProps = {
  number: number;
  title: string;
  /** Right side of the header: legends, badges. */
  aside?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

/** Every terminal panel: amber numbered header bar, hairline frame, black body. */
export function TerminalPanel({
  number,
  title,
  aside,
  className,
  bodyClassName,
  children,
}: TerminalPanelProps) {
  return (
    <section
      className={cn("flex min-h-0 flex-col border border-border bg-bg", className)}
      aria-label={title}
    >
      <header className="flex h-6 shrink-0 items-center justify-between gap-3 border-b border-border bg-panel px-2">
        <h2 className="truncate font-mono text-[10px] tracking-[0.12em] text-terminal-amber uppercase">
          {number}) {title}
        </h2>
        {aside && <div className="flex shrink-0 items-center gap-3">{aside}</div>}
      </header>
      <div className={cn("relative min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
