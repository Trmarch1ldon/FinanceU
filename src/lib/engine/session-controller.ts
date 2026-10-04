/**
 * The session state machine (task F4), with no React in it — `useGameSession` is a thin
 * subscription over this, so the rules can be driven and tested without rendering anything.
 *
 *   idle → playing → (feedback →) playing → … → summary
 *
 * Owns: the current question, answer checking, combo, lives, the clock, score accumulation and
 * the mode's tick loop. Emitting XP to the progress store arrives with F6.
 *
 * The clock is wall-clock, not tick-count: background tabs throttle timers to about once a
 * second (far less after a few minutes), and a mode like Survival must keep draining while
 * you're away rather than pause for whoever switches tabs. Each tick advances by the real time
 * since the last one, replayed in `tickMs` steps so the mode sees the same small steps either way.
 */
import type {
  GameModeDefinition,
  GameState,
  LiveState,
  ScoringContext,
} from "@/features/game-modes/types";
import type { PlayableQuestion } from "@/types/question";

import { isChoiceCorrect, isNumberCorrect } from "./check-answer";
import { createRandom, pickQuestion, rampDifficulty, seedFromDate } from "./select-questions";

const DEFAULT_TICK_MS = 100;

/** Longest absence replayed on return. Past this the run would have ended anyway. */
const MAX_CATCH_UP_MS = 30 * 60 * 1000;

export type SessionView = {
  state: GameState;
  question: PlayableQuestion | null;
  lastAnswer: { correct: boolean; choiceIndex?: number; value?: number } | null;
};

/** ModeState arrays are copied, so a run never mutates the mode's `initialModeState`. */
function freshModeState(mode: GameModeDefinition) {
  const initial = mode.initialModeState ?? {};
  return Object.fromEntries(
    Object.entries(initial).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
  );
}

function initialState(mode: GameModeDefinition): GameState {
  return {
    status: "idle",
    index: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    answeredCount: 0,
    correctCount: 0,
    livesLeft: mode.rules.lives ?? null,
    elapsedMs: 0,
    modeState: freshModeState(mode),
  };
}

const now = () => performance.now();

