"use client";

import { TerminalPanel } from "@/components/game/terminal-panel";
import type { MatchView } from "@/lib/engine/versus/player";

import { POWER_UP_ORDER, type PowerUpKind } from "./config";
import type { MatchState, Seat } from "./match/types";
import { PowerCard } from "./power-card";

type TradingPitProps = {
  view: MatchView<MatchState>;
  seat: Seat;
  onUse: (power: PowerUpKind) => void;
};

export function TradingPit({ view, seat, onUse }: TradingPitProps) {
  return (
    <TerminalPanel number={6} title="Trading pit · Q W E R T" bodyClassName="p-1">
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
        {POWER_UP_ORDER.map((power) => (
          <PowerCard key={power} view={view} seat={seat} power={power} onUse={onUse} />
        ))}
      </div>
    </TerminalPanel>
  );
}
