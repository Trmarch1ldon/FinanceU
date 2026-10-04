"use client";

import { useState } from "react";

import { TerminalPanel } from "@/components/game/terminal-panel";
import type { LiveState } from "@/features/game-modes/types";
import { cn } from "@/lib/utils";

import type { Feed } from "./feed";
import { NewsFeed } from "./news-feed";
import { OrderBook } from "./order-book";
import { TimeAndSales } from "./time-and-sales";

const TABS = [
  { id: "news", label: "NEWS" },
  { id: "tape", label: "TIME & SALES" },
  { id: "book", label: "ORDER BOOK" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type SidePanelsProps = { ticker: string; live: LiveState; feed: Feed };

/**
 * News, Time & Sales and the order book. Wide screens stack all three in a column; narrower
 * ones show one at a time behind tabs. It's one set of panels either way — hidden tabs stay
 * mounted, so the feeds keep accumulating and nothing subscribes twice.
 */
export function SidePanels({ ticker, live, feed }: SidePanelsProps) {
  const [tab, setTab] = useState<TabId>("news");
  const hiddenUnlessActive = (id: TabId) => cn(tab !== id && "hidden xl:flex");

  return (
    <div className="flex min-h-0 flex-col gap-1">
      <div role="tablist" aria-label="Market panels" className="flex gap-1 xl:hidden">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex-1 border px-2 py-1 font-mono text-[10px] tracking-[0.12em]",
              tab === id
                ? "border-terminal-amber bg-panel text-terminal-amber"
                : "border-border text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <TerminalPanel
        number={2}
        title="News"
        className={cn("h-56 xl:h-auto xl:flex-[1.2]", hiddenUnlessActive("news"))}
      >
        <NewsFeed ticker={ticker} feed={feed} />
      </TerminalPanel>
      <TerminalPanel
        number={3}
        title="Time & Sales"
        className={cn("h-56 xl:h-auto xl:flex-1", hiddenUnlessActive("tape"))}
        bodyClassName="overflow-hidden"
      >
        <TimeAndSales feed={feed} />
      </TerminalPanel>
      <TerminalPanel
        number={4}
        title="Order Book"
        className={cn("xl:shrink-0", hiddenUnlessActive("book"))}
      >
        <OrderBook live={live} feed={feed} />
      </TerminalPanel>
    </div>
  );
}
