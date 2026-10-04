"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { wallClock, type Feed } from "./feed";
import { TERMINAL as T } from "./terminal-config";

type Print = { id: number; at: number; price: number; change: number; isCorrect: boolean };

/** Every answer prints as a trade: time, price after, change. Newest on top. */
export function TimeAndSales({ feed }: { feed: Feed }) {
  const [prints, setPrints] = useState<Print[]>([]);

  useEffect(() => {
    let id = 0;
    return feed.subscribe((event) => {
      if (event.kind !== "answer") return;
      setPrints((list) =>
        [
          {
            id: ++id,
            at: event.at,
            price: event.after,
            change: event.after - event.before,
            isCorrect: event.isCorrect,
          },
          ...list,
        ].slice(0, T.tapeMax),
      );
    });
  }, [feed]);

  return (
    <table className="w-full font-mono text-[11px] tabular-nums">
      <thead className="text-muted">
        <tr className="border-b border-border">
          <th className="px-2 py-1 text-left font-normal">TIME</th>
          <th className="px-2 py-1 text-right font-normal">PRICE</th>
          <th className="px-2 py-1 text-right font-normal">CHG</th>
        </tr>
      </thead>
      <tbody>
        {prints.length === 0 && (
          <tr>
            <td colSpan={3} className="px-2 py-1.5 text-muted">
              No prints yet
            </td>
          </tr>
        )}
        {prints.map((print) => (
          <tr key={print.id} className={cn("row-in", print.isCorrect ? "text-up" : "text-down")}>
            <td className="px-2 py-0.5 text-muted">{wallClock(print.at)}</td>
            <td className="px-2 py-0.5 text-right">{print.price.toFixed(2)}</td>
            <td className="px-2 py-0.5 text-right">
              <span aria-hidden>{print.isCorrect ? "▲" : "▼"}</span>
              {print.change >= 0 ? "+" : "−"}
              {Math.abs(print.change).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
