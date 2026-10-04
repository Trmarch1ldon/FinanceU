/**
 * Quick-math questions generated from templates, for modes that type a number rather than pick
 * one (Survival, and Time Attack when it lands). Numbers are drawn fresh each time, so these
 * never run out and never need ids that persist — the multiple-choice mental-math bank (D4)
 * lives in `mental-math.ts`.
 *
 * Every template picks numbers that land on a clean answer at its difficulty, so the work is
 * finance arithmetic, not long division.
 */
import type { Difficulty, NumericQuestion } from "@/types/question";

type Random = () => number;

const pick = <T>(random: Random, items: readonly T[]) => items[Math.floor(random() * items.length)];
const between = (random: Random, min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));
const fmt = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });
const round = (value: number, decimals: number) => Number(value.toFixed(decimals));

type Draft = Omit<NumericQuestion, "kind" | "id" | "topic" | "difficulty">;
type Template = { name: string; build: (random: Random) => Draft };

const EASY: Template[] = [
  {
    name: "percent-of",
    build: (r) => {
      const pct = pick(r, [5, 10, 15, 20, 25, 30, 40, 50, 75]);
      const base = between(r, 2, 30) * 20;
      return {
        prompt: `${pct}% of ${fmt(base)}?`,
        answer: (pct / 100) * base,
        tolerance: 0,
        explanation: `${pct}% is ${pct / 100}, and ${pct / 100} × ${fmt(base)} = ${fmt((pct / 100) * base)}.`,
      };
    },
  },
  {
    name: "grow-by",
    build: (r) => {
      const pct = pick(r, [5, 10, 20, 25, 50]);
      const base = between(r, 2, 20) * 20;
      const answer = base * (1 + pct / 100);
      return {
        prompt: `Revenue of $${fmt(base)}M grows ${pct}%. New revenue ($M)?`,
        answer,
        tolerance: 0,
        unit: "$M",
        explanation: `${fmt(base)} × ${1 + pct / 100} = ${fmt(answer)}.`,
      };
    },
  },
  {
    name: "ev-from-multiple",
    build: (r) => {
      const ebitda = between(r, 2, 20) * 5;
      const multiple = between(r, 4, 12);
      return {
        prompt: `EBITDA $${ebitda}M at ${multiple}x. Enterprise value ($M)?`,
        answer: ebitda * multiple,
        tolerance: 0,
        unit: "$M",
        explanation: `EV = EBITDA × multiple = ${ebitda} × ${multiple} = ${fmt(ebitda * multiple)}.`,
      };
    },
  },
  {
    name: "pe",
    build: (r) => {
      const eps = pick(r, [1, 2, 2.5, 4, 5]);
      const pe = between(r, 6, 25);
      return {
        prompt: `Share price $${fmt(eps * pe)}, EPS $${fmt(eps)}. P/E?`,
        answer: pe,
        tolerance: 0,
        unit: "x",
        explanation: `P/E = price ÷ EPS = ${fmt(eps * pe)} ÷ ${fmt(eps)} = ${pe}x.`,
      };
    },
  },
];

const MEDIUM: Template[] = [
  {
    name: "growth-rate",
    build: (r) => {
      const base = between(r, 4, 20) * 20;
      const pct = pick(r, [5, 8, 12, 15, 20, 30, 35]);
      const after = round(base * (1 + pct / 100), 2);
      return {
        prompt: `Revenue goes from $${fmt(base)}M to $${fmt(after)}M. Growth (%)?`,
        answer: pct,
        tolerance: 0.1,
        unit: "%",
        explanation: `(${fmt(after)} − ${fmt(base)}) ÷ ${fmt(base)} = ${pct}%.`,
      };
    },
  },
  {
    name: "simple-interest",
    build: (r) => {
      const principal = between(r, 1, 20) * 1000;
      const rate = between(r, 2, 9);
      const years = between(r, 2, 5);
      const answer = principal * (rate / 100) * years;
      return {
        prompt: `$${fmt(principal)} at ${rate}% simple interest for ${years} years. Interest earned ($)?`,
        answer,
        tolerance: 0.5,
        unit: "$",
        explanation: `Simple interest = P × r × t = ${fmt(principal)} × ${rate / 100} × ${years} = ${fmt(answer)}.`,
      };
    },
  },
  {
    name: "ev-decimal-multiple",
    build: (r) => {
      const ebitda = between(r, 4, 30) * 4;
      const multiple = pick(r, [6.5, 7.5, 8.5, 9.5, 10.5, 12.5]);
      return {
        prompt: `EBITDA $${ebitda}M at ${multiple}x. Enterprise value ($M)?`,
        answer: ebitda * multiple,
        tolerance: 0.5,
        unit: "$M",
        explanation: `${ebitda} × ${multiple} = ${fmt(ebitda * multiple)}.`,
      };
    },
  },
  {
    name: "price-from-pe",
    build: (r) => {
      const eps = pick(r, [1.2, 1.6, 2.4, 3.2, 4.5]);
      const pe = pick(r, [10, 12, 15, 20, 25]);
      const answer = round(eps * pe, 2);
      return {
        prompt: `EPS $${fmt(eps)} and a ${pe}x P/E. Share price ($)?`,
        answer,
        tolerance: 0.05,
        unit: "$",
        explanation: `Price = EPS × P/E = ${fmt(eps)} × ${pe} = ${fmt(answer)}.`,
      };
    },
  },
  {
    name: "ebitda-margin",
    build: (r) => {
      const revenue = between(r, 2, 20) * 50;
      const margin = pick(r, [8, 12, 15, 20, 24, 30, 35]);
      return {
        prompt: `Revenue $${fmt(revenue)}M, EBITDA $${fmt((revenue * margin) / 100)}M. EBITDA margin (%)?`,
        answer: margin,
        tolerance: 0.1,
        unit: "%",
        explanation: `Margin = EBITDA ÷ revenue = ${fmt((revenue * margin) / 100)} ÷ ${fmt(revenue)} = ${margin}%.`,
      };
    },
  },
];

