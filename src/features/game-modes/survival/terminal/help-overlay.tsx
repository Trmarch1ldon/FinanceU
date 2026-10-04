"use client";

import { MARGIN_CALL as C } from "../config";
import { money } from "../format";

type HelpOverlayProps = { onClose: () => void };

/** F1. The clock keeps running behind it — help is not a pause button. */
export function HelpOverlay({ onClose }: HelpOverlayProps) {
  const rows = [
    ["1–4", "Answer a multiple-choice question"],
    ["Type + ENTER", "Answer quick math (small rounding is fine)"],
    ["M", "Mute / unmute"],
    ["F1", "Close this help"],
    ["ESC", "Quit to the dashboard (run not saved)"],
  ];
  const rules = [
    `You list at ${money(C.startPrice)}. The price drains every second, faster as you survive.`,
    `Correct: +$${C.baseSpike} to +$${C.fastSpike} — faster answers spike harder.`,
    `Wrong: an instant −$${C.wrongGap} gap down.`,
    `${C.bullRunStreak} in a row starts a bull run: spikes ×${C.bullRunMultiplier} until your next miss.`,
    `$0 is a margin call. Score = seconds × ${C.pointsPerSecond} + all-time high.`,
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Help"
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-terminal-amber bg-bg font-mono text-[12px]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border bg-panel px-3 py-1.5">
          <h2 className="tracking-[0.12em] text-terminal-amber">HELP · MARGIN CALL</h2>
          <button type="button" onClick={onClose} autoFocus className="text-muted hover:text-fg">
            F1 / ESC CLOSE
          </button>
        </header>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 px-3 py-3">
          {rows.map(([key, text]) => (
            <div key={key} className="contents">
              <dt className="text-terminal-amber">{key}</dt>
              <dd className="text-fg">{text}</dd>
            </div>
          ))}
        </dl>
        <ul className="space-y-1 border-t border-border px-3 py-3 font-sans text-[13px] text-muted">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
