/** MOCK — replaced by real topic progress in task U1b. */
import type { RoadmapNode } from "@/types/dashboard";

/** The IB technical-interview path, in the order it's actually learned: you can't value
 *  a company before you can read its statements. */
export const mockRoadmap: RoadmapNode[] = [
  { id: "accounting", name: "Accounting Basics", short: "Acct", state: "completed", progress: 100 },
  {
    id: "three-statements",
    name: "Three Statements",
    short: "3 Stmt",
    state: "completed",
    progress: 100,
  },
  { id: "ratios", name: "Financial Ratios", short: "Ratios", state: "completed", progress: 100 },
  { id: "valuation", name: "Valuation Basics", short: "Val", state: "in-progress", progress: 62 },
  { id: "dcf", name: "DCF", short: "DCF", state: "locked", progress: 0 },
  { id: "comps", name: "Comps", short: "Comps", state: "locked", progress: 0 },
  { id: "ma", name: "M&A", short: "M&A", state: "locked", progress: 0 },
  { id: "lbo", name: "LBO", short: "LBO", state: "locked", progress: 0 },
];
