"use client";

import { useState } from "react";

import { parseNumericInput } from "@/lib/engine/check-answer";
import { cn } from "@/lib/utils";

type NumericAnswerProps = {
  unit?: string;
  onSubmit: (value: number, raw: string) => void;
};

/** The typed-answer field. Mounted fresh per question, so it always starts empty and focused. */
export function NumericAnswer({ unit, onSubmit }: NumericAnswerProps) {
  const [raw, setRaw] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const value = parseNumericInput(raw);
        // Not a number: don't burn the question on a typo, just say so.
        if (value === null) {
          setIsInvalid(true);
          return;
        }
        onSubmit(value, raw.trim());
      }}
    >
      <input
        // A fresh input per question, so focus lands on it every time without a click.
        autoFocus
        inputMode="decimal"
        autoComplete="off"
        aria-label="Your answer"
        aria-invalid={isInvalid}
        value={raw}
        onChange={(event) => {
          setRaw(event.target.value);
          setIsInvalid(false);
        }}
        className={cn(
          "w-48 rounded-md border bg-bg px-3 py-2 font-mono text-[18px] text-fg tabular-nums outline-none",
          "focus-visible:border-accent focus-visible:outline-none",
          isInvalid ? "border-down" : "border-border-strong",
        )}
      />
      {unit && <span className="font-mono text-[12px] text-muted">{unit}</span>}
      <span className="font-mono text-[11px] text-muted">
        <kbd className="rounded-sm border border-border-strong px-1.5 py-0.5">Enter</kbd> to submit
      </span>
    </form>
  );
}