const HARD: Template[] = [
  {
    name: "compound-interest",
    build: (r) => {
      const principal = between(r, 1, 10) * 1000;
      const rate = pick(r, [5, 6, 8, 10, 12]);
      const years = between(r, 2, 4);
      const answer = round(principal * (1 + rate / 100) ** years, 2);
      return {
        prompt: `$${fmt(principal)} compounds at ${rate}% a year for ${years} years. Ending value ($)?`,
        answer,
        tolerance: 1,
        unit: "$",
        explanation: `${fmt(principal)} × ${1 + rate / 100}^${years} = ${fmt(answer)}.`,
      };
    },
  },
  {
    name: "ev-bridge",
    build: (r) => {
      const equity = between(r, 10, 80) * 10;
      const debt = between(r, 2, 40) * 10;
      const cash = between(r, 1, 15) * 10;
      const answer = equity + debt - cash;
      return {
        prompt: `Equity value $${equity}M, debt $${debt}M, cash $${cash}M. Enterprise value ($M)?`,
        answer,
        tolerance: 0,
        unit: "$M",
        explanation: `EV = equity + debt − cash = ${equity} + ${debt} − ${cash} = ${answer}.`,
      };
    },
  },
  {
    name: "implied-multiple",
    build: (r) => {
      const ebitda = between(r, 3, 25) * 5;
      const multiple = pick(r, [6, 7.5, 8, 9, 10, 11.5, 12, 14]);
      return {
        prompt: `EV $${fmt(ebitda * multiple)}M, EBITDA $${ebitda}M. EV/EBITDA (x)?`,
        answer: multiple,
        tolerance: 0.05,
        unit: "x",
        explanation: `${fmt(ebitda * multiple)} ÷ ${ebitda} = ${multiple}x.`,
      };
    },
  },
  {
    name: "rule-of-72",
    build: (r) => {
      const rate = pick(r, [3, 4, 6, 8, 9, 12, 18, 24]);
      return {
        prompt: `Rule of 72: at ${rate}% a year, roughly how many years to double?`,
        answer: 72 / rate,
        tolerance: 0.1,
        unit: "yrs",
        explanation: `72 ÷ ${rate} = ${fmt(72 / rate)} years.`,
      };
    },
  },
  {
    name: "cagr",
    build: (r) => {
      const start = between(r, 2, 10) * 50;
      const rate = pick(r, [10, 20, 25, 50]);
      const end = round(start * (1 + rate / 100) ** 2, 2);
      return {
        prompt: `$${fmt(start)}M grows to $${fmt(end)}M over 2 years. CAGR (%)?`,
        answer: rate,
        tolerance: 0.5,
        unit: "%",
        explanation: `√(${fmt(end)} ÷ ${fmt(start)}) − 1 = ${rate}%.`,
      };
    },
  },
];

const BY_DIFFICULTY: Record<Difficulty, Template[]> = { 1: EASY, 2: MEDIUM, 3: HARD };

/** A fresh quick-math question at `difficulty`. */
export function generateMentalMath(difficulty: Difficulty, random: Random): NumericQuestion {
  const template = pick(random, BY_DIFFICULTY[difficulty]);
  const draft = template.build(random);
  return {
    ...draft,
    answer: round(draft.answer, 2),
    kind: "numeric",
    id: `mental-math-gen-${template.name}-${Math.floor(random() * 1e9)}`,
    topic: "mental-math",
    difficulty,
  };
}
