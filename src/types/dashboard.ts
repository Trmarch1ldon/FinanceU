/** Shapes the dashboard renders. Mock data implements these today; the progress store
 *  and friends API implement them later (task U1b). Keep them serializable. */

export type RankId = "intern" | "analyst" | "associate" | "vp" | "director" | "md";

export type Rank = {
  id: RankId;
  name: string;
  /** Cumulative XP at which this rank begins. */
  threshold: number;
};

export type Trend = "up" | "down" | "flat";

export type UserSummary = {
  name: string;
  handle: string;
  initials: string;
  /** Their own ticker symbol, used by Survival and the ticker bar. */
  symbol: string;
  xp: number;
  weeklyXp: number;
  /** Last 7 days of XP, oldest first — drives the sparkline. */
  weeklyXpSeries: number[];
  streakDays: number;
  accuracy: number;
  globalRank: number;
  friendsRank: number;
  friendsTotal: number;
};

export type Friend = {
  id: string;
  name: string;
  handle: string;
  weeklyXp: number;
  /** Positions gained or lost this week. */
  rankDelta: number;
};

/** A headline on the ticker bar. Mirrors how a real tape reads: symbol, event, move. */
export type TickerItem = {
  id: string;
  symbol: string;
  event: string;
  trend: Trend;
};

export type NodeState = "completed" | "in-progress" | "locked";

export type RoadmapNode = {
  id: string;
  name: string;
  /** Short form for the node rail, where space is tight. */
  short: string;
  state: NodeState;
  /** 0–100. Only meaningful when state is "in-progress". */
  progress: number;
};

export type TopicAccuracy = {
  id: string;
  name: string;
  accuracy: number;
  answered: number;
};

/** One day in the activity heatmap. `level` is 0–4, not a raw count, so the scale is
 *  decided once here rather than in the component. */
export type ActivityDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};
