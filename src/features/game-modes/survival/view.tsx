"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Countdown } from "@/components/game/countdown";
import { FunctionKeyBar } from "@/components/game/function-key-bar";
import { TerminalPanel } from "@/components/game/terminal-panel";
import { mockUser } from "@/data/mock/user";
import type { GameModeProps } from "@/features/game-modes/types";
import {
  isSoundOn,
  playBullRun,
  playFill,
  playMarginCall,
  playMiss,
  setSoundOn,
  unlockAudio,
} from "@/lib/sound";
import { tickerFor } from "@/lib/ticker";
import { cn } from "@/lib/utils";
import type { PlayableQuestion } from "@/types/question";

import { MARGIN_CALL as C } from "./config";
import { isBullRun, readMarket } from "./market";
import { saveRun } from "./results";
import { StartScreen } from "./start-screen";
import { CandleChart } from "./terminal/candle-chart";
import { CommandPanel } from "./terminal/command-panel";
import { createFeed } from "./terminal/feed";
import { HelpOverlay } from "./terminal/help-overlay";
import { LimitDownWatch } from "./terminal/limit-down";
import { SidePanels } from "./terminal/side-panels";
import { StatusStrip } from "./terminal/status-strip";
import { TearSheet } from "./terminal/tear-sheet";
import { TERMINAL as T } from "./terminal/terminal-config";
import { TradingHalted } from "./terminal/trading-halted";
import { useBestScore } from "./use-best-score";

type Phase = "intro" | "countdown" | "run";

/** The question as answered and what was given — correctness comes from the engine. */
type Answered = { question: PlayableQuestion; given: string };

