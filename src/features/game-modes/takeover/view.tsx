"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { Countdown } from "@/components/game/countdown";
import { mockUser } from "@/data/mock/user";
import { rankProgress } from "@/data/ranks";
import { playMarginCall, playVictory, unlockAudio } from "@/lib/sound";
import { tickerFor } from "@/lib/ticker";
import type { MatchResult, MatchSide } from "@/types/match-result";

import { BOTS, type BotProfile } from "./bots";
import { TAKEOVER as C } from "./config";
import { MatchOver } from "./match-over";
import { MatchScreen } from "./match-screen";
import type { MatchState, Seat } from "./match/types";
import { OpponentSelect } from "./opponent-select";
import { recordWin, saveMatch } from "./progress";
import { useUnlocked } from "./use-unlocked";
import { VersusIntro } from "./versus-intro";

type Phase =
  | { name: "select" }
  | { name: "intro"; bot: BotProfile }
  | { name: "countdown"; bot: BotProfile }
  | { name: "match"; bot: BotProfile; seed: number; final: MatchState | null }
  | { name: "over"; bot: BotProfile; state: MatchState };

/** How long the final stamp holds the board before the results replace it. */
const FINAL_STAMP_MS = 1600;

function side(state: MatchState, seat: Seat, info: Omit<MatchSide, keyof SideStats>): MatchSide {
  const s = state.seats[seat];
  return {
    ...info,
    finalControl: Number((seat === "p1" ? state.control : 100 - state.control).toFixed(1)),
    answered: s.answered,
    correct: s.correct,
    accuracy: s.answered ? Number(((s.correct / s.answered) * 100).toFixed(1)) : 0,
    cashEarned: s.cashEarned,
    powerUpsUsed: s.powerUpsUsed,
    biggestSwing: Number(s.biggestSwing.toFixed(1)),
    bestStreak: s.bestStreak,
  };
}
type SideStats = Omit<MatchSide, "kind" | "id" | "name" | "ticker">;

export function TakeoverView() {
  const router = useRouter();
  const unlocked = useUnlocked();
  // MOCK user until the progress store (F6) knows who's playing.
  const ticker = tickerFor(mockUser.handle);
  const rank = rankProgress(mockUser.xp).rank.name;
  const [phase, setPhase] = useState<Phase>({ name: "select" });

  const begin = (bot: BotProfile) => {
    // Inside the click/Enter, so the browser allows every later sound.
    unlockAudio();
    setPhase({ name: "countdown", bot });
  };

  const onFinish = useCallback(
    (state: MatchState) => {
      if (phase.name !== "match") return;
      const { bot } = phase;
      const didWin = state.winner === "p1";
      if (didWin) {
        playVictory();
        recordWin(BOTS.findIndex((b) => b.id === bot.id));
      } else {
        playMarginCall();
      }

      const result: MatchResult = {
        mode: "takeover",
        seed: state.seed,
        players: [
          side(state, "p1", { kind: "human", id: mockUser.handle, name: mockUser.name, ticker }),
          side(state, "p2", { kind: "bot", id: bot.id, name: bot.name, ticker: bot.ticker }),
        ],
        winner: didWin ? 0 : 1,
        reason: state.reason ?? "bell",
        durationMs: Math.round(state.elapsed),
        date: new Date().toISOString(),
      };
      saveMatch(result);

      setPhase({ ...phase, final: state });
      setTimeout(() => setPhase({ name: "over", bot, state }), FINAL_STAMP_MS);
    },
    [phase, ticker],
  );

  const onQuit = useCallback(() => router.push("/"), [router]);

  const botIndex = phase.name === "select" ? -1 : BOTS.findIndex((b) => b.id === phase.bot.id);
  const nextBot = BOTS[botIndex + 1];

  return (
    <div className="mx-auto max-w-[1600px] p-1 sm:p-2">
      {phase.name === "select" && (
        <div className="p-2 lg:p-4">
          <OpponentSelect unlocked={unlocked} onPick={(bot) => setPhase({ name: "intro", bot })} />
        </div>
      )}

      {phase.name === "intro" && (
        <div className="p-2 lg:p-4">
          <VersusIntro
            ticker={ticker}
            rank={rank}
            bot={phase.bot}
            onGo={() => begin(phase.bot)}
            onBack={() => setPhase({ name: "select" })}
          />
        </div>
      )}

      {phase.name === "countdown" && (
        <div className="p-2 lg:p-4">
          <Countdown
            seconds={C.countdownSec}
            label={`${ticker} vs ${phase.bot.ticker} · OPENING BELL IN`}
            onDone={() =>
              setPhase({
                name: "match",
                bot: phase.bot,
                // Shared by both seats: the whole question sequence comes from this.
                seed: Math.floor(Math.random() * 2 ** 31),
                final: null,
              })
            }
          />
        </div>
      )}

      {phase.name === "match" && (
        <>
          <MatchScreen
            key={phase.seed}
            bot={phase.bot}
            seed={phase.seed}
            ticker={ticker}
            onFinish={onFinish}
            onQuit={onQuit}
          />
          {phase.final && (
            <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
              <motion.p
                initial={{ opacity: 0, scale: 2, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ type: "spring", bounce: 0, visualDuration: 0.25 }}
                className={`border-4 bg-bg/85 px-8 py-4 font-mono text-[36px] font-medium tracking-[0.16em] sm:text-[52px] ${
                  phase.final.winner === "p1" ? "border-up text-up" : "border-down text-down"
                }`}
              >
                {phase.final.winner === "p1" ? "TAKEOVER COMPLETE" : "ACQUIRED"}
              </motion.p>
            </div>
          )}
        </>
      )}

      {phase.name === "over" && (
        <MatchOver
          state={phase.state}
          ticker={ticker}
          bot={phase.bot}
          hasNextOpponent={Boolean(nextBot) && botIndex + 1 < unlocked}
          onRematch={() => begin(phase.bot)}
          onNext={() => nextBot && setPhase({ name: "intro", bot: nextBot })}
          onExit={onQuit}
        />
      )}
    </div>
  );
}
