/**
 * STUB — owner: task F4. CLAIM-REQUIRED (see CLAUDE.md).
 *
 * The shared state machine every mode runs on:
 *
 *   idle → playing → feedback → playing → … → summary
 *
 * Owns: current question, answer checking, combo tracking, lives, the clock, score
 * accumulation, and emitting XP to the progress store on completion.
 *
 * Modes configure it via GameModeDefinition.rules and read state from the returned
 * session. If a mode is re-implementing anything in the list above, it belongs here.
 *
 * Sketch:
 *   export type GameSession = {
 *     status: "idle" | "playing" | "feedback" | "summary";
 *     question: Question | null;
 *     index: number;
 *     score: number;
 *     combo: number;
 *     livesLeft: number | null;
 *     timeRemainingSec: number | null;
 *     lastAnswer: { choiceIndex: number; correct: boolean } | null;
 *     answer: (choiceIndex: number) => void;
 *     next: () => void;
 *     start: () => void;
 *   };
 *
 *   export function useGameSession(mode: GameModeDefinition): GameSession
 */
export {};