export function MarginCallView({ session }: GameModeProps) {
  const router = useRouter();
  // MOCK user until the progress store (F6) knows who's playing.
  const ticker = tickerFor(mockUser.handle);
  const bestScore = useBestScore();

  const [phase, setPhase] = useState<Phase>("intro");
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [runNumber, setRunNumber] = useState(0);
  const [sheetForRun, setSheetForRun] = useState(0);
  const [feed] = useState(createFeed);
  const rootRef = useRef<HTMLDivElement>(null);
  const savedRun = useRef(0);

  const { question, status, live, start } = session;
  const isPlaying = phase === "run" && status === "playing";
  const isOver = phase === "run" && status === "summary";
  // The stamp holds the screen for a beat before the tear sheet replaces the terminal.
  const isSheetShown = isOver && sheetForRun === runNumber;
  const isStampShown = isOver && !isSheetShown;

  const openMarket = useCallback(() => {
    setRunNumber((n) => n + 1);
    setAnswered(null);
    start();
    setPhase("run");
  }, [start]);

  // Help steals focus for its close button; hand it back to the prompt so typing resumes.
  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLInputElement>('input[aria-label="Your answer"]')?.focus(),
    );
  }, []);

  const toCountdown = () => {
    // Inside the click/Enter, so the browser lets every later sound play.
    unlockAudio();
    setPhase("countdown");
  };

  const onChoice = useCallback(
    (index: number) => {
      if (!question || !("choices" in question)) return;
      setAnswered({ question, given: question.choices[index] });
      session.answer(index);
    },
    [question, session],
  );

  const onNumber = useCallback(
    (value: number, raw: string) => {
      if (!question) return;
      setAnswered({ question, given: raw });
      session.answerNumber(value);
    },
    [question, session],
  );

  // Live feed → danger vignette and market events, without re-rendering anything here.
  useEffect(() => {
    const root = rootRef.current;
    let wasPlaying = false;
    let answeredSeen = 0;
    let lastPrice: number = C.startPrice;

    const update = () => {
      const state = live.get();
      const { price } = readMarket(state.modeState);
      const isLive = state.status === "playing";
      if (root) root.dataset.danger = String(isLive && price < C.dangerPrice);

      const now = Date.now();
      if (isLive && !wasPlaying) {
        answeredSeen = 0;
        lastPrice = price;
      }
      if (state.answeredCount > answeredSeen) {
        // combo only survives a correct answer, so it tells us which way this one went.
        feed.emit({
          kind: "answer",
          at: now,
          isCorrect: state.combo > 0,
          before: lastPrice,
          after: price,
          streak: state.combo,
        });
        answeredSeen = state.answeredCount;
      }
      if (isLive && lastPrice >= C.dangerPrice && price < C.dangerPrice) {
        feed.emit({ kind: "danger", at: now, price });
      }
      wasPlaying = isLive;
      lastPrice = price;
    };

    update();
    return live.subscribe(update);
  }, [live, feed]);

  // A sound per answer. Keyed on the count, so two misses in a row each get one.
  const { answeredCount, lastAnswer, combo } = session;
  useEffect(() => {
    if (answeredCount === 0 || !lastAnswer) return;
    if (!lastAnswer.correct) playMiss();
    else if (combo === C.bullRunStreak) playBullRun();
    else playFill();
    // lastAnswer and combo always change with the count; the count is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredCount]);

  // Save each finished run exactly once, then hold the stamp before the tear sheet.
  useEffect(() => {
    if (!isOver) return;
    if (savedRun.current !== runNumber) {
      savedRun.current = runNumber;
      playMarginCall();
      saveRun({
        mode: "survival",
        user: mockUser.handle,
        ticker,
        score: session.score,
        timeSurvivedSec: Math.floor(session.elapsedMs / 1000),
        athPrice: Number(readMarket(session.modeState).ath.toFixed(2)),
        answered: session.answeredCount,
        correct: session.correctCount,
        accuracy: session.answeredCount
          ? Number(((session.correctCount / session.answeredCount) * 100).toFixed(1))
          : 0,
        bestStreak: session.bestCombo,
        date: new Date().toISOString(),
      });
    }
    const timer = setTimeout(() => setSheetForRun(runNumber), T.haltStampMs);
    return () => clearTimeout(timer);
  }, [isOver, runNumber, session, ticker]);

  // Keys: F1 help, Esc closes help / quits / leaves, M mutes (not while typing).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F1") {
        event.preventDefault();
        if (isHelpOpen) closeHelp();
        else setIsHelpOpen(true);
        return;
      }
      if (event.key === "Escape") {
        if (isHelpOpen) closeHelp();
        // Quitting mid-run abandons it: nothing is saved.
        else if (isPlaying || isOver) router.push("/");
        return;
      }
      if (event.key.toLowerCase() === "m" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.target instanceof HTMLInputElement) return;
        setSoundOn(!isSoundOn());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isHelpOpen, isPlaying, isOver, router, closeHelp]);

  const lastResult = answered && lastAnswer ? { ...answered, isCorrect: lastAnswer.correct } : null;
  const isBull = isPlaying && isBullRun(combo);
  const isTerminalShown = (isPlaying || isStampShown) && question;

  return (
    <div
      ref={rootRef}
      className={cn(
        "mx-auto max-w-[1600px] p-1 sm:p-2",
        isTerminalShown && "flex flex-col gap-1 xl:h-dvh",
      )}
    >
      {phase === "intro" && (
        <div className="p-3 lg:p-5">
          <StartScreen ticker={ticker} bestScore={bestScore} onOpen={toCountdown} />
        </div>
      )}

      {phase === "countdown" && (
        <div className="p-3 lg:p-5">
          <Countdown onDone={openMarket} seconds={C.countdownSec} />
        </div>
      )}

      {isTerminalShown && (
        <>
          <StatusStrip ticker={ticker} live={live} />

          <div className="grid min-h-0 flex-1 gap-1 xl:grid-cols-[minmax(0,1fr)_360px]">
            <TerminalPanel
              number={1}
              title={`Price chart · ${ticker} · 2s candles`}
              aside={
                <span className="font-mono text-[10px] text-muted">
                  {isBull && (
                    <span className="mr-3 text-up">
                      <span aria-hidden>▲ </span>BULL RUN ×{C.bullRunMultiplier}
                    </span>
                  )}
                  <span className="text-muted/80">— MA{T.maShort}</span>{" "}
                  <span className="text-bar">— MA{T.maLong}</span>
                </span>
              }
              className={cn(
                "h-[380px] transition-[border-color,box-shadow] duration-300 xl:h-auto",
                isBull && "bull-glow border-up",
              )}
            >
              <div data-limit="false" className="absolute inset-0 p-1">
                <CandleChart live={live} span="live" className="block h-full w-full" />
                <LimitDownWatch live={live} />
              </div>
            </TerminalPanel>

            <SidePanels ticker={ticker} live={live} feed={feed} />
          </div>

          <CommandPanel
            ticker={ticker}
            live={live}
            question={question}
            questionKey={session.index}
            answeredCount={answeredCount}
            lastResult={lastResult}
            onChoice={onChoice}
            onNumber={onNumber}
          />

          <FunctionKeyBar
            keys={[
              { key: "F1", label: "HELP" },
              { key: "1–4", label: "ANSWER" },
              { key: "ENTER", label: "<GO>" },
              { key: "M", label: "MUTE" },
              { key: "ESC", label: "QUIT" },
            ]}
          />
        </>
      )}

      {isStampShown && <TradingHalted />}

      {isSheetShown && (
        <TearSheet
          ticker={ticker}
          live={live}
          score={session.score}
          elapsedMs={session.elapsedMs}
          answered={session.answeredCount}
          correct={session.correctCount}
          bestStreak={session.bestCombo}
          isNewBest={bestScore !== null && session.score >= bestScore}
          onPlayAgain={toCountdown}
          onExit={() => router.push("/")}
        />
      )}

      {isHelpOpen && <HelpOverlay onClose={closeHelp} />}

      {/* Below $20 the edges pulse red. Driven by data-danger, not React state. */}
      <div aria-hidden className="danger-vignette" />
    </div>
  );
}
