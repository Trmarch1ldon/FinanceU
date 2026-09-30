import type { Rank, RankId } from "@/types/dashboard";

/** The finance career ladder. Real domain data, not mock — the XP thresholds are the
 *  actual progression and outlive the mock user. */
export const RANKS: Rank[] = [
  { id: "intern", name: "Intern", threshold: 0 },
  { id: "analyst", name: "Analyst", threshold: 1000 },
  { id: "associate", name: "Associate", threshold: 3000 },
  { id: "vp", name: "VP", threshold: 6000 },
  { id: "director", name: "Director", threshold: 10000 },
  { id: "md", name: "Managing Director", threshold: 15000 },
];

export type RankProgress = {
  rank: Rank;
  next: Rank | null;
  /** XP at which the next rank unlocks; null once you're an MD. */
  nextThreshold: number | null;
  /** 0–100 through the current rank. 100 at the top of the ladder. */
  percent: number;
};

/** Where someone sits on the ladder. Pure — the dashboard and the sidebar badge both
 *  call this rather than each doing their own arithmetic. */
export function rankProgress(xp: number): RankProgress {
  const index = Math.max(
    0,
    RANKS.findIndex(
      (r, i) => xp >= r.threshold && (i === RANKS.length - 1 || xp < RANKS[i + 1].threshold),
    ),
  );
  const rank = RANKS[index];
  const next = RANKS[index + 1] ?? null;

  if (!next) return { rank, next: null, nextThreshold: null, percent: 100 };

  const span = next.threshold - rank.threshold;
  const percent = Math.round(((xp - rank.threshold) / span) * 100);
  return { rank, next, nextThreshold: next.threshold, percent };
}

export const rankById = (id: RankId) => RANKS.find((r) => r.id === id) ?? RANKS[0];
