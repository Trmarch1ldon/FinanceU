"use client";

import { useEffect, useState } from "react";

import { TerminalPanel } from "@/components/game/terminal-panel";
import type { MatchView } from "@/lib/engine/versus/player";
import { cn } from "@/lib/utils";

import type { BotProfile } from "./bots";
import { headlinesFor, streakHeadline, type Headline } from "./headlines";
import type { MatchState, Seat } from "./match/types";

type MatchNewsProps = {
  view: MatchView<MatchState>;
  names: Record<Seat, string>;
  bot: BotProfile;
  botSeat: Seat;
};

type Item = Headline & { id: number; at: string };

const MAX = 40;
const stamp = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

/** The wire. Renders when a newsworthy event lands — never on a tick. */
export function MatchNews({ view, names, bot, botSeat }: MatchNewsProps) {
  const [items, setItems] = useState<Item[]>(() => [
    { id: 0, at: stamp(), text: `${bot.ticker}: “${bot.lines.opening[0]}”`, tone: "talk" },
    { id: 1, at: stamp(), text: `${names.p1} AND ${names.p2} OPEN AT 50/50`, tone: "breaking" },
  ]);

  useEffect(() => {
    let seen = view.get().events.length;
    let id = 2;
    return view.subscribe((state) => {
      if (state.events.length === seen) return;
      const fresh = state.events.slice(seen);
      seen = state.events.length;
      const add: Item[] = [];
      for (const event of fresh) {
        const lines: Headline[] = headlinesFor(event, names, bot, botSeat, id);
        if (event.kind === "answer" && event.isCorrect) {
          const streak = streakHeadline(
            names[event.seat],
            state.seats[event.seat].streak,
            event.seat,
          );
          if (streak) lines.push(streak);
        }
        for (const line of lines) add.push({ ...line, id: id++, at: stamp() });
      }
      if (add.length) setItems((list) => [...add.reverse(), ...list].slice(0, MAX));
    });
  }, [view, names, bot, botSeat]);

  return (
    <TerminalPanel number={4} title="News" className="h-full" bodyClassName="overflow-hidden">
      <ol className="h-full overflow-hidden font-mono text-[11px] leading-snug">
        {items.map((item) => (
          <li key={item.id} className="row-in flex gap-2 border-b border-border/60 px-2 py-1">
            <span className="shrink-0 text-muted tabular-nums">{item.at}</span>
            {item.isBreaking && (
              <span className="shrink-0 bg-down px-1 font-medium tracking-wide text-bg">
                BREAKING
              </span>
            )}
            <span
              className={cn(
                item.tone === "p1" && "text-terminal-amber",
                item.tone === "p2" && "text-rival",
                item.tone === "breaking" && "text-fg",
                item.tone === "talk" && "text-muted italic",
              )}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ol>
    </TerminalPanel>
  );
}
