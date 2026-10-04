"use client";

import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

import { BOTS, type BotProfile } from "./bots";
import { StatBar } from "./stat-bar";

type OpponentSelectProps = {
  unlocked: number;
  onPick: (bot: BotProfile) => void;
};

/** The ladder: one card per bot, locked until you beat the one before. */
export function OpponentSelect({ unlocked, onPick }: OpponentSelectProps) {
  // The newest unlocked rung takes focus, so Enter starts the obvious match. An effect, not
  // autoFocus: the unlock count arrives from storage after the first render.
  const newestRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    newestRef.current?.focus();
  }, [unlocked]);

  return (
    <section className="space-y-3">
      <header className="border border-border bg-panel px-4 py-3">
        <p className="font-mono text-[10px] tracking-[0.16em] text-terminal-amber">
          HOSTILE TAKEOVER · SELECT TARGET
        </p>
        <p className="mt-1.5 text-[13px] text-muted">
          Fight for control of the company. Beat each opponent to unlock the next rung.
        </p>
      </header>

      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {BOTS.map((bot, index) => {
          const isLocked = index >= unlocked;
          return (
            <li key={bot.id}>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onPick(bot)}
                ref={index === unlocked - 1 ? newestRef : undefined}
                className={cn(
                  "flex h-full w-full flex-col gap-3 border bg-bg p-3 text-left transition-colors",
                  isLocked
                    ? "cursor-not-allowed border-border opacity-50"
                    : "border-border-strong hover:border-rival",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted">RUNG {index + 1}</span>
                  {isLocked ? (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-locked-fg">
                      <Lock size={11} aria-hidden /> LOCKED
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-up">UNLOCKED</span>
                  )}
                </span>
                <span className="font-mono text-[16px] tracking-wide text-rival">{bot.name}</span>
                <span className="space-y-1.5">
                  <StatBar label="SPEED" value={bot.speedRating} />
                  <StatBar label="ACCURACY" value={Math.round(bot.accuracy * 100)} />
                </span>
                <span className="text-[12px] leading-snug text-muted">{bot.playstyle}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
