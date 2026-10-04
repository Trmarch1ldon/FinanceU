"use client";

import { useSyncExternalStore } from "react";

import type { MatchView } from "./player";

/**
 * One value out of a live match. The component re-renders only when this value changes, so a
 * cash readout ignores the clock and a clock ignores the cash. `select` must return a primitive
 * (or a reference that only changes when its content does).
 */
export function useMatchValue<State, V>(view: MatchView<State>, select: (state: State) => V) {
  return useSyncExternalStore(
    view.subscribe,
    () => select(view.get()),
    () => select(view.get()),
  );
}
