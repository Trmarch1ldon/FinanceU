/**
 * The question shape every game mode and question bank depends on (task F3).
 *
 * Topics follow the IB technical-interview track the dashboard roadmap shows, in the order
 * it's learned, plus mental math. Ids match `data/mock/roadmap.ts` and `data/mock/topics.ts`
 * so U1b can swap the mocks for real progress without a mapping table.
 */

export type Topic =
  | "accounting"
  | "three-statements"
  | "ratios"
  | "valuation"
  | "dcf"
  | "comps"
  | "ma"
  | "lbo"
  | "mental-math";

/** 1 = first-round screen, 2 = superday standard, 3 = the follow-up that separates people. */
export type Difficulty = 1 | 2 | 3;

export type Question = {
  /** Stable and topic-prefixed, e.g. "dcf-001". Never renumber: progress refers to it. */
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  /** Exactly four, exactly one correct — enforced by the types so a malformed bank fails to compile. */
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  /** Shown after answering. This is where the learning happens, so never leave it thin. */
  explanation: string;
};

/**
 * A question answered by typing a number rather than picking one of four — the quick-math
 * prompts Survival and Time Attack fire off. Generated from templates, so these never run out
 * and are never stored in a bank. Added for F4; `Question` itself is unchanged.
 */
export type NumericQuestion = {
  kind: "numeric";
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  answer: number;
  /** Largest accepted distance from `answer`, so "12.4" passes for 12.35. */
  tolerance: number;
  /** Shown beside the input — "%", "$", "x". */
  unit?: string;
  explanation: string;
};

/** Anything a session can serve. Narrow with `"kind" in q && q.kind === "numeric"`. */
export type PlayableQuestion = Question | NumericQuestion;
