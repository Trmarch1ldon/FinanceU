type FunctionKeyBarProps = { keys: { key: string; label: string }[] };

/** The bottom key strip. Hidden on touch layouts, which have no F-keys. */
export function FunctionKeyBar({ keys }: FunctionKeyBarProps) {
  return (
    <footer className="hidden flex-wrap items-center gap-x-5 gap-y-1 border border-border bg-panel px-3 py-1 font-mono text-[11px] md:flex">
      {keys.map(({ key, label }) => (
        <span key={key} className="flex items-center gap-1.5">
          <kbd className="bg-terminal-amber px-1 text-[10px] font-medium text-bg">{key}</kbd>
          <span className="text-muted">{label}</span>
        </span>
      ))}
    </footer>
  );
}
