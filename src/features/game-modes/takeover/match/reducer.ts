/**
 * Hostile Takeover's rules, as a pure reducer: `(state, action) → state`. Every action carries
 * its own time (`at`), so nothing in here reads a clock or rolls a die — the same action log
 * replays to the same match, which is what lets this run on a server later. The UI and the bot
 * never change state directly; they send intents that become actions.
 */
import { isChoiceCorrect, isNumberCorrect } from "@/lib/engine/check-answer";
import { speedFactor } from "@/lib/engine/scoring";

import { ATTACKS, TAKEOVER as C, POWER_UP_ORDER, type PowerUpKind } from "../config";
import { baseDifficulty, questionAt } from "./questions";
import {
  otherSeat,
  type AnswerResponse,
  type MatchAction,
  type MatchEvent,
  type MatchState,
  type Seat,
  type SeatState,
} from "./types";

function freshSeat(): SeatState {
  return {
    cash: C.startCash,
    cashEarned: 0,
    streak: 0,
    bestStreak: 0,
    answered: 0,
    correct: 0,
    index: 0,
    difficulty: baseDifficulty(0),
    shownAt: 0,
    readyAt: Object.fromEntries(POWER_UP_ORDER.map((k) => [k, 0])) as Record<PowerUpKind, number>,
    hasTip: false,
    isHedged: false,
    squeezedFor: 0,
    haltedUntil: 0,
    pillUntil: 0,
    powerUpsUsed: 0,
    biggestSwing: 0,
    isTyping: false,
  };
}

export function createMatch(seed: number): MatchState {
  return {
    status: "waiting",
    seed,
    startAt: 0,
    elapsed: 0,
    control: C.startControl,
    isSuddenDeath: false,
    seats: { p1: freshSeat(), p2: freshSeat() },
    history: [C.startControl],
    marks: [],
    events: [],
    winner: null,
    reason: null,
  };
}

/** The question a seat is looking at right now. */
export const currentQuestion = (state: MatchState, seat: Seat) =>
  questionAt(state.seed, state.seats[seat].index, state.seats[seat].difficulty);

/** A seat's share of the company. */
export const controlOf = (state: MatchState, seat: Seat) =>
  seat === "p1" ? state.control : 100 - state.control;

const isHalted = (seat: SeatState, t: number) => t < seat.haltedUntil;
const hasPill = (seat: SeatState, t: number) => t < seat.pillUntil;

function isCorrectResponse(state: MatchState, seat: Seat, response: AnswerResponse) {
  const question = currentQuestion(state, seat);
  return response.kind === "choice"
    ? isChoiceCorrect(question, response.index)
    : isNumberCorrect(question, response.value);
}

/** Advance the seat to its next question, applying a pending Short Squeeze. */
function nextQuestion(seat: SeatState, t: number): SeatState {
  const index = seat.index + 1;
  const base = baseDifficulty(index);
  const isSqueezed = seat.squeezedFor > 0;
  return {
    ...seat,
    index,
    difficulty: isSqueezed ? (Math.min(3, base + 1) as 1 | 2 | 3) : base,
    squeezedFor: isSqueezed ? seat.squeezedFor - 1 : 0,
    shownAt: t,
    hasTip: false,
  };
}

function end(state: MatchState, winner: Seat, reason: MatchState["reason"] & string, t: number) {
  return {
    ...state,
    status: "over" as const,
    winner,
    reason,
    events: [...state.events, { t, kind: "end" as const, winner, reason }],
  };
}

/** Sample control into the chart history up to time `t`. */
function sampleTo(state: MatchState, t: number): MatchState {
  const due = Math.floor(t / C.sampleMs) + 1;
  if (state.history.length >= due) return state;
  const history = [...state.history];
  while (history.length < due) history.push(state.control);
  return { ...state, history };
}

function advanceClock(state: MatchState, at: number): MatchState {
  // Not capped at the bell: in sudden death the clock keeps running, so halts and pills
  // bought there still expire.
  const t = at - state.startAt;
  let next = sampleTo({ ...state, elapsed: Math.max(state.elapsed, t) }, t);

  if (next.elapsed >= C.matchMs && !next.isSuddenDeath) {
    const tie = next.control.toFixed(C.tieDecimals) === (50).toFixed(C.tieDecimals);
    if (tie) {
      next = {
        ...next,
        isSuddenDeath: true,
        events: [...next.events, { t: C.matchMs, kind: "sudden-death" }],
      };
    } else {
      next = end(next, next.control > 50 ? "p1" : "p2", "bell", C.matchMs);
    }
  }
  return next;
}

