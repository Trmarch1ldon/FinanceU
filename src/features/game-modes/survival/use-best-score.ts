"use client";

import { useSyncExternalStore } from "react";

import { bestRun, loadRuns, RUNS_CHANGED } from "./results";

function subscribe(onChange: () => void) {
  window.addEventListener(RUNS_CHANGED, onChange);
  // Another tab finishing a run.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(RUNS_CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const readBest = () => bestRun(loadRuns())?.score ?? null;

/** Best Margin Call score on this device, or null. The server has no storage, so it renders
 *  null and the real value fills in after hydration. */
export function useBestScore() {
  return useSyncExternalStore(subscribe, readBest, () => null);
}
