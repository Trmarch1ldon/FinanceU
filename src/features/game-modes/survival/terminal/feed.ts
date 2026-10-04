/**
 * Market events for the side panels. The view watches the live state and emits one event per
 * answer (and per danger crossing); News, Time & Sales and the order book subscribe. Panels
 * react to events, not to ticks, so a quiet second costs them nothing.
 */
export type FeedEvent =
  | {
      kind: "answer";
      at: number;
      isCorrect: boolean;
      before: number;
      after: number;
      /** Consecutive correct answers including this one; 0 after a miss. */
      streak: number;
    }
  | { kind: "danger"; at: number; price: number };

export type Feed = {
  emit: (event: FeedEvent) => void;
  subscribe: (listener: (event: FeedEvent) => void) => () => void;
};

export function createFeed(): Feed {
  const listeners = new Set<(event: FeedEvent) => void>();
  return {
    emit: (event) => {
      for (const listener of listeners) listener(event);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** Wall-clock HH:MM:SS, as a terminal prints it. */
export const wallClock = (at: number) =>
  new Date(at).toLocaleTimeString("en-GB", { hour12: false });
