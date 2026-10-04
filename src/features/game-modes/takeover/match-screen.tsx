"use client";

import { useEffect, useMemo, useState } from "react";

import { FunctionKeyBar } from "@/components/game/function-key-bar";
import { TerminalPanel } from "@/components/game/terminal-panel";
import { createMatchController } from "@/lib/engine/versus/match-controller";
import { createLocalPlayer } from "@/lib/engine/versus/player";
import { isSoundOn, playAlarm, playFill, playMiss, playPowerUp, setSoundOn } from "@/lib/sound";

import { createBotPlayer } from "./bot-player";
import type { BotProfile } from "./bots";
import { TAKEOVER as C, POWER_UP_ORDER, type PowerUpKind } from "./config";
import { ControlBar } from "./control-bar";
import { ControlChart } from "./control-chart";
import { FaceOffStrip } from "./face-off-strip";
import { MatchNews } from "./match-news";
import { createMatch, matchReducer } from "./match/reducer";
import type { AnswerResponse, Intent, MatchState, Seat } from "./match/types";
import { QuestionConsole } from "./question-console";
import { SeatPanel } from "./seat-panel";
import { TradingPit } from "./trading-pit";

type MatchScreenProps = {
  bot: BotProfile;
  seed: number;
  ticker: string;
  onFinish: (state: MatchState) => void;
  onQuit: () => void;
};

/** The player always sits in p1; the opponent — bot today, human later — in p2. */
const YOU: Seat = "p1";
const THEM: Seat = "p2";

/** Power-up keys, from the config: q → insider, w → hedge, … */
const KEY_TO_POWER = Object.fromEntries(
  POWER_UP_ORDER.map((power) => [C.powerUps[power].key, power]),
) as Record<string, PowerUpKind>;

export function MatchScreen({ bot, seed, ticker, onFinish, onQuit }: MatchScreenProps) {
  // One match per mount. The opponent is just a MatchPlayer: swap createBotPlayer for a
  // network player and nothing below changes.
  const [match] = useState(() => {
    const local = createLocalPlayer<MatchState, Intent, Seat>();
    const controller = createMatchController({
      initial: createMatch(seed),
      reducer: matchReducer,
      toAction: (intent: Intent, seat: Seat, at: number) => ({ ...intent, seat, at }),
      start: (at: number) => ({ type: "start" as const, at }),
      tick: (at: number) => ({ type: "tick" as const, at }),
      isOver: (state: MatchState) => state.status === "over",
      tickMs: C.tickMs,
      players: { [YOU]: local.player, [THEM]: createBotPlayer(bot) } as Record<
        Seat,
        typeof local.player
      >,
    });
    return { controller, send: local.send };
  });
  const { controller, send } = match;
  const view = controller.view;
  const names = useMemo(() => ({ p1: ticker, p2: bot.ticker }), [ticker, bot.ticker]);

  // Run the match; settle the clock the moment a hidden tab comes back.
  useEffect(() => {
    controller.start();
    const onVisibility = () => {
      if (document.visibilityState === "visible") controller.catchUp();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      controller.dispose();
    };
  }, [controller]);

  // Sounds and the end of the match, from the event log.
  useEffect(() => {
    let seen = view.get().events.length;
    let isFinished = false;
    return view.subscribe((state) => {
      for (const event of state.events.slice(seen)) {
        if (event.kind === "answer" && event.seat === YOU) {
          if (event.isCorrect) playFill();
          else playMiss();
        }
        if (event.kind === "power") {
          if (event.target === YOU && (event.seat === THEM || event.isBounced)) playAlarm();
          else if (event.seat === YOU) playPowerUp();
        }
      }
      seen = state.events.length;
      if (state.status === "over" && !isFinished) {
        isFinished = true;
        onFinish(state);
      }
    });
  }, [view, onFinish]);

  // Keys. Q–T fire power-ups even while typing a math answer: answers are numbers, so those
  // letters are never input — they're stopped before they reach the field. M mutes the same
  // way; Esc quits.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const power = KEY_TO_POWER[key];
      if (power) {
        event.preventDefault();
        if (!event.repeat) send({ type: "power", power });
        return;
      }
      if (key === "m") {
        event.preventDefault();
        setSoundOn(!isSoundOn());
        return;
      }
      if (event.key === "Escape") onQuit();
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [send, onQuit]);

  const onAnswer = (response: AnswerResponse) => send({ type: "answer", response });
  const onPower = (power: PowerUpKind) => send({ type: "power", power });

  return (
    // Full height minus the page padding around it (sm:p-2 → 1rem), so nothing spills.
    <div className="flex flex-col gap-1 xl:h-[calc(100dvh-1rem)]">
      <FaceOffStrip view={view} you={ticker} rival={bot.ticker} />

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1 xl:grid-cols-[230px_minmax(0,1fr)_230px]">
        <div className="col-span-2 flex min-h-0 flex-col gap-1 xl:order-2 xl:col-span-1">
          <TerminalPanel
            number={1}
            title={`Control · ${ticker} vs ${bot.ticker}`}
            aside={
              <span className="font-mono text-[10px]">
                <span className="text-terminal-amber">■ {ticker}</span>{" "}
                <span className="text-rival">■ {bot.ticker}</span>
              </span>
            }
            className="h-[280px] xl:h-auto xl:flex-1"
          >
            <div className="absolute inset-0 p-1">
              <ControlChart view={view} className="block h-full w-full" />
            </div>
          </TerminalPanel>
          <ControlBar view={view} you={ticker} rival={bot.ticker} />
        </div>
        <div className="xl:order-1">
          <SeatPanel view={view} seat={YOU} number={2} name={ticker} side="you" />
        </div>
        <div className="xl:order-3">
          <SeatPanel view={view} seat={THEM} number={3} name={bot.ticker} side="rival" showTyping />
        </div>
      </div>

      <div className="grid gap-1 xl:grid-cols-[minmax(0,1fr)_400px]">
        <QuestionConsole view={view} seat={YOU} ticker={ticker} onAnswer={onAnswer} />
        {/* The wire fills whatever height the console gives the row — it never sets it,
            or a long feed would push the Trading Pit off screen. */}
        <div className="relative h-44 xl:h-auto">
          <div className="absolute inset-0 flex flex-col">
            <MatchNews view={view} names={names} bot={bot} botSeat={THEM} />
          </div>
        </div>
      </div>

      <TradingPit view={view} seat={YOU} onUse={onPower} />

      <FunctionKeyBar
        keys={[
          { key: "1–4", label: "ANSWER" },
          { key: "ENTER", label: "<GO>" },
          { key: "Q–T", label: "TRADING PIT" },
          { key: "M", label: "MUTE" },
          { key: "ESC", label: "QUIT" },
        ]}
      />
    </div>
  );
}
