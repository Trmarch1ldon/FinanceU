/**
 * Margin Call — the Survival mode (task M3). Your share price is your health: it drains while
 * you think, correct answers spike it, wrong ones gap it down, and $0 is a margin call.
 * See DECISIONS.md, 2026-09-30.
 */
import { TrendingDown } from "lucide-react";

import { generateMentalMath } from "@/data/questions/mental-math-templates";
import { MOCK_CONCEPT_QUESTIONS } from "@/data/questions/mock-concepts";
import type { GameModeDefinition } from "@/features/game-modes/types";

import { MARGIN_CALL } from "./config";
import {
  applyAnswer,
  difficultyAt,
  initialMarket,
  isMarginCalled,
  marginCallScore,
  multipleChoiceShare,
  readMarket,
  tickMarket,
} from "./market";
import { MarginCallView } from "./view";

export const survivalMode: GameModeDefinition = {
  id: "survival",
  name: "Margin Call",
  tagline: "Your share price is your health. Answer fast or get margin called.",
  icon: TrendingDown,
  rules: {
    difficultyRamp: true,
    // The clock never stops: the next question lands the instant you answer.
    feedbackMs: 0,
    tickMs: MARGIN_CALL.sampleMs,
    // Ten ticks a second go to the chart and ticker directly, not through React.
    liveTicks: true,
  },
  // Score is time survived and peak price, settled once at the end — see finalScore.
  scoring: () => 0,
  initialModeState: initialMarket,
  tick: tickMarket,
  onAnswer: applyAnswer,
  isOver: isMarginCalled,
  difficultyAt,
  finalScore: (state) => marginCallScore(state.elapsedMs, readMarket(state.modeState).ath),
  questions: {
    pool: MOCK_CONCEPT_QUESTIONS,
    generate: (difficulty, random) => {
      const question = generateMentalMath(difficulty, random);
      const tolerance = Math.max(
        question.tolerance,
        Math.abs(question.answer) * MARGIN_CALL.relativeTolerance,
      );
      return { ...question, tolerance };
    },
    generatedShare: (state) => 1 - multipleChoiceShare(state.elapsedMs),
  },
  Component: MarginCallView,
};
