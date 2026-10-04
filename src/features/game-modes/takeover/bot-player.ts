/**
 * A bot in a seat. It sees exactly what any player sees — the match state — and acts only by
 * sending intents through the same `send` a human's UI or a network relay would use. Swap it
 * for a remote player and the match can't tell.
 */
import { isNumericQuestion } from "@/lib/engine/check-answer";
import type { MatchPlayer } from "@/lib/engine/versus/player";

import type { BotProfile } from "./bots";
import { TAKEOVER as C, type PowerUpKind } from "./config";
import { tipHiddenChoices } from "./match/questions";
import { controlOf, currentQuestion } from "./match/reducer";
import { otherSeat, type Intent, type MatchState, type Seat, type SeatState } from "./match/types";

type Random = () => number;

const between = (random: Random, [min, max]: readonly [number, number]) =>
  min + random() * (max - min);

const canBuy = (me: SeatState, power: PowerUpKind, t: number) =>
  me.cash >= C.powerUps[power].cost && t >= me.readyAt[power] && t >= me.haltedUntil;

/** Did the opponent attack this seat in the last few seconds? */
const wasJustAttacked = (state: MatchState, seat: Seat) =>
  state.events.some(
    (e) => e.kind === "power" && e.target === seat && e.seat !== seat && state.elapsed - e.t < 4000,
  );

/** What this bot wants to buy right now, if anything. One decision per check. */
function choosePower(
  profile: BotProfile,
  state: MatchState,
  seat: Seat,
  random: Random,
): PowerUpKind | null {
  const me = state.seats[seat];
  const them = state.seats[otherSeat(seat)];
  const t = state.elapsed;
  const isBehind = controlOf(state, seat) < 50;
  const theyAreHalted = t < them.haltedUntil;
  const want = (power: PowerUpKind, chance: number) =>
    canBuy(me, power, t) && random() < chance ? power : null;

  switch (profile.strategy) {
    case "passive":
      return want("insider", 0.04);
    case "tipper":
      return (!me.hasTip && want("insider", 0.35)) || want("hedge", 0.05);
    case "hedger":
      return (!me.isHedged && want("hedge", 0.4)) || (isBehind ? want("squeeze", 0.35) : null);
    case "aggressor":
      return (!theyAreHalted && want("halt", 0.55)) || want("squeeze", 0.25);
    case "counter": {
      // Punish any attack at once.
      if (wasJustAttacked(state, seat)) return want("halt", 0.9) || want("squeeze", 0.9);
      // Keep a pill up once they can afford to attack; otherwise save for it.
      const hasPill = t < me.pillUntil;
      if (!hasPill && them.cash >= C.powerUps.squeeze.cost) return want("pill", 0.6);
      if (me.cash >= C.powerUps.pill.cost + C.powerUps.halt.cost) return want("halt", 0.3);
      return null;
    }
  }
}

/** The bot's answer: right or wrong by its accuracy for this topic, then a plausible response. */
function chooseAnswer(profile: BotProfile, state: MatchState, seat: Seat, random: Random): Intent {
  const me = state.seats[seat];
  const question = currentQuestion(state, seat);
  const skill = profile.topicSkill[question.topic] ?? 0;
  // A tip helps a bot the way it helps a person: fewer options, or a head start on the number.
  const tipBoost = me.hasTip ? 0.2 : 0;
  const isRight = random() < Math.min(0.98, profile.accuracy + skill + tipBoost);

  if (isNumericQuestion(question)) {
    if (isRight) return { type: "answer", response: { kind: "number", value: question.answer } };
    // Wrong by a believable margin — a slip, not noise — and always outside tolerance.
    const slip = (0.08 + random() * 0.25) * (random() < 0.5 ? -1 : 1);
    const value = Number(
      (question.answer * (1 + slip) + (question.answer === 0 ? 3 : 0)).toFixed(2),
    );
    return { type: "answer", response: { kind: "number", value } };
  }

  if (isRight) return { type: "answer", response: { kind: "choice", index: question.answerIndex } };
  const hidden = me.hasTip ? tipHiddenChoices(state.seed, me.index, question) : [];
  const wrong = [0, 1, 2, 3].filter((i) => i !== question.answerIndex && !hidden.includes(i));
  return {
    type: "answer",
    response: { kind: "choice", index: wrong[Math.floor(random() * wrong.length)] },
  };
}

export function createBotPlayer(
  profile: BotProfile,
  random: Random = Math.random,
): MatchPlayer<MatchState, Intent, Seat> {
  return {
    attach(seat, view, send) {
      let answerTimer: ReturnType<typeof setTimeout> | null = null;
      let plannedIndex = -1;
      let nextPowerCheck = 0;

      const clear = () => {
        if (answerTimer !== null) clearTimeout(answerTimer);
        answerTimer = null;
      };

      /** Think about the current question, then answer — after any halt has lifted. */
      const plan = (state: MatchState) => {
        clear();
        const me = state.seats[seat];
        plannedIndex = me.index;

        let thinkMs = between(random, profile.thinkMs) * C.botDifficultyFactor[me.difficulty];
        if (controlOf(state, otherSeat(seat)) < C.rubberBand.belowControl) {
          thinkMs *= C.rubberBand.slowdown;
        }
        const haltLeft = Math.max(0, me.haltedUntil - state.elapsed);

        // The indicator goes up once the bot is free to type.
        setTimeout(() => {
          const now = view.get();
          if (now.status === "live" && now.seats[seat].index === plannedIndex) {
            send({ type: "typing", isTyping: true });
          }
        }, haltLeft + 250);

        answerTimer = setTimeout(() => {
          const now = view.get();
          if (now.status !== "live" || now.seats[seat].index !== plannedIndex) return;
          // Halted after planning: wait it out, then think a little more.
          if (now.elapsed < now.seats[seat].haltedUntil) {
            plannedIndex = -1;
            return;
          }
          send(chooseAnswer(profile, now, seat, random));
        }, haltLeft + thinkMs);
      };

      const onChange = (state: MatchState) => {
        if (state.status !== "live") {
          clear();
          return;
        }
        const me = state.seats[seat];
        if (me.index !== plannedIndex && state.elapsed >= me.haltedUntil) plan(state);

        if (state.elapsed >= nextPowerCheck) {
          nextPowerCheck = state.elapsed + C.botPowerCheckMs;
          const power = choosePower(profile, state, seat, random);
          // Deferred: sending from inside a state notification would re-enter the match
          // before every listener had seen this state.
          if (power) queueMicrotask(() => send({ type: "power", power }));
        }
      };

      const unsubscribe = view.subscribe(onChange);
      return () => {
        clear();
        unsubscribe();
      };
    },
  };
}
