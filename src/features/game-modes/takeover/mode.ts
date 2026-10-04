/**
 * Hostile Takeover (task M5): a 1v1 tug-of-war for control of a company, with a cash-powered
 * Trading Pit. Bots today; the match engine takes any MatchPlayer, so a human opponent later
 * is a new player implementation, not a new game.
 */
import { Swords } from "lucide-react";

import type { VersusModeDefinition } from "@/features/game-modes/types";

import { TakeoverView } from "./view";

export const takeoverMode: VersusModeDefinition = {
  id: "takeover",
  name: "Hostile Takeover",
  tagline: "Fight a rival for control of the company. Cash buys dirty tricks.",
  icon: Swords,
  Component: TakeoverView,
};
