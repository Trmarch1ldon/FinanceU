/**
 * Answer checking (task F4). Pure: same input, same output, no store access. Every mode goes
 * through these — a mode that compares answers itself is re-implementing the engine.
 */
import type { NumericQuestion, PlayableQuestion } from "@/types/question";

export const isNumericQuestion = (question: PlayableQuestion): question is NumericQuestion =>
  "kind" in question && question.kind === "numeric";

export function isChoiceCorrect(question: PlayableQuestion, choiceIndex: number) {
  return !isNumericQuestion(question) && question.answerIndex === choiceIndex;
}

/** Within the question's tolerance, plus a hair for float error — 0.1 + 0.2 must pass for 0.3. */
export function isNumberCorrect(question: PlayableQuestion, value: number) {
  if (!isNumericQuestion(question) || !Number.isFinite(value)) return false;
  return Math.abs(value - question.answer) <= question.tolerance + 1e-9;
}

/**
 * Reads what someone typed: "1,250", "$12.5", "15%", "4.2x" and " -3 " all parse. Returns
 * null for anything that isn't a single number, so a stray keystroke can't count as an answer.
 */
export function parseNumericInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/[\s,$%x×]/gi, "");
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
