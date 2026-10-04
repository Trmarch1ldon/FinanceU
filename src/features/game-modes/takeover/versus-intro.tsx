"use client";

import { motion } from "motion/react";

import type { BotProfile } from "./bots";

type VersusIntroProps = {
  ticker: string;
  rank: string;
  bot: BotProfile;
  onGo: () => void;
  onBack: () => void;
};

/** Both names, both ratings, and the opponent's opening line. Enter to fight. */
export function VersusIntro({ ticker, rank, bot, onGo, onBack }: VersusIntroProps) {
  return (
    <section className="mx-auto max-w-3xl border border-border bg-bg px-6 py-10 text-center">
      <p className="font-mono text-[10px] tracking-[0.16em] text-terminal-amber">
        HOSTILE TAKEOVER · 5:00 · 50/50 START
      </p>

      <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0, visualDuration: 0.35 }}
          className="text-right"
        >
          <p className="font-mono text-[28px] tracking-[0.12em] text-terminal-amber">{ticker}</p>
          <p className="font-mono text-[11px] text-muted">{rank.toUpperCase()} · YOU</p>
        </motion.div>
        <span className="font-mono text-[14px] text-muted">VS</span>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0, visualDuration: 0.35 }}
          className="text-left"
        >
          <p className="font-mono text-[28px] tracking-[0.12em] text-rival">{bot.ticker}</p>
          <p className="font-mono text-[11px] text-muted">
            {Math.round(bot.accuracy * 100)}% ACCURACY · SPEED {bot.speedRating}
          </p>
        </motion.div>
      </div>

      <p className="mx-auto mt-8 max-w-[44ch] text-[15px] text-fg italic">
        “{bot.lines.opening[0]}”
      </p>
      <p className="mt-1 font-mono text-[11px] text-muted">— {bot.name}</p>

      <div className="mt-8 flex justify-center gap-2">
        <button
          type="button"
          autoFocus
          onClick={onGo}
          className="bg-terminal-amber px-6 py-2.5 font-mono text-[13px] tracking-[0.12em] text-bg transition-opacity hover:opacity-90"
        >
          RING THE BELL &lt;GO&gt;
        </button>
        <button
          type="button"
          onClick={onBack}
          className="border border-border-strong px-4 py-2.5 font-mono text-[12px] tracking-[0.1em] text-fg hover:bg-panel-hover"
        >
          CHANGE TARGET
        </button>
      </div>
      <p className="mt-4 font-mono text-[11px] text-muted">
        Type a number + Enter · 1–4 for choices · Q W E R T for the Trading Pit · M mutes
      </p>
    </section>
  );
}
