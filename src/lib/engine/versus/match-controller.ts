/**
 * Runs a 1v1 match on the client: owns the clock, applies the reducer, and relays each seated
 * player's intents. Stamping seat and time here — not in the players — is what keeps players
 * interchangeable; a server would do exactly this, with sockets in place of the attach calls.
 */
import type { MatchPlayer, MatchView } from "./player";

type Reducer<State, Action> = (state: State, action: Action) => State;

type ControllerOptions<State, Intent, Seat extends string, Action> = {
  initial: State;
  reducer: Reducer<State, Action>;
  /** Builds the reducer action for an intent from a seat at a time. */
  toAction: (intent: Intent, seat: Seat, at: number) => Action;
  start: (at: number) => Action;
  tick: (at: number) => Action;
  isOver: (state: State) => boolean;
  tickMs: number;
  players: Record<Seat, MatchPlayer<State, Intent, Seat>>;
};

const now = () => performance.now();

export function createMatchController<State, Intent, Seat extends string, Action>(
  options: ControllerOptions<State, Intent, Seat, Action>,
) {
  let state = options.initial;
  const listeners = new Set<(state: State) => void>();
  const detachers: (() => void)[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;

  const view: MatchView<State> = {
    get: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  function apply(action: Action) {
    const next = options.reducer(state, action);
    if (next === state) return;
    state = next;
    if (options.isOver(state)) stopClock();
    for (const listener of listeners) listener(state);
  }

  function stopClock() {
    if (timer !== null) clearInterval(timer);
    timer = null;
  }

  function attachPlayers() {
    if (detachers.length > 0) return;
    for (const seat of Object.keys(options.players) as Seat[]) {
      const send = (intent: Intent) => apply(options.toAction(intent, seat, now()));
      detachers.push(options.players[seat].attach(seat, view, send));
    }
  }

  return {
    view,
    /**
     * Seat the players and run the clock. Safe to call again after `dispose` — React's dev
     * mode mounts effects twice — and the reducer ignores a second "start" for a live match.
     */
    start() {
      attachPlayers();
      apply(options.start(now()));
      stopClock();
      if (!options.isOver(state)) {
        timer = setInterval(() => apply(options.tick(now())), options.tickMs);
      }
    },
    /** Bring the clock up to date now — a hidden tab's timers lag. */
    catchUp: () => apply(options.tick(now())),
    /** Stop the clock and unseat the players. Subscribers unsubscribe themselves. */
    dispose() {
      stopClock();
      for (const detach of detachers.splice(0)) detach();
    },
  };
}

export type MatchController<State> = {
  view: MatchView<State>;
  start: () => void;
  catchUp: () => void;
  dispose: () => void;
};
