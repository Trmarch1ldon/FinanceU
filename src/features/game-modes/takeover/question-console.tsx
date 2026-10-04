"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimate } from "motion/react";

import { NumericAnswer } from "@/components/game/numeric-answer";
import { TerminalPanel } from "@/components/game/terminal-panel";
import { isNumericQuestion } from "@/lib/engine/check-answer";
import type { MatchView } from "@/lib/engine/versus/player";
import { useMatchValue } from "@/lib/engine/versus/use-match-value";
import { cn } from "@/lib/utils";
import type { PlayableQuestion } from "@/types/question";

import { questionAt, tipFirstDigit, tipHiddenChoices } from "./match/questions";
import type { AnswerResponse, MatchState, Seat } from "./match/types";

type QuestionConsoleProps = {
  view: MatchView<MatchState>;
  seat: Seat;
  ticker: string;
  onAnswer: (response: AnswerResponse) => void;
};

type Submitted = { question: PlayableQuestion; given: string };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const answerText = (question: PlayableQuestion) =>
  isNumericQuestion(question)
    ? question.answer.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : question.choices[question.answerIndex];

/** Was this seat's latest answer right? From the event log, so it's the engine's verdict. */
function lastVerdict(state: MatchState, seat: Seat) {
  for (let i = state.events.length - 1; i >= 0; i--) {
    const e = state.events[i];
    if (e.kind === "answer" && e.seat === seat) return e.isCorrect ? "right" : "wrong";
  }
  return "none";
}

export function QuestionConsole({ view, seat, ticker, onAnswer }: QuestionConsoleProps) {
  const seed = useMatchValue(view, (s) => s.seed);
  const index = useMatchValue(view, (s) => s.seats[seat].index);
  const difficulty = useMatchValue(view, (s) => s.seats[seat].difficulty);
  const hasTip = useMatchValue(view, (s) => s.seats[seat].hasTip);
  const answered = useMatchValue(view, (s) => s.seats[seat].answered);
  const verdict = useMatchValue(view, (s) => lastVerdict(s, seat));
  // Whole seconds of halt left: re-renders once a second while halted, never otherwise.
  const haltLeft = useMatchValue(view, (s) =>
    Math.max(0, Math.ceil((s.seats[seat].haltedUntil - s.elapsed) / 1000)),
  );
  const isOver = useMatchValue(view, (s) => s.status !== "live");

  const question = useMemo(() => questionAt(seed, index, difficulty), [seed, index, difficulty]);
  const hidden = useMemo(
    () => (hasTip ? tipHiddenChoices(seed, index, question) : []),
    [hasTip, seed, index, question],
  );
  const isNumeric = isNumericQuestion(question);
  const isFrozen = haltLeft > 0 || isOver;

  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const flashRef = useRef<HTMLDivElement>(null);

  const choose = (choiceIndex: number) => {
    if (isFrozen || isNumeric || hidden.includes(choiceIndex)) return;
    setSubmitted({ question, given: question.choices[choiceIndex] });
    onAnswer({ kind: "choice", index: choiceIndex });
  };

  // Flash green / red, shake on a miss — once per answer.
  useEffect(() => {
    if (answered === 0 || verdict === "none" || !flashRef.current || !scope.current) return;
    const flash = flashRef.current;
    flash.dataset.result = verdict;
    animate(flash, { opacity: [0.9, 0] }, { duration: 0.4, ease: "easeOut" });
    if (verdict === "wrong" && !prefersReducedMotion()) {
      animate(scope.current, { x: [0, -8, 8, -5, 5, -2, 0] }, { duration: 0.32 });
    }
    // verdict always changes with answered; the count is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  // 1–4 for multiple choice. Numeric questions don't bind them: there they're digits.
  useEffect(() => {
    if (isNumeric) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const choice = ["1", "2", "3", "4"].indexOf(event.key);
      if (choice === -1) return;
      event.preventDefault();
      choose(choice);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const tipDigit = hasTip ? tipFirstDigit(question) : null;

  return (
    <div ref={scope} className="min-h-0">
      <TerminalPanel number={5} title="Command" bodyClassName="overflow-hidden">
        <div
          ref={flashRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 data-[result=right]:bg-up-dim data-[result=wrong]:bg-down-dim"
        />

        <div className="relative space-y-2.5 px-3 py-2.5" aria-live="polite">
          <p className="flex items-baseline gap-3">
            <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">
              Q{index + 1} · {isNumeric ? "QUICK MATH" : "CONCEPT"} ·{" "}
              <span className="text-terminal-amber">{"●".repeat(difficulty)}</span>
              <span className="text-locked">{"●".repeat(3 - difficulty)}</span>
            </span>
            <span className="text-[16px] leading-snug text-fg">{question.prompt}</span>
          </p>

          {isNumeric ? (
            <div className="flex flex-wrap items-center gap-x-4">
              <NumericAnswer
                key={index}
                prompt={ticker}
                unit={question.unit}
                isFrozen={isFrozen}
                onSubmit={(value, raw) => {
                  setSubmitted({ question, given: raw });
                  onAnswer({ kind: "number", value });
                }}
              />
              {tipDigit && (
                <span className="font-mono text-[11px] text-up">
                  INSIDER TIP: STARTS WITH {tipDigit}
                </span>
              )}
            </div>
          ) : (
            <ol className="grid gap-1 font-mono text-[13px] sm:grid-cols-2">
              {question.choices.map((choice, choiceIndex) => {
                const isStruck = hidden.includes(choiceIndex);
                return (
                  <li key={choiceIndex}>
                    <button
                      type="button"
                      disabled={isStruck}
                      onClick={() => choose(choiceIndex)}
                      className={cn(
                        "flex w-full items-baseline gap-2 border border-border px-2 py-1.5 text-left transition-colors",
                        isStruck
                          ? "cursor-not-allowed text-locked-fg line-through opacity-50"
                          : "text-fg hover:border-terminal-amber hover:bg-panel",
                      )}
                    >
                      <span className="text-terminal-amber">{choiceIndex + 1})</span>
                      <span className="font-sans">{choice}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}

          <p className="min-h-[1rem] font-mono text-[11px] text-muted tabular-nums">
            {submitted &&
              verdict !== "none" &&
              (verdict === "right" ? (
                <span className="text-up">
                  <span aria-hidden>▲ </span>FILLED — {answerText(submitted.question)}
                </span>
              ) : (
                <>
                  <span className="text-down">
                    <span aria-hidden>▼ </span>REJECTED — YOU SAID {submitted.given}
                  </span>
                  {" · ANSWER "}
                  <span className="text-fg">{answerText(submitted.question)}</span>
                </>
              ))}
          </p>
        </div>

        {/* An incoming Trading Halt stamps the console for as long as it lasts. */}
        {haltLeft > 0 && (
          <div
            role="alert"
            className="absolute inset-0 grid place-items-center bg-bg/70 backdrop-blur-[1px]"
          >
            <span className="-rotate-3 border-2 border-down px-5 py-2 font-mono text-[22px] font-medium tracking-[0.2em] text-down">
              TRADING HALT {haltLeft}s
            </span>
          </div>
        )}
      </TerminalPanel>
    </div>
  );
}
