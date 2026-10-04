/**
 * Every tuning number for Margin Call, in one place, so balancing is an edit here and nowhere
 * else. Money is in dollars, time in seconds unless the name says ms.
 */
export const MARGIN_CALL = {
  startPrice: 100,

  /** Drain per second at the opening bell… */
  baseDrainPerSec: 1.5,
  /** …growing by this much per second survived… */
  drainAccelPerSec: 0.025,
  /** …up to this. Without a cap a long run becomes unwinnable rather than hard. */
  maxDrainPerSec: 8,

  /** Random-walk noise, so the line reads as a stock and not a ruler. Std dev per tick ($). */
  noisePerTick: 0.45,
  /** How hard the noise is pulled back to zero each tick (0–1): keeps it wobble, not drift. */
  noiseReversion: 0.1,

  /** Correct answer: at least `baseSpike`, up to `fastSpike` when answered within `fastMs`,
   *  falling linearly to `baseSpike` by `slowMs`. */
  baseSpike: 8,
  fastSpike: 15,
  fastMs: 3000,
  slowMs: 10000,

  /** Wrong answer: instant gap down. */
  wrongGap: 10,

  /** This many correct in a row starts a bull run, which lasts until the next wrong answer. */
  bullRunStreak: 5,
  bullRunMultiplier: 1.5,

  /** Below this the screen warns you. */
  dangerPrice: 20,

  /** Seconds survived at which harder quick math starts. */
  difficultyAtSec: { medium: 30, hard: 90 },

  /** Share of questions that are multiple choice, by seconds survived. The rest are quick math. */
  multipleChoiceShare: [
    { fromSec: 0, share: 0 },
    { fromSec: 20, share: 0.2 },
    { fromSec: 60, share: 0.35 },
    { fromSec: 120, share: 0.5 },
  ],

  /** Typed answers within this fraction of the right one pass, on top of each template's own
   *  tolerance — so 1,260 counts for 1,259.71. */
  relativeTolerance: 0.005,

  /** Score = seconds survived × this + all-time high. */
  pointsPerSecond: 10,

  /** Chart: samples per second, and how much history the live chart shows. */
  sampleMs: 100,
  liveWindowSec: 60,

  countdownSec: 3,

  /** Master volume for every sound (0–1). Each sound's own level is relative to this. */
  volume: 0.35,
} as const;
