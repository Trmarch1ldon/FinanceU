/**
 * STUB — owner: task F3. CLAIM-REQUIRED (see CLAUDE.md).
 *
 * This is the contract that makes parallel work possible: two people building two game
 * modes share only their one line in registry.ts. Get it right before the modes land —
 * changing it afterwards forces everyone to rebase.
 *
 * Sketch:
 *   export type ScoringContext = {
 *     correct: boolean;
 *     difficulty: Difficulty;
 *     msToAnswer: number;
 *     comboCount: number;     // consecutive correct answers
 *     timeRemainingSec?: number;
 *   };
 *
 *   export type GameModeProps = {
 *     session: GameSession;    // from src/lib/engine/use-game-session.ts
 *   };
 *
 *   export type GameModeDefinition = {
 *     id: string;              // url segment, e.g. "time-attack"
 *     name: string;
 *     tagline: string;
 *     icon: LucideIcon;
 *     rules: {
 *       questionCount?: number;   // undefined = unbounded (time or lives cap it)
 *       timeLimitSec?: number;
 *       lives?: number;
 *       difficultyRamp?: boolean;
 *     };
 *     scoring: (ctx: ScoringContext) => number;
 *     Component: React.ComponentType<GameModeProps>;
 *   };
 *
 * A mode supplies rules, scoring, and presentation. It NEVER re-implements answer
 * checking, question selection, or combo tracking — that lives in src/lib/engine/.
 */
export {};
