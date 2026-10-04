"use client";

import { useEffect, useRef } from "react";
import { useAnimate } from "motion/react";

import { isNumericQuestion } from "@/lib/engine/check-answer";
import type { PlayableQuestion } from "@/types/question";

import { NumericAnswer } from "./numeric-answer";

export type LastResult = {
  question: PlayableQuestion;
  correct: boolean;
  /** What the player gave, as shown. */
  given: string;
};

type QuestionPanelProps = {
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
 * The question, and the only thing on screen that takes input. Fully keyboard-driven: type a
 * number and press Enter, or press 1–4. The panel flashes green or red on each answer, and a
 * wrong one shakes it; the result line underneath keeps the previous answer readable, since the
 * next question has already replaced it.
 */
export function QuestionPanel({
  question,
  questionKey,
  answeredCount,
  lastResult,
  onChoice,
  onNumber,
}: QuestionPanelProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const flashRef = useRef<HTMLDivElement>(null);
  const isNumeric = isNumericQuestion(question);

  // Flash on every answer after the first render.
  useEffect(() => {
    if (answeredCount === 0 || !lastResult || !flashRef.current || !scope.current) return;
    const flash = flashRef.current;
    flash.dataset.result = lastResult.correct ? "correct" : "wrong";
    animate(flash, { opacity: [0.9, 0] }, { duration: 0.4, ease: "easeOut" });
    if (!lastResult.correct && !prefersReducedMotion()) {
      animate(scope.current, { x: [0, -8, 8, -5, 5, -2, 0] }, { duration: 0.32 });
    }
    // lastResult always changes with answeredCount; keying on the count alone is the intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredCount]);

  // 1–4 picks a choice. Ignored while a numeric input has focus, so typing "3" types.
  useEffect(() => {
    if (isNumeric) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const index = ["1", "2", "3", "4"].indexOf(event.key);
      if (index === -1) return;
      event.preventDefault();
      onChoice(index);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isNumeric, onChoice]);

  return (
    <section
      ref={scope}
      className="panel relative overflow-hidden"
      aria-label="Question"
      aria-live="polite"
    >
      <div
        ref={flashRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 data-[result=correct]:bg-up-dim data-[result=wrong]:bg-down-dim"
      />

      <header className="relative flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <h2 className="label">
          {isNumeric ? "Quick math" : "Concept"} · Q{questionKey + 1}
        </h2>
        <span className="font-mono text-[11px] text-muted tabular-nums">
          {"●".repeat(question.difficulty)}
          <span className="text-locked">{"●".repeat(3 - question.difficulty)}</span>
        </span>
      </header>

      <div className="relative space-y-4 p-4">
        <p className="text-[17px] leading-snug text-fg">{question.prompt}</p>

        {isNumeric ? (
          <NumericAnswer key={questionKey} unit={question.unit} onSubmit={onNumber} />
        ) : (
          <ol className="grid gap-2 sm:grid-cols-2">
            {question.choices.map((choice, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onChoice(index)}
                  className="flex w-full items-center gap-3 rounded-md border border-border bg-panel px-3 py-2.5 text-left text-[13px] text-fg transition-colors hover:border-border-strong hover:bg-panel-hover"
                >
                  <kbd className="grid size-5 shrink-0 place-items-center rounded-sm border border-border-strong font-mono text-[11px] text-muted">
                    {index + 1}
                  </kbd>
                  {choice}
                </button>
              </li>
            ))}
          </ol>
        )}

        <p className="min-h-[1.25rem] font-mono text-[11px] text-muted tabular-nums">
          {lastResult &&
            (lastResult.correct ? (
              <span className="text-up">
                <span aria-hidden>▲ </span>Correct — {answerText(lastResult.question)}
              </span>
            ) : (
              <>
                <span className="text-down">
                  <span aria-hidden>▼ </span>Wrong — you said {lastResult.given}
                </span>
                {" · answer "}
                <span className="text-fg">{answerText(lastResult.question)}</span>
              </>
            ))}
        </p>
      </div>
    </section>
  );
}
