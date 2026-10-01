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
  /** Four is the house style; exactly one is correct. */
  choices: string[];
  answerIndex: number;
  /** Shown after answering. This is where the learning happens, so never leave it thin. */
  explanation: string;
};
