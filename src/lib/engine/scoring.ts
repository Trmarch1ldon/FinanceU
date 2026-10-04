/**
 * Shared scoring helpers (task F4). Modes compose these in their own `scoring(ctx)`. Each one
 * is pure, so a mode's score is reproducible from its answers alone.
 */
import type { Difficulty } from "@/types/question";

const BASE_POINTS: Record<Difficulty, number> = { 1: 100, 2: 150, 3: 225 };

export const basePoints = (difficulty: Difficulty) => BASE_POINTS[difficulty];

/** +10% per consecutive correct answer after the first, capped at ×2. */
export const comboMultiplier = (comboCount: number) =>
  Math.min(2, 1 + Math.max(0, comboCount - 1) * 0.1);

/**
 * Bonus fraction for answering fast: `max` at or under `fastMs`, falling linearly to 0 at
 * `slowMs`. Survival's price spike and Time Attack's points both shape speed this way.
 */
export function speedFactor(msToAnswer: number, fastMs: number, slowMs: number, max = 1) {
  if (msToAnswer <= fastMs) return max;
  if (msToAnswer >= slowMs) return 0;
  return max * (1 - (msToAnswer - fastMs) / (slowMs - fastMs));
}
