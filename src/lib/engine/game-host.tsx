"use client";

import { getMode, getVersusMode } from "@/features/game-modes/registry";

import { ModeSession } from "./mode-session";

type GameHostProps = {
  /** An id, not the definition: definitions hold functions, which can't cross from the
   *  server page into a client component. */
  modeId: string;
};

/** Resolves a mode from the registry and runs it. */
export function GameHost({ modeId }: GameHostProps) {
  // Versus modes run their own match engine; the host only renders them.
  const versus = getVersusMode(modeId);
  if (versus) return <versus.Component key={versus.id} />;

  const mode = getMode(modeId);
  if (!mode) return null;
  // Keyed so navigating between modes builds a fresh session for each.
  return <ModeSession key={mode.id} mode={mode} />;
}
