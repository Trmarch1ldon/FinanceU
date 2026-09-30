/** MOCK — replaced by the friends API in task U6. */
import type { Friend, TickerItem } from "@/types/dashboard";

export const mockFriends: Friend[] = [
  { id: "alex", name: "Alex Chen", handle: "alexc", weeklyXp: 2410, rankDelta: 2 },
  { id: "thomas", name: "Thomas Marchildon", handle: "thomas", weeklyXp: 1240, rankDelta: 0 },
  { id: "sam", name: "Sam Okonkwo", handle: "samo", weeklyXp: 2180, rankDelta: 0 },
  { id: "jordan", name: "Jordan Lee", handle: "jlee", weeklyXp: 1905, rankDelta: -1 },
  { id: "priya", name: "Priya Nair", handle: "priyan", weeklyXp: 1620, rankDelta: 1 },
  { id: "wei", name: "Wei Zhang", handle: "weiz", weeklyXp: 1480, rankDelta: -2 },
];

/** Friend activity written as tape. Order is the reading order on the ticker.
 *
 *  `event` carries no ▲/▼ — TickerBar renders the glyph from `trend`. Putting one
 *  here too prints it twice. */
export const mockTicker: TickerItem[] = [
  { id: "t1", symbol: "ALEX", event: "2 RANK", trend: "up" },
  { id: "t2", symbol: "SAM", event: "12-DAY STREAK", trend: "up" },
  { id: "t3", symbol: "JORDAN", event: "+340 XP", trend: "up" },
  { id: "t4", symbol: "PRIYA", event: "MADE ASSOCIATE", trend: "up" },
  { id: "t5", symbol: "WEI", event: "2 RANK", trend: "down" },
  { id: "t6", symbol: "ALEX", event: "DCF 94% ACCURACY", trend: "up" },
  { id: "t7", symbol: "JORDAN", event: "STREAK LOST", trend: "down" },
  { id: "t8", symbol: "SAM", event: "+180 XP", trend: "up" },
];
