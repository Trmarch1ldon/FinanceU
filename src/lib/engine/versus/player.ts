/**
 * A seat in a 1v1 match, as the match sees it — and that is all it sees. The local human, a
 * bot and (later) a network opponent are all just `MatchPlayer`s: each watches the state it's
 * shown and sends intents. The match never asks which kind it has.
 *
 * Generic over the match's state and intent types, so any future versus mode can reuse it.
 */
export type MatchView<State> = {
  get: () => State;
  /** Called on every change. Returns an unsubscribe function. */
  subscribe: (listener: (state: State) => void) => () => void;
};

export type MatchPlayer<State, Intent, Seat extends string> = {
  /** Take a seat. `send` relays this player's intents into the match. Returns a detach. */
  attach: (seat: Seat, view: MatchView<State>, send: (intent: Intent) => void) => () => void;
};

/** The local human: the UI sends for it, so attaching only hands back the `send`. */
export function createLocalPlayer<State, Intent, Seat extends string>() {
  let send: ((intent: Intent) => void) | null = null;
  const player: MatchPlayer<State, Intent, Seat> = {
    attach: (_seat, _view, relay) => {
      send = relay;
      return () => {
        send = null;
      };
    },
  };
  return { player, send: (intent: Intent) => send?.(intent) };
}
