"use client";

import { useEffect, useRef } from "react";
import { useAnimate } from "motion/react";

import type { LiveState } from "@/features/game-modes/types";
import { isNumericQuestion } from "@/lib/engine/check-answer";
import type { PlayableQuestion } from "@/types/question";

import { NumericAnswer } from "../numeric-answer";
import { RatingBadge } from "./rating-badge";
import { TerminalPanel } from "./terminal-panel";
import { VolatilityGauge } from "./volatility-gauge";

export type LastResult = {
  question: PlayableQuestion;
  isCorrect: boolean;
  /** What the player gave, as shown. */
  given: string;
};

type CommandPanelProps = {
  ticker: string;
  live: LiveState;
  question: PlayableQuestion;
  /** Changes once per question; resets the input. */
  questionKey: number;
  /** Bumps once per answer; drives the flash. */
  answeredCount: number;
  lastResult: LastResult | null;
  onChoice: (choiceIndex: number) => void;
  onNumber: (value: number, raw: string) => void;
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const answerText = (question: PlayableQuestion) =>
  isNumericQuestion(question)
    ? question.answer.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : question.choices[question.answerIndex];

/**
 * The question as a terminal command panel. Type a number + Enter, or press 1–4. Flashes green
 * or red on each answer and shakes on a miss; the result line keeps the previous answer
 * readable, since the next question has already replaced it.
 */
export function CommandPanel({
  ticker,
  live,
  question,
  questionKey,
  answeredCount,
  lastResult,
  onChoice,
  onNumber,
}: CommandPanelProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const flashRef = useRef<HTMLDivElement>(null);
  const isNumeric = isNumericQuestion(question);

  useEffect(() => {
    if (answeredCount === 0 || !lastResult || !flashRef.current || !scope.current) return;
    const flash = flashRef.current;
    flash.dataset.result = lastResult.isCorrect ? "correct" : "wrong";
    animate(flash, { opacity: [0.9, 0] }, { duration: 0.4, ease: "easeOut" });
    if (!lastResult.isCorrect && !prefersReducedMotion()) {
      animate(scope.current, { x: [0, -8, 8, -5, 5, -2, 0] }, { duration: 0.32 });
    }
    // lastResult always changes with answeredCount; the count is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredCount]);

  // 1–4 picks a choice. Not bound for numeric questions, where digits are typing.
  useEffect(() => {
    if (isNumeric) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // Help is open: keys are for reading it, not for answering behind it.
      if (document.querySelector('[role="dialog"]')) return;
      const index = ["1", "2", "3", "4"].indexOf(event.key);
      if (index === -1) return;
      event.preventDefault();
      onChoice(index);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isNumeric, onChoice]);

  return (
    <div ref={scope}>
      <TerminalPanel
        number={5}
        title="Command"
        aside={
          <>
            <RatingBadge live={live} />
            <VolatilityGauge live={live} />
          </>
        }
        bodyClassName="overflow-hidden"
      >
        <div
          ref={flashRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 data-[result=correct]:bg-up-dim data-[result=wrong]:bg-down-dim"
        />

        <div className="relative space-y-2.5 px-3 py-2.5" aria-live="polite">
          <p className="flex items-baseline gap-3">
            <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">
              Q{questionKey + 1} · {isNumeric ? "QUICK MATH" : "CONCEPT"} ·{" "}
              <span className="text-terminal-amber">{"●".repeat(question.difficulty)}</span>
              <span className="text-locked">{"●".repeat(3 - question.difficulty)}</span>
            </span>
            <span className="text-[16px] leading-snug text-fg">{question.prompt}</span>
          </p>

          {isNumeric ? (
            <NumericAnswer
              key={questionKey}
              ticker={ticker}
              unit={question.unit}
              onSubmit={onNumber}
            />
          ) : (
            <ol className="grid gap-1 font-mono text-[13px] sm:grid-cols-2">
              {question.choices.map((choice, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => onChoice(index)}
                    className="flex w-full items-baseline gap-2 border border-border px-2 py-1.5 text-left text-fg transition-colors hover:border-terminal-amber hover:bg-panel"
                  >
                    <span className="text-terminal-amber">{index + 1})</span>
                    <span className="font-sans">{choice}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}

          <p className="min-h-[1rem] font-mono text-[11px] text-muted tabular-nums">
            {lastResult &&
              (lastResult.isCorrect ? (
                <span className="text-up">
                  <span aria-hidden>▲ </span>FILLED — {answerText(lastResult.question)}
                </span>
              ) : (
                <>
                  <span className="text-down">
                    <span aria-hidden>▼ </span>REJECTED — YOU SAID {lastResult.given}
                  </span>
                  {" · ANSWER "}
                  <span className="text-fg">{answerText(lastResult.question)}</span>
                </>
              ))}
          </p>
        </div>
      </TerminalPanel>
    </div>
  );
}
