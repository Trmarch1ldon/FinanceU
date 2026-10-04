"use client";

/**
 * The shared state machine every mode runs on (task F4). CLAIM-REQUIRED (see CLAUDE.md).
 *
 * A thin React subscription over `createSessionController`, which holds the actual rules.
 * Modes configure it through their GameModeDefinition and read the returned session; if a mode
 * is re-implementing answer checking, selection, combo or the clock, it belongs in there.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import type { GameModeDefinition, GameSession } from "@/features/game-modes/types";

import { createSessionController } from "./session-controller";

export function useGameSession(mode: GameModeDefinition): GameSession {
  // One controller per mounted session. The host keys this by mode id, so switching modes
  // remounts rather than reusing a controller built for a different definition.
  const [controller] = useState(() => createSessionController(mode));
  const view = useSyncExternalStore(
    controller.subscribeView,
    controller.getView,
    controller.getView,
  );

  useEffect(() => {
    controller.resume();
    // A hidden tab's timers are throttled; settle the clock the moment it's visible again
    // instead of waiting for the next (possibly minute-late) tick.
    const onVisibility = () => {
      if (document.visibilityState === "visible") controller.catchUp();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      controller.suspend();
    };
  }, [controller]);

  return useMemo(() => {
    const { state, question, lastAnswer } = view;
    const { timeLimitSec } = mode.rules;

    return {
      ...state,
      question,
      lastAnswer,
      timeRemainingSec: timeLimitSec ? Math.max(0, timeLimitSec - state.elapsedMs / 1000) : null,
      start: controller.start,
      answer: controller.answer,
      answerNumber: controller.answerNumber,
      next: controller.next,
      live: controller.live,
    };
  }, [view, controller, mode.rules]);
}
