"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { mockUser } from "@/data/mock/user";
import type { GameModeProps } from "@/features/game-modes/types";
import { cn } from "@/lib/utils";
import type { PlayableQuestion } from "@/types/question";

import { MARGIN_CALL as C } from "./config";
import { Countdown } from "./countdown";
import { GameOver } from "./game-over";
import { isBullRun, readMarket, tickerFor } from "./market";
import { PriceChart } from "./price-chart";
import { QuestionPanel } from "./question-panel";
import { saveRun } from "./results";
import { StartScreen } from "./start-screen";
import { TickerHeader } from "./ticker-header";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);
  const savedRunId = useRef(0);

  const { question, status, live, start } = session;
  const isPlaying = phase === "run" && status === "playing";
  const isOver = phase === "run" && status === "summary";

  const openMarket = useCallback(() => {
    runId.current += 1;
    setAnswered(null);
    start();
    setPhase("run");
  }, [start]);

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

  // Danger: written to a data attribute from the live feed, so the vignette can pulse without
  // re-rendering anything.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => {
      const state = live.get();
      const price = readMarket(state.modeState).price;
      root.dataset.danger = String(state.status === "playing" && price < C.dangerPrice);
    };
    update();
    return live.subscribe(update);
  }, [live]);

  // Save each finished run exactly once — the ids guard against effects re-running.
  useEffect(() => {
    if (!isOver || savedRunId.current === runId.current) return;
    savedRunId.current = runId.current;
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
  }, [isOver, session, ticker]);

  // Esc leaves from the game-over screen.
  useEffect(() => {
    if (!isOver) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOver, router]);

  const lastResult =
    answered && session.lastAnswer ? { ...answered, correct: session.lastAnswer.correct } : null;
  const isBull = isPlaying && isBullRun(session.combo);

  return (
    <div ref={rootRef} className="mx-auto max-w-[1400px] space-y-4 p-4 lg:p-6">
      {phase === "intro" && (
        <StartScreen ticker={ticker} bestScore={bestScore} onOpen={() => setPhase("countdown")} />
      )}

      {phase === "countdown" && <Countdown onDone={openMarket} />}

      {isPlaying && question && (
        <>
          <TickerHeader ticker={ticker} live={live} streak={session.combo} />

          <section
            className={cn(
              "panel overflow-hidden transition-[border-color,box-shadow] duration-300",
              isBull && "bull-glow border-up",
            )}
            aria-label="Price chart"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <h2 className="label">
                {ticker} · last {C.liveWindowSec}s
              </h2>
              {isBull && (
                <span className="font-mono text-[11px] tracking-wide text-up">
                  <span aria-hidden>▲ </span>BULL RUN · spikes ×{C.bullRunMultiplier}
                </span>
              )}
            </header>
            <div className="p-3">
              <PriceChart live={live} span="live" className="block h-[280px] w-full sm:h-[340px]" />
            </div>
          </section>

          <QuestionPanel
            question={question}
            questionKey={session.index}
            answeredCount={session.answeredCount}
            lastResult={lastResult}
            onChoice={onChoice}
            onNumber={onNumber}
          />
        </>
      )}

      {isOver && (
        <GameOver
          ticker={ticker}
          live={live}
          score={session.score}
          elapsedMs={session.elapsedMs}
          ath={readMarket(session.modeState).ath}
          answered={session.answeredCount}
          correct={session.correctCount}
          bestStreak={session.bestCombo}
          isNewBest={bestScore !== null && session.score >= bestScore}
          onPlayAgain={() => setPhase("countdown")}
          onExit={() => router.push("/")}
        />
      )}

      {/* Below $20 the edges pulse red. Driven by data-danger, not React state. */}
      <div aria-hidden className="danger-vignette" />
    </div>
  );
}
