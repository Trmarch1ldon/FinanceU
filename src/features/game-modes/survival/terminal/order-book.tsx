"use client";

import { useEffect, useRef } from "react";

import type { LiveState } from "@/features/game-modes/types";

import { readMarket } from "../market";
import type { Feed } from "./feed";
import { flash } from "./flash";
import { TERMINAL as T } from "./terminal-config";

const LEVELS = T.bookLevels;

const randomSize = () => (1 + Math.floor(Math.random() * 50)) * 100;
const bigSize = () => (250 + Math.floor(Math.random() * 250)) * 100;

/** Price step between levels: about 0.15% of price, never under a cent. */
const tickFor = (price: number) => Math.max(0.01, Number((price * 0.0015).toFixed(2)));

/**
 * Five bids, five asks around the last price, sizes flickering constantly. Rendered once;
 * every update after that is a direct DOM write on its own timer, so the busiest panel on the
 * screen costs React nothing. A correct answer flashes a large bid in; a miss, a large offer.
 */
export function OrderBook({ live, feed }: { live: LiveState; feed: Feed }) {
  const askPrice = useRef<(HTMLTableCellElement | null)[]>([]);
  const askSize = useRef<(HTMLTableCellElement | null)[]>([]);
  const bidPrice = useRef<(HTMLTableCellElement | null)[]>([]);
  const bidSize = useRef<(HTMLTableCellElement | null)[]>([]);
  const spreadRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const asks = Array.from({ length: LEVELS }, randomSize);
    const bids = Array.from({ length: LEVELS }, randomSize);
    // A big order holds its level until this time, so the flicker doesn't erase it at once.
    let bigBidUntil = 0;
    let bigAskUntil = 0;

    const paintPrices = () => {
      const { price } = readMarket(live.get().modeState);
      const tick = tickFor(price);
      for (let i = 0; i < LEVELS; i++) {
        // Asks are listed top-down from the furthest level to the nearest.
        const ask = askPrice.current[LEVELS - 1 - i];
        if (ask) ask.textContent = (price + tick * (i + 1)).toFixed(2);
        const bid = bidPrice.current[i];
        if (bid) bid.textContent = Math.max(0, price - tick * (i + 1)).toFixed(2);
      }
      if (spreadRef.current) spreadRef.current.textContent = price.toFixed(2);
    };

    const writeSize = (
      cell: HTMLTableCellElement | null | undefined,
      size: number,
      previous: number,
    ) => {
      if (!cell) return;
      cell.textContent = size.toLocaleString("en-US");
      if (size !== previous) flash(cell, size > previous ? "up" : "down");
    };

    const flicker = () => {
      paintPrices();
      const now = performance.now();
      // Two or three levels move per beat; a full repaint every beat would read as static.
      for (let n = 0; n < 3; n++) {
        const side = Math.random() < 0.5 ? "bid" : "ask";
        const level = Math.floor(Math.random() * LEVELS);
        if (side === "bid" && !(level === 0 && now < bigBidUntil)) {
          const previous = bids[level];
          bids[level] = randomSize();
          writeSize(bidSize.current[level], bids[level], previous);
        } else if (side === "ask" && !(level === 0 && now < bigAskUntil)) {
          const previous = asks[level];
          asks[level] = randomSize();
          // asks[0] is the nearest level, which is the bottom ask row.
          writeSize(askSize.current[LEVELS - 1 - level], asks[level], previous);
        }
      }
    };

    // First paint: every cell.
    paintPrices();
    for (let i = 0; i < LEVELS; i++) {
      if (bidSize.current[i]) bidSize.current[i]!.textContent = bids[i].toLocaleString("en-US");
      const askCell = askSize.current[LEVELS - 1 - i];
      if (askCell) askCell.textContent = asks[i].toLocaleString("en-US");
    }

    const timer = setInterval(flicker, T.bookFlickerMs);
    const unsubscribe = feed.subscribe((event) => {
      if (event.kind !== "answer") return;
      if (event.isCorrect) {
        bids[0] = bigSize();
        bigBidUntil = performance.now() + T.bookBigSizeMs;
        writeSize(bidSize.current[0], bids[0], 0);
      } else {
        asks[0] = bigSize();
        bigAskUntil = performance.now() + T.bookBigSizeMs;
        writeSize(askSize.current[LEVELS - 1], asks[0], Infinity);
      }
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [live, feed]);

  const rows = Array.from({ length: LEVELS }, (_, i) => i);

  return (
    <table className="w-full font-mono text-[11px] tabular-nums">
      <thead className="text-muted">
        <tr className="border-b border-border">
          <th className="px-2 py-1 text-left font-normal">SIDE</th>
          <th className="px-2 py-1 text-right font-normal">PRICE</th>
          <th className="px-2 py-1 text-right font-normal">SIZE</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((i) => (
          <tr key={`ask-${i}`} className="text-down">
            <td className="px-2 py-px text-muted">ASK</td>
            <td
              ref={(el) => {
                askPrice.current[i] = el;
              }}
              className="px-2 py-px text-right"
            />
            <td
              ref={(el) => {
                askSize.current[i] = el;
              }}
              className="px-2 py-px text-right"
            />
          </tr>
        ))}
        <tr className="border-y border-border bg-panel">
          <td className="px-2 py-0.5 text-terminal-amber">LAST</td>
          <td ref={spreadRef} className="px-2 py-0.5 text-right text-fg" />
          <td className="px-2 py-0.5 text-right text-muted">—</td>
        </tr>
        {rows.map((i) => (
          <tr key={`bid-${i}`} className="text-up">
            <td className="px-2 py-px text-muted">BID</td>
            <td
              ref={(el) => {
                bidPrice.current[i] = el;
              }}
              className="px-2 py-px text-right"
            />
            <td
              ref={(el) => {
                bidSize.current[i] = el;
              }}
              className="px-2 py-px text-right"
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
