"use client";

import { useState } from "react";

import { parseNumericInput } from "@/lib/engine/check-answer";
import { cn } from "@/lib/utils";

type NumericAnswerProps = {
  ticker: string;
  unit?: string;
  onSubmit: (value: number, raw: string) => void;
};

/**
 * The typed answer, as a terminal command line: amber prompt, blinking block cursor, <GO>.
 * The real input sits over an invisible copy of its own text, and the block cursor trails that
 * copy — so the cursor always sits right after what you've typed. Mounted fresh per question.
 */
export function NumericAnswer({ ticker, unit, onSubmit }: NumericAnswerProps) {
  const [raw, setRaw] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <form
      className="flex flex-wrap items-center gap-x-3 gap-y-1"
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
      <label className="group flex items-center font-mono text-[18px] tabular-nums">
        <span className="text-terminal-amber">{ticker}&gt;</span>
        <span className="relative ml-2 inline-flex min-w-[14ch] items-center">
          <span aria-hidden className="invisible whitespace-pre">
            {raw}
          </span>
          <span
            aria-hidden
            className="cursor-blink inline-block h-[1.05em] w-[0.6em] bg-terminal-amber opacity-0 group-focus-within:opacity-100"
          />
          <input
            // A fresh input per question, so focus lands here every time without a click.
            autoFocus
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            aria-label="Your answer"
            aria-invalid={isInvalid}
            value={raw}
            onChange={(event) => {
              setRaw(event.target.value);
              setIsInvalid(false);
            }}
            // The blinking block is the focus indicator here; the global ring would box it.
            style={{ outline: "none" }}
            className="absolute inset-0 w-full bg-transparent p-0 text-fg caret-transparent"
          />
        </span>
      </label>
      {unit && <span className="font-mono text-[12px] text-muted">{unit}</span>}
      <span className={cn("font-mono text-[11px]", isInvalid ? "text-down" : "text-muted")}>
        {isInvalid ? "NOT A NUMBER — RETYPE" : "ENTER"}{" "}
        <span className="text-terminal-amber">&lt;GO&gt;</span>
      </span>
    </form>
  );
}
