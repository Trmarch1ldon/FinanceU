"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { MARGIN_CALL as C } from "../config";
import { money } from "../format";
import { wallClock, type Feed } from "./feed";
import { createHeadlineWriter } from "./headlines";
import { TERMINAL as T } from "./terminal-config";

type Headline = { id: number; at: number; text: string; tone: "up" | "down" | "breaking" | "info" };

type NewsFeedProps = { ticker: string; feed: Feed };

/** Wire headlines written in reaction to play, newest on top. Renders on events only. */
export function NewsFeed({ ticker, feed }: NewsFeedProps) {
  // The panel mounts as the market opens, after that moment's event has already gone out, so
  // it writes its own opening headline.
  const [items, setItems] = useState<Headline[]>(() => [
    {
      id: 0,
      at: Date.now(),
      text: createHeadlineWriter().open({ T: ticker, p: money(C.startPrice) }),
      tone: "info",
    },
  ]);

  useEffect(() => {
    const writer = createHeadlineWriter();
    let id = 0;
    const push = (headline: Omit<Headline, "id">) =>
      setItems((list) => [{ ...headline, id: ++id }, ...list].slice(0, T.newsMax));

    return feed.subscribe((event) => {
      if (event.kind === "danger") {
        push({
          at: event.at,
          text: writer.write("danger", { T: ticker, p: money(C.dangerPrice) }),
          tone: "down",
        });
      } else {
        const pct = Math.abs(((event.after - event.before) / Math.max(event.before, 0.01)) * 100);
        const x = pct.toFixed(1);
        // Every fifth straight gain is a BREAKING banner instead of a routine beat.
        if (
          event.isCorrect &&
          event.streak >= C.bullRunStreak &&
          event.streak % C.bullRunStreak === 0
        ) {
          push({
            at: event.at,
            text: writer.write("bull", { T: ticker, n: event.streak }),
            tone: "breaking",
          });
        } else {
          push({
            at: event.at,
            text: writer.write(event.isCorrect ? "correct" : "wrong", { T: ticker, x }),
            tone: event.isCorrect ? "up" : "down",
          });
        }
      }
    });
  }, [feed, ticker]);

  return (
    <ol className="h-full overflow-hidden font-mono text-[11px] leading-snug">
      {items.map((item) => (
        <li key={item.id} className="row-in flex gap-2 border-b border-border/60 px-2 py-1">
          <span className="shrink-0 text-muted tabular-nums">{wallClock(item.at)}</span>
          {item.tone === "breaking" && (
            <span className="shrink-0 bg-down px-1 font-medium tracking-wide text-bg">
              BREAKING
            </span>
          )}
          <span
            className={cn(
              item.tone === "up" && "text-up",
              item.tone === "down" && "text-down",
              item.tone === "breaking" && "font-medium text-fg",
              item.tone === "info" && "text-fg",
            )}
          >
            {item.text}
          </span>
        </li>
      ))}
    </ol>
  );
}
