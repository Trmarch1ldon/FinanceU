import { cn } from "@/lib/utils";

type PanelProps = {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

/** Every dashboard panel: hairline border, uppercase label bar, no shadow. */
export function Panel({ label, children, action, className }: PanelProps) {
  return (
    <section className={cn("panel flex flex-col", className)} aria-label={label}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <h2 className="label">{label}</h2>
        {action}
      </header>
      <div className="min-h-0 flex-1 p-4">{children}</div>
    </section>
  );
}
