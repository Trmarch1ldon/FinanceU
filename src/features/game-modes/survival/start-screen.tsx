"use client";

import { SoundToggle } from "@/components/game/sound-toggle";

import { MARGIN_CALL as C } from "./config";
import { money } from "./format";

type StartScreenProps = {
  ticker: string;
  bestScore: number | null;
  onOpen: () => void;
};

export function StartScreen({ ticker, bestScore, onOpen }: StartScreenProps) {
  return (
    <section className="mx-auto max-w-xl border border-border bg-bg px-6 py-12 text-center">
      <p className="font-mono text-[10px] tracking-[0.16em] text-terminal-amber">
        SURVIVAL · {ticker}
      </p>
      <h1 className="mt-3 font-mono text-[32px] leading-none font-medium tracking-[0.08em] text-fg">
        MARGIN CALL
      </h1>
      <p className="mx-auto mt-4 max-w-[46ch] text-[13px] text-muted">
        You are <span className="font-mono text-accent">{ticker}</span>, listed at{" "}
        {money(C.startPrice)}. The price bleeds every second — answer right to spike it, answer
        wrong and it gaps down. Hit $0 and you&apos;re margin called.
      </p>

      <button
        type="button"
        // Enter on the focused button opens the market — no mouse needed.
        autoFocus
        onClick={onOpen}
        className="mt-8 bg-terminal-amber px-6 py-2.5 font-mono text-[13px] tracking-[0.12em] text-bg transition-opacity hover:opacity-90"
      >
        OPEN MARKET &lt;GO&gt;
      </button>

      <div className="mt-6 flex items-center justify-center gap-3 font-mono text-[11px] text-muted">
        <p>
          Type a number + <kbd>Enter</kbd> · or press <kbd>1</kbd>–<kbd>4</kbd> · <kbd>M</kbd> mutes
          · <kbd>F1</kbd> help
          {bestScore !== null && <> · Best {bestScore.toLocaleString("en-US")}</>}
        </p>
        <SoundToggle />
      </div>
    </section>
  );
}
