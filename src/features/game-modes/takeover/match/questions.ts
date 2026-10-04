/**
 * The shared question sequence. Question `i` at difficulty `d` is a pure function of the match
 * seed, so both seats — and a server — produce the identical question with no coordination.
 * A Short Squeeze serves the harder variant of the same question number.
 */
import { generateMentalMath } from "@/data/questions/mental-math-templates";
import { MOCK_CONCEPT_QUESTIONS } from "@/data/questions/mock-concepts";
import { isNumericQuestion } from "@/lib/engine/check-answer";
import { createRandom } from "@/lib/engine/select-questions";
import type { Difficulty, PlayableQuestion } from "@/types/question";

import { TAKEOVER as C } from "../config";

const mix = (seed: number, index: number, difficulty: number) =>
  (seed ^ Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(difficulty, 0x85ebca6b)) >>> 0;

export function baseDifficulty(index: number): Difficulty {
  if (index >= C.difficultyFrom.hard) return 3;
  if (index >= C.difficultyFrom.medium) return 2;
  return 1;
}

function multipleChoiceShare(index: number) {
  let share = 0;
  for (const step of C.multipleChoiceShare) if (index >= step.from) share = step.share;
  return share;
}

export function questionAt(seed: number, index: number, difficulty: Difficulty): PlayableQuestion {
  const random = createRandom(mix(seed, index, difficulty));

  if (random() < multipleChoiceShare(index)) {
    const pool = MOCK_CONCEPT_QUESTIONS;
    const distance = (d: number) => Math.abs(d - difficulty);
    const best = Math.min(...pool.map((q) => distance(q.difficulty)));
    const candidates = pool.filter((q) => distance(q.difficulty) === best);
    return candidates[Math.floor(random() * candidates.length)];
  }

  const question = generateMentalMath(difficulty, random);
  return {
    ...question,
    tolerance: Math.max(question.tolerance, Math.abs(question.answer) * C.relativeTolerance),
  };
}

/** Two wrong options an Insider Tip strikes out — the same two for anyone who looks. */
export function tipHiddenChoices(seed: number, index: number, question: PlayableQuestion) {
  if (isNumericQuestion(question)) return [];
  const random = createRandom(mix(seed, index, 7));
  const wrong = [0, 1, 2, 3].filter((i) => i !== question.answerIndex);
  wrong.splice(Math.floor(random() * wrong.length), 1);
  return wrong;
}

/** An Insider Tip on quick math: the answer's first digit. */
export function tipFirstDigit(question: PlayableQuestion) {
  if (!isNumericQuestion(question)) return null;
  return (
    String(Math.abs(question.answer))
      .replace(/^0\.?0*/, "")
      .charAt(0) || "0"
  );
}
