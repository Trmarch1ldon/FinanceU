/**
 * Fake wire headlines, written in reaction to play. No real companies, outlets or people —
 * {T} is the player's own ticker. Each situation rotates through its list so a run rarely
 * repeats itself.
 */
type Fill = { T: string; x?: string; n?: number; p?: string };

const CORRECT = [
  "{T} BEATS ESTIMATES, SHARES JUMP {x}%",
  "{T} SURGES {x}% ON STRONG GUIDANCE",
  "BUYERS STEP IN AS {T} CLIMBS {x}%",
  "{T} TOPS REVENUE FORECASTS; STOCK UP {x}%",
  "DESK NOTE: {T} BID ACROSS THE BOARD, +{x}%",
  "{T} RAISES OUTLOOK, SHARES ADVANCE {x}%",
  "SHORTS SQUEEZED AS {T} RISES {x}%",
  "{T} GAINS {x}% AFTER MARGIN EXPANSION",
  "INSTITUTIONS ADD TO {T}; SHARES +{x}%",
  "{T} TRADES HIGHER ON UPGRADE CHATTER, +{x}%",
];

const WRONG = [
  "ANALYSTS DOWNGRADE {T} AFTER MISS",
  "{T} SLIDES {x}% ON WEAK QUARTER",
  "{T} MISSES CONSENSUS; SELLERS IN CONTROL",
  "{T} CUTS GUIDANCE, SHARES GAP DOWN {x}%",
  "DESK NOTE: HEAVY OFFERS IN {T}, −{x}%",
  "{T} FALLS {x}% AS MARGINS COMPRESS",
  "CREDIT CONCERNS WEIGH ON {T}",
  "{T} DROPS {x}% AFTER ACCOUNTING QUESTIONS",
  "FUNDS TRIM {T} POSITIONS; STOCK −{x}%",
  "{T} UNDER PRESSURE AFTER SURPRISE LOSS",
];

const BULL = [
  "{T} RALLY CONTINUES, {n} STRAIGHT GAINS",
  "{T} EXTENDS WIN STREAK TO {n}",
  "MOMENTUM BUYERS PILE INTO {T} — {n} IN A ROW",
  "{T} ON A TEAR: {n} CONSECUTIVE BEATS",
  "{n} FOR {n}: {T} CAN'T MISS",
  "{T} BULL RUN HITS {n} STRAIGHT",
  "TRADERS CHASE {T} AFTER {n}-ANSWER STREAK",
  "{T} SETS UP FOR BREAKOUT, {n} GAINS RUNNING",
  "NO SELLERS IN SIGHT: {T} UP {n} STRAIGHT",
  "{T} STREAK REACHES {n}; DESK UPGRADES TO BUY",
];

const DANGER = [
  "{T} NEARS MARGIN CALL, INVESTORS FLEE",
  "{T} SINKS BELOW {p}; LENDERS ON ALERT",
  "MARGIN DESK WATCHING {T} CLOSELY",
  "{T} AT RISK OF DELISTING",
  "LIQUIDITY DRIES UP IN {T}",
  "{T} HITS NEW LOW AS HOLDERS CAPITULATE",
  "BROKERS RAISE MARGIN ON {T}",
  "{T} FREEFALL: CAN IT HOLD {p}?",
  "RISK OFF: {T} DUMPED BELOW {p}",
  "{T} TRADING HALT RUMOURS SWIRL",
];

const OPEN = "{T} OPENS FOR TRADING AT {p}";

const LISTS = { correct: CORRECT, wrong: WRONG, bull: BULL, danger: DANGER } as const;
export type HeadlineKind = keyof typeof LISTS;

function fill(template: string, values: Fill) {
  return template
    .replaceAll("{T}", values.T)
    .replaceAll("{x}", values.x ?? "")
    .replaceAll("{n}", String(values.n ?? ""))
    .replaceAll("{p}", values.p ?? "");
}

/** Rotates through each list from a random starting point. */
export function createHeadlineWriter() {
  const cursor: Record<HeadlineKind, number> = {
    correct: Math.floor(Math.random() * CORRECT.length),
    wrong: Math.floor(Math.random() * WRONG.length),
    bull: Math.floor(Math.random() * BULL.length),
    danger: Math.floor(Math.random() * DANGER.length),
  };

  return {
    write(kind: HeadlineKind, values: Fill) {
      const list = LISTS[kind];
      const template = list[cursor[kind] % list.length];
      cursor[kind] += 1;
      return fill(template, values);
    },
    open: (values: Fill) => fill(OPEN, values),
  };
}
