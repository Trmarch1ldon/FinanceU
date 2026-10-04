"use client";

import type { GameModeDefinition } from "@/features/game-modes/types";

import { useGameSession } from "./use-game-session";

type ModeSessionProps = { mode: GameModeDefinition };

/** One run of one mode: owns the session and hands it to the mode's Component. */
export function ModeSession({ mode }: ModeSessionProps) {
  const session = useGameSession(mode);
  const { Component } = mode;
  return <Component session={session} />;
}
