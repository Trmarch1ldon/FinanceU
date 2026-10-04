/**
 * The bot ladder — one opponent per rank. Each is data: how fast it answers, how often it's
 * right (by topic), when it spends, and what it says. The bot player reads a profile; nothing
 * else about the match knows bots exist.
 */
import type { Topic } from "@/types/question";

export type BotStrategy = "passive" | "tipper" | "hedger" | "aggressor" | "counter";

export type BotProfile = {
  id: "intern" | "analyst" | "associate" | "vp" | "md";
  name: string;
  /** Shown in the face-off strip: THOM vs ANALYST. */
  ticker: string;
  /** Base answer time for an easy question, ms. */
  thinkMs: [number, number];
  accuracy: number;
  /** Accuracy adjustments by topic. */
  topicSkill: Partial<Record<Topic, number>>;
  strategy: BotStrategy;
  playstyle: string;
  /** For the select screen's bars, 0–100. */
  speedRating: number;
  lines: {
    opening: string[];
    attack: string[];
    lead: string[];
    behind: string[];
    win: string[];
    lose: string[];
  };
};

export const BOTS: BotProfile[] = [
  {
    id: "intern",
    name: "The Intern",
    ticker: "INTERN",
    thinkMs: [6500, 11000],
    accuracy: 0.6,
    topicSkill: { "mental-math": 0.05, dcf: -0.15, lbo: -0.15 },
    strategy: "passive",
    playstyle: "Slow, eager, mostly guessing. Rarely touches the Trading Pit.",
    speedRating: 20,
    lines: {
      opening: [
        "Is this the coffee order? No? Okay, let's go.",
        "I read a whole blog post on DCFs.",
      ],
      attack: ["Did I just press something?"],
      lead: ["Wait, I'm winning? Can I put this on my resume?"],
      behind: ["Is it normal to sweat this much?", "My manager is going to see this."],
      win: ["Return offer, here I come!"],
      lose: ["Good game. I'll go back to formatting slides."],
    },
  },
  {
    id: "analyst",
    name: "The Analyst",
    ticker: "ANALYST",
    thinkMs: [4800, 8500],
    accuracy: 0.7,
    topicSkill: { "mental-math": 0.08, "three-statements": 0.05, ma: -0.1 },
    strategy: "tipper",
    playstyle: "Steady numbers, and buys Insider Tips whenever cash allows.",
    speedRating: 40,
    lines: {
      opening: [
        "I've modelled this outcome. You lose in every case.",
        "Let's keep this under 90 hours.",
      ],
      attack: ["Running the numbers on you. They don't look good."],
      lead: ["Model says I'm ahead. Model is always right.", "Hit F9. Still winning."],
      behind: ["There must be a circular reference.", "Recalculating…"],
      win: ["Sending you the deck with the post-mortem."],
      lose: ["That's going in my weekend comps."],
    },
  },
  {
    id: "associate",
    name: "The Associate",
    ticker: "ASSOC",
    thinkMs: [3800, 7000],
    accuracy: 0.78,
    topicSkill: { valuation: 0.06, comps: 0.06, "mental-math": -0.04 },
    strategy: "hedger",
    playstyle: "Hedges every risk and squeezes you when you get ahead.",
    speedRating: 55,
    lines: {
      opening: ["I've seen a hundred of you. Let's make this quick.", "Hedged. Always hedged."],
      attack: ["Short squeeze incoming. Brace yourself.", "Let's see you price this."],
      lead: ["As expected.", "I'll take the lead and the bonus."],
      behind: ["Downside is protected. Mostly.", "Fine. Repricing."],
      win: ["Closing dinner's on you."],
      lose: ["My VP is going to hear about this."],
    },
  },
  {
    id: "vp",
    name: "The VP",
    ticker: "VP",
    thinkMs: [3400, 6000],
    accuracy: 0.85,
    topicSkill: { ma: 0.06, lbo: 0.05, accounting: -0.05 },
    strategy: "aggressor",
    playstyle: "Fast and aggressive. Will halt your trading at the worst moment.",
    speedRating: 75,
    lines: {
      opening: ["I don't negotiate. I acquire.", "You're a line item to me."],
      attack: ["Trading halted. Enjoy the silence.", "Hands off the keyboard."],
      lead: ["Majority's mine. Start packing.", "Board seats incoming."],
      behind: ["Interesting. Temporary.", "Don't get comfortable."],
      win: ["Integration starts Monday."],
      lose: ["Well played. Expect a call from my lawyers."],
    },
  },
  {
    id: "md",
    name: "The MD",
    ticker: "MD",
    thinkMs: [2600, 4600],
    accuracy: 0.93,
    topicSkill: { dcf: 0.03, lbo: 0.03 },
    strategy: "counter",
    playstyle: "Near-perfect and very fast. Saves for Poison Pills and punishes every attack.",
    speedRating: 92,
    lines: {
      opening: [
        "I've closed bigger deals before breakfast.",
        "Your company. My company. Same thing soon.",
      ],
      attack: ["You came at the king.", "Counterattack. Obviously."],
      lead: ["This was never in doubt.", "Sign here."],
      behind: ["Bold. Let's see if it lasts.", "Cute."],
      win: ["Welcome to the portfolio."],
      lose: ["…Who trained you? I'd like to hire them."],
    },
  },
];

export const botById = (id: string) => BOTS.find((bot) => bot.id === id);