function answer(state: MatchState, seat: Seat, response: AnswerResponse, t: number): MatchState {
  const me = state.seats[seat];
  if (isHalted(me, t)) return state;

  const isCorrect = isCorrectResponse(state, seat, response);
  const ms = t - me.shownAt;
  const speed = speedFactor(ms, C.fastMs, C.slowMs);

  // Control moves toward whoever earned it. A hedged miss costs nothing and spends the hedge.
  const isHedgedMiss = !isCorrect && me.isHedged;
  const delta = isCorrect
    ? C.correctControl + (C.fastControl - C.correctControl) * speed
    : isHedgedMiss
      ? 0
      : -C.wrongControl;
  const signed = seat === "p1" ? delta : -delta;
  const control = Math.min(100, Math.max(0, state.control + signed));
  const cash = isCorrect ? Math.round(C.correctCash + (C.fastCash - C.correctCash) * speed) : 0;

  const streak = isCorrect ? me.streak + 1 : 0;
  const updated: SeatState = nextQuestion(
    {
      ...me,
      cash: me.cash + cash,
      cashEarned: me.cashEarned + cash,
      streak,
      bestStreak: Math.max(me.bestStreak, streak),
      answered: me.answered + 1,
      correct: me.correct + (isCorrect ? 1 : 0),
      isHedged: isHedgedMiss ? false : me.isHedged,
      biggestSwing: Math.max(me.biggestSwing, delta),
      isTyping: false,
    },
    t,
  );

  const events: MatchEvent[] = [
    ...state.events,
    { t, kind: "answer", seat, isCorrect, delta, isHedged: isHedgedMiss },
  ];

  // Lead changes and stake alerts, for the news wire.
  const before = state.control;
  if (Math.sign(before - 50) !== Math.sign(control - 50) && control !== 50) {
    events.push({ t, kind: "lead", seat: control > 50 ? "p1" : "p2" });
  }
  for (const level of C.stakeAlerts) {
    if (before < level && control >= level) events.push({ t, kind: "stake", seat: "p1", level });
    if (100 - before < level && 100 - control >= level)
      events.push({ t, kind: "stake", seat: "p2", level });
  }

  let next: MatchState = {
    ...state,
    control,
    seats: { ...state.seats, [seat]: updated },
    marks: [...state.marks, state.history.length, seat === "p1" ? 1 : 2, isCorrect ? 1 : 0],
    events,
  };

  if (control >= 100) return end(next, "p1", "takeover", t);
  if (control <= 0) return end(next, "p2", "takeover", t);
  if (next.isSuddenDeath && isCorrect) next = end(next, seat, "sudden-death", t);
  return next;
}

function applyPower(state: MatchState, seat: Seat, power: PowerUpKind, t: number): MatchState {
  const me = state.seats[seat];
  const spec = C.powerUps[power];
  if (isHalted(me, t) || me.cash < spec.cost || t < me.readyAt[power]) return state;

  let seats = {
    ...state.seats,
    [seat]: {
      ...me,
      cash: me.cash - spec.cost,
      readyAt: { ...me.readyAt, [power]: t + C.cooldownMs },
      powerUpsUsed: me.powerUpsUsed + 1,
    },
  } as Record<Seat, SeatState>;

  let target: Seat = seat;
  let isBounced = false;

  if (ATTACKS.includes(power)) {
    target = otherSeat(seat);
    // A live Poison Pill sends the attack back to whoever launched it, and is spent.
    if (hasPill(seats[target], t)) {
      seats = { ...seats, [target]: { ...seats[target], pillUntil: 0 } };
      target = seat;
      isBounced = true;
    }
  }

  const victim = seats[target];
  switch (power) {
    case "insider":
      seats = { ...seats, [seat]: { ...seats[seat], hasTip: true } };
      break;
    case "hedge":
      seats = { ...seats, [seat]: { ...seats[seat], isHedged: true } };
      break;
    case "pill":
      seats = { ...seats, [seat]: { ...seats[seat], pillUntil: t + C.powerUps.pill.durationMs } };
      break;
    case "squeeze":
      seats = {
        ...seats,
        [target]: { ...victim, squeezedFor: victim.squeezedFor + C.powerUps.squeeze.questions },
      };
      break;
    case "halt":
      seats = {
        ...seats,
        [target]: {
          ...victim,
          haltedUntil: Math.max(victim.haltedUntil, t + C.powerUps.halt.durationMs),
          isTyping: false,
        },
      };
      break;
  }

  return {
    ...state,
    seats,
    events: [...state.events, { t, kind: "power", seat, power, target, isBounced }],
  };
}

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  if (action.type === "start") {
    if (state.status !== "waiting") return state;
    return { ...state, status: "live", startAt: action.at, elapsed: 0 };
  }
  if (state.status !== "live") return state;

  // Every action first brings the clock up to its own time, so the bell can't be outrun.
  const clocked = advanceClock(state, action.at);
  if (clocked.status !== "live") return clocked;
  const t = clocked.elapsed;

  switch (action.type) {
    case "tick":
      return clocked;
    case "answer":
      return answer(clocked, action.seat, action.response, t);
    case "power":
      return applyPower(clocked, action.seat, action.power, t);
    case "typing": {
      const seat = clocked.seats[action.seat];
      if (seat.isTyping === action.isTyping || isHalted(seat, t)) return clocked;
      return {
        ...clocked,
        seats: { ...clocked.seats, [action.seat]: { ...seat, isTyping: action.isTyping } },
      };
    }
  }
}
