/**
 * STUB — owner: task F3.
 *
 * The question shape every game mode and question bank depends on. Write this first;
 * D1–D4 (question banks) are blocked until it exists.
 *
 * Sketch:
 *   export type Topic = "budgeting" | "credit" | "investing" | "debt" | "taxes" | "savings";
 *   export type Difficulty = 1 | 2 | 3;
 *
 *   export type Question = {
 *     id: string;              // stable, e.g. "budget-001" — never renumber, progress refers to it
 *     topic: Topic;
 *     difficulty: Difficulty;
 *     prompt: string;
 *     choices: string[];       // 4 is the house style
 *     answerIndex: number;
 *     explanation: string;     // shown after answering — this is where the learning happens
 *   };
 */
export {};
