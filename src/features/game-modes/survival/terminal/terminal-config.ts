/**
 * Visual tuning for the terminal screen. Game balance lives in ../config.ts and is not touched
 * by anything here — these numbers only change what the player sees.
 */
export const TERMINAL = {
  /** One candle per this many ms of price samples. */
  candleMs: 2000,
  /** Candles shown on the live chart (45 × 2s = the last 90 seconds). */
  liveCandles: 45,
  maShort: 5,
  maLong: 20,

  /** Momentum (0–100): where it starts, what each answer does, how fast it drifts back. */
  momentum: {
    start: 50,
    correct: 8,
    /** Extra per answer in the current streak, capped — streaks build conviction. */
    perStreak: 1.5,
    maxStreakBonus: 15,
    wrong: 22,
    /** Pull back toward 50 per candle (0–1). */
    reversion: 0.04,
  },

  /** Rating bands by momentum. */
  ratings: [
    { below: 20, label: "STRONG SELL", tone: "down" },
    { below: 40, label: "SELL", tone: "down" },
    { below: 60, label: "HOLD", tone: "muted" },
    { below: 80, label: "BUY", tone: "up" },
    { below: Infinity, label: "STRONG BUY", tone: "up" },
  ],

  /** LIMIT DOWN when price falls this fraction from its high within the window. */
  limitDownDrop: 0.12,
  limitDownWindowMs: 3000,
  limitDownShowMs: 1500,

  /** How often the price cells repaint (and flash). Faster is noise, not information. */
  quoteRefreshMs: 250,

  /** Order book. */
  bookLevels: 5,
  bookFlickerMs: 150,
  bookBigSizeMs: 1500,

  /** Feed lengths. */
  newsMax: 30,
  tapeMax: 40,

  /** Delay between the TRADING HALTED stamp and the tear sheet. */
  haltStampMs: 1300,
} as const;

export type RatingTone = (typeof TERMINAL.ratings)[number]["tone"];
