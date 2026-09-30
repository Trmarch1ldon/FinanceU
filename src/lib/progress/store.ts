/**
 * STUB — owner: task F6.
 *
 * zustand store + `persist` middleware, the single source of truth for player progress.
 *
 * Watch out for: localStorage is unavailable in server components and can throw in
 * private windows. Guard reads, and make the store hydrate safely so the first render
 * matches the server (otherwise Next throws a hydration mismatch).
 *
 * Actions roughly: addXp, recordAnswer, finishRun, touchStreak, awardBadge, reset.
 */
export {};
