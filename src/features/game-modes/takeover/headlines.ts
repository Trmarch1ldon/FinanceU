/**
 * Match events → wire headlines, plus the bot's trash talk at the moments that matter: when it
 * attacks, takes the lead, falls behind, and at the end. Pure: the caller tracks which events
 * it has already shown.
 */
import type { BotProfile } from "./bots";
import { TAKEOVER as C } from "./config";
import type { MatchEvent, Seat } from "./match/types";

export type HeadlineTone = "p1" | "p2" | "breaking" | "talk";
export type Headline = { text: string; tone: HeadlineTone; isBreaking?: boolean };

type Names = Record<Seat, string>;

const ATTACK_VERB = { squeeze: "LAUNCHES SHORT SQUEEZE ON", halt: "LAUNCHES TRADING HALT ON" };
const SELF_VERB = {
  insider: "GETS AN INSIDER TIP",
  hedge: "HEDGES ITS POSITION",
  pill: "ACTIVATES POISON PILL",
};

/** Deterministic pick so a re-render never reshuffles a line already on screen. */
const line = (lines: string[], salt: number) => lines[salt % lines.length];

export function headlinesFor(
  event: MatchEvent,
  names: Names,
  bot: BotProfile,
  botSeat: Seat,
  salt: number,
): Headline[] {
  const out: Headline[] = [];
  const talk = (lines: string[]) =>
    out.push({ text: `${bot.ticker}: “${line(lines, salt)}”`, tone: "talk" });

  switch (event.kind) {
    case "power": {
      const who = names[event.seat];
      if (event.isBounced) {
        out.push({
          text: `POISON PILL! ${who}'S ${C.powerUps[event.power].name.toUpperCase()} BACKFIRES`,
          tone: event.seat === "p1" ? "p2" : "p1",
          isBreaking: true,
        });
      } else if (event.power === "squeeze" || event.power === "halt") {
        out.push({
          text: `${who} ${ATTACK_VERB[event.power]} ${names[event.target]}`,
          tone: event.seat,
          isBreaking: true,
        });
      } else {
        out.push({ text: `${who} ${SELF_VERB[event.power]}`, tone: event.seat });
      }
      if (
        event.seat === botSeat &&
        !event.isBounced &&
        (event.power === "squeeze" || event.power === "halt")
      ) {
        talk(bot.lines.attack);
      }
      break;
    }
    case "lead":
      out.push({ text: `${names[event.seat]} SEIZES MAJORITY CONTROL`, tone: event.seat });
      talk(event.seat === botSeat ? bot.lines.lead : bot.lines.behind);
      break;
    case "stake":
      out.push({
        text:
          event.level >= 90
            ? `${names[event.seat]} STAKE PASSES ${event.level}% — BOARD CONCEDES`
            : `${names[event.seat]} STAKE PASSES ${event.level}%, TAKEOVER IMMINENT`,
        tone: event.seat,
        isBreaking: true,
      });
      break;
    case "answer":
      // Routine answers stay off the wire; streak milestones make it.
      break;
    case "sudden-death":
      out.push({
        text: "DEAD HEAT AT THE BELL — SUDDEN DEATH",
        tone: "breaking",
        isBreaking: true,
      });
      break;
    case "end":
      out.push({
        text:
          event.reason === "takeover"
            ? `${names[event.winner]} COMPLETES HOSTILE TAKEOVER`
            : `CLOSING BELL: ${names[event.winner]} WINS CONTROL`,
        tone: event.winner,
        isBreaking: true,
      });
      talk(event.winner === botSeat ? bot.lines.win : bot.lines.lose);
      break;
  }
  return out;
}

/** "THOM ON A 5-ANSWER RUN" at streaks of 3, 5, 8… */
export function streakHeadline(name: string, streak: number, seat: Seat): Headline | null {
  if (streak !== 3 && streak !== 5 && streak < 8) return null;
  if (streak >= 8 && streak % 4 !== 0) return null;
  return { text: `${name} ON A ${streak}-ANSWER RUN`, tone: seat };
}
