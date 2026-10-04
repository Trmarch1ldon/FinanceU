/**
 * Question selection (task F4). Pure apart from the random source it's handed, so a seeded
 * source (Daily Challenge) gives everyone the same run.
 */
import type { GameState, QuestionSource } from "@/features/game-modes/types";
import type { Difficulty, PlayableQuestion, Question, Topic } from "@/types/question";

/** mulberry32 — tiny, fast, and good enough to shuffle a quiz. */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The same seed for everyone on a given calendar day, from an ISO date ("2026-10-04"). */
export function seedFromDate(isoDate: string) {
  let hash = 2166136261;
  for (let i = 0; i < isoDate.length; i++) {
    hash ^= isoDate.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Default ramp when a mode asks for one but doesn't define its own: by questions answered. */
export const rampDifficulty = (answeredCount: number): Difficulty =>
  answeredCount < 5 ? 1 : answeredCount < 12 ? 2 : 3;

type PickArgs = {
  source: QuestionSource;
  state: GameState;
  difficulty: Difficulty | null;
  topics?: Topic[];
  /** Pool ids already served this run. Mutated: the pick is added. */
  used: Set<string>;
  random: () => number;
};

function pickFromPool(pool: Question[], difficulty: Difficulty | null, args: PickArgs) {
  const fresh = pool.filter((q) => !args.used.has(q.id));
  // Out of unseen questions: allow repeats rather than end the run on an empty bank.
  if (fresh.length === 0) {
    for (const q of pool) args.used.delete(q.id);
    return pickFromPool(pool, difficulty, args);
  }

  // Exact difficulty if there is one, else the closest available — a thin bank still plays.
  let candidates = fresh;
  if (difficulty !== null) {
    const distance = (q: Question) => Math.abs(q.difficulty - difficulty);
    const best = Math.min(...fresh.map(distance));
    candidates = fresh.filter((q) => distance(q) === best);
  }

  const pick = candidates[Math.floor(args.random() * candidates.length)];
  args.used.add(pick.id);
  return pick;
}

/** The next question, or null if the mode has nothing to serve. */
export function pickQuestion(args: PickArgs): PlayableQuestion | null {
  const { source, state, difficulty, topics, random } = args;
  const pool = (source.pool ?? []).filter((q) => !topics || topics.includes(q.topic));
  const { generate } = source;

  const share = generate ? (source.generatedShare?.(state) ?? (pool.length > 0 ? 0.5 : 1)) : 0;

  if (generate && (pool.length === 0 || random() < share)) {
    return generate(difficulty ?? 1, random);
  }
  return pool.length > 0 ? pickFromPool(pool, difficulty, args) : null;
}
