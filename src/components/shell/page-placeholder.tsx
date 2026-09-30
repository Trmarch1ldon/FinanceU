type PagePlaceholderProps = {
  title: string;
  /** What this page will do — an empty screen should tell you what goes here. */
  description: string;
  task: string;
};

export function PagePlaceholder({ title, description, task }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6">
      <div className="panel px-6 py-16 text-center">
        <h1 className="font-mono text-[15px] tracking-wide text-fg">{title}</h1>
        <p className="mx-auto mt-2 max-w-[48ch] text-[13px] text-muted">{description}</p>
        <p className="mt-6 font-mono text-[11px] tracking-wide text-locked">Task {task}</p>
      </div>
    </div>
  );
}