export function createSessionController(mode: GameModeDefinition) {
  const tickMs = mode.rules.tickMs ?? DEFAULT_TICK_MS;

  let state = initialState(mode);
  let question: PlayableQuestion | null = null;
  let lastAnswer: SessionView["lastAnswer"] = null;
  let view: SessionView = { state, question, lastAnswer };

  let questionShownAtMs = 0;
  let lastClock = 0;
  let interval: ReturnType<typeof setInterval> | null = null;
  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  let used = new Set<string>();
  let random = Math.random;

  const liveListeners = new Set<(state: GameState) => void>();
  const viewListeners = new Set<() => void>();

  /** Publish to live subscribers always; to React only when asked. */
  function publish(render: boolean) {
    for (const listener of liveListeners) listener(state);
    if (!render) return;
    view = { state, question, lastAnswer };
    for (const listener of viewListeners) listener();
  }

  function stopLoop() {
    if (interval !== null) clearInterval(interval);
    interval = null;
  }

  function startLoop() {
    stopLoop();
    // Runs for every mode, tick or not: the clock is what measures msToAnswer.
    lastClock = now();
    interval = setInterval(catchUp, tickMs);
  }

  function isRunOver() {
    const { rules } = mode;
    if (rules.questionCount !== undefined && state.answeredCount >= rules.questionCount)
      return true;
    if (state.livesLeft !== null && state.livesLeft <= 0) return true;
    if (rules.timeLimitSec !== undefined && state.elapsedMs >= rules.timeLimitSec * 1000)
      return true;
    return mode.isOver?.(state) ?? false;
  }

  function finish() {
    stopLoop();
    if (feedbackTimer !== null) clearTimeout(feedbackTimer);
    feedbackTimer = null;
    state = {
      ...state,
      status: "summary",
      score: mode.finalScore ? mode.finalScore(state) : state.score,
    };
    publish(true);
  }

  function serveQuestion() {
    const difficulty =
      mode.difficultyAt?.(state) ??
      (mode.rules.difficultyRamp ? rampDifficulty(state.answeredCount) : null);

    question = pickQuestion({
      source: mode.questions ?? {},
      state,
      difficulty,
      topics: mode.rules.topics,
      used,
      random,
    });
    questionShownAtMs = state.elapsedMs;
  }

  /** Advance the clock to now. Runs on every interval and when a hidden tab comes back. */
  function catchUp() {
    if (state.status !== "playing") return;

    const clock = now();
    let pending = Math.min(clock - lastClock, MAX_CATCH_UP_MS);
    lastClock = clock;

    while (pending > 0) {
      const dt = Math.min(tickMs, pending);
      pending -= dt;

      state = { ...state, elapsedMs: state.elapsedMs + dt };
      if (mode.tick) state = { ...state, modeState: mode.tick(state, dt) };

      if (isRunOver()) {
        finish();
        return;
      }
    }

    publish(!mode.rules.liveTicks);
  }

  function resolve(correct: boolean, answerDetail: { choiceIndex?: number; value?: number }) {
    if (state.status !== "playing" || !question) return;

    // Bank the time up to this instant first, so a slow answer is measured — and drained —
    // in full rather than up to the last tick.
    catchUp();
    if (state.status !== "playing") return;

    const combo = correct ? state.combo + 1 : 0;
    const ctx: ScoringContext = {
      correct,
      difficulty: question.difficulty,
      msToAnswer: state.elapsedMs - questionShownAtMs,
      comboCount: combo,
      timeRemainingSec: mode.rules.timeLimitSec
        ? Math.max(0, mode.rules.timeLimitSec - state.elapsedMs / 1000)
        : undefined,
    };

    state = {
      ...state,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      score: state.score + mode.scoring(ctx),
      answeredCount: state.answeredCount + 1,
      correctCount: state.correctCount + (correct ? 1 : 0),
      livesLeft: !correct && state.livesLeft !== null ? state.livesLeft - 1 : state.livesLeft,
    };
    if (mode.onAnswer) state = { ...state, modeState: mode.onAnswer(state, ctx) };
    lastAnswer = { correct, ...answerDetail };

    if (isRunOver()) {
      finish();
      return;
    }

    const { feedbackMs } = mode.rules;
    if (feedbackMs === 0) {
      // No pause: the next question lands in the same update, and the clock never stopped.
      state = { ...state, index: state.index + 1 };
      serveQuestion();
      publish(true);
      return;
    }

    stopLoop();
    state = { ...state, status: "feedback" };
    publish(true);
    if (feedbackMs !== undefined) feedbackTimer = setTimeout(next, feedbackMs);
  }

  function start() {
    stopLoop();
    if (feedbackTimer !== null) clearTimeout(feedbackTimer);
    feedbackTimer = null;

    used = new Set();
    random = mode.rules.seededByDate
      ? createRandom(seedFromDate(new Date().toISOString().slice(0, 10)))
      : Math.random;

    state = { ...initialState(mode), status: "playing" };
    lastAnswer = null;
    serveQuestion();
    startLoop();
    publish(true);
  }

  function next() {
    if (state.status !== "feedback") return;
    if (feedbackTimer !== null) clearTimeout(feedbackTimer);
    feedbackTimer = null;

    state = { ...state, status: "playing", index: state.index + 1 };
    serveQuestion();
    startLoop();
    publish(true);
  }

  const live: LiveState = {
    get: () => state,
    subscribe: (listener) => {
      liveListeners.add(listener);
      return () => liveListeners.delete(listener);
    },
  };

  return {
    live,
    start,
    next,
    answer: (choiceIndex: number) => {
      if (question) resolve(isChoiceCorrect(question, choiceIndex), { choiceIndex });
    },
    answerNumber: (value: number) => {
      if (question) resolve(isNumberCorrect(question, value), { value });
    },
    catchUp,
    /** Stop timers without touching state — for unmounts. `resume` picks the loop back up. */
    suspend: () => {
      stopLoop();
      if (feedbackTimer !== null) clearTimeout(feedbackTimer);
      feedbackTimer = null;
    },
    resume: () => {
      if (state.status === "playing" && interval === null) {
        startLoop();
      } else if (state.status === "feedback" && mode.rules.feedbackMs !== undefined) {
        feedbackTimer = setTimeout(next, mode.rules.feedbackMs);
      }
    },
    getView: () => view,
    subscribeView: (listener: () => void) => {
      viewListeners.add(listener);
      return () => {
        viewListeners.delete(listener);
      };
    },
  };
}

export type SessionController = ReturnType<typeof createSessionController>;
