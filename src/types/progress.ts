/**
 * STUB — owner: task F6.
 *
 * Shapes for persisted player progress. Keep this serializable: it round-trips through
 * localStorage, so no Date objects, no Maps, no class instances — ISO strings and plain
 * objects only.
 *
 * Sketch:
 *   export type PlayerProgress = {
 *     xp: number;
 *     level: number;                          // derived from xp, cached for display
 *     streakDays: number;
 *     lastPlayedISO: string | null;           // date-only, e.g. "2026-09-29"
 *     masteryByTopic: Record<string, number>; // topic -> 0..1
 *     badgeIds: string[];
 *     bestScoreByMode: Record<string, number>;
 *   };
 *
 *   export type Badge = {
 *     id: string;
 *     name: string;
 *     description: string;
 *     earnedWhen: (p: PlayerProgress) => boolean;
 *   };
 */
export {};
