/**
 * Every playable mode, one line each, sorted by id (task F3).
 *
 * This is the only file two people building two different modes both touch, so: add your
 * import and your line, commit, push quickly. No barrel files anywhere else — this one is a
 * registry, not a re-export.
 *
 * Empty until the modes land (M1–M4). Each adds, e.g.:
 *   import { classicMode } from "./classic/mode";
 *   …
 *   export const GAME_MODES: GameModeDefinition[] = [classicMode];
 */
import { survivalMode } from "./survival/mode";
import { takeoverMode } from "./takeover/mode";
import type { GameModeDefinition, VersusModeDefinition } from "./types";

export const GAME_MODES: GameModeDefinition[] = [survivalMode];

/** Head-to-head modes, one line each, sorted by id. */
export const VERSUS_MODES: VersusModeDefinition[] = [takeoverMode];

export const getMode = (id: string): GameModeDefinition | undefined =>
  GAME_MODES.find((mode) => mode.id === id);

export const getVersusMode = (id: string): VersusModeDefinition | undefined =>
  VERSUS_MODES.find((mode) => mode.id === id);
