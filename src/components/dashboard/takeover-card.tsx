"use client";

import Link from "next/link";
import { Swords } from "lucide-react";

import { BOTS } from "@/features/game-modes/takeover/bots";
import { useUnlocked } from "@/features/game-modes/takeover/use-unlocked";

/** The way into Hostile Takeover: who's next on the ladder. Client leaf only because the
 *  ladder progress lives in this device's storage. */
export function TakeoverCard() {
  const unlocked = useUnlocked();
  const next = BOTS[Math.min(unlocked, BOTS.length) - 1];

  return (
    <section
      className="panel flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 transition-colors duration-200 hover:border-border-strong"
      aria-label="Hostile Takeover"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border-strong text-rival">
          <Swords size={18} strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="label">1v1 · Hostile Takeover</p>
          <p className="mt-1.5 truncate text-[13px] text-fg">
            Fight a rival for control of the company. Cash buys dirty tricks.
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted tabular-nums">
            Ladder {unlocked}/{BOTS.length} · 5:00 matches · first to 100% wins outright
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="label">Next target</p>
          <p className="mt-1.5 font-mono text-[15px] leading-none text-rival">{next.name}</p>
        </div>
        <Link
          href="/play/takeover"
          className="rounded-md border border-rival px-4 py-2 font-mono text-[12px] tracking-[0.1em] text-rival transition-colors hover:bg-rival-dim"
        >
          ENTER THE PIT
        </Link>
      </div>
    </section>
  );
}
