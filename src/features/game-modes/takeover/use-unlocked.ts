"use client";

import { useSyncExternalStore } from "react";

import { subscribeProgress, unlockedCount } from "./progress";

/** How many bots are open. The server has no storage, so it renders the Intern only. */
export function useUnlocked() {
  return useSyncExternalStore(subscribeProgress, unlockedCount, () => 1);
}
