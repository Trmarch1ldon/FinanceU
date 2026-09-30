/** MOCK — replaced by per-topic mastery from the progress store in task U1b. */
import type { TopicAccuracy } from "@/types/dashboard";

export const mockTopics: TopicAccuracy[] = [
  { id: "accounting", name: "Accounting Basics", accuracy: 88, answered: 142 },
  { id: "three-statements", name: "Three Statements", accuracy: 81, answered: 96 },
  { id: "ratios", name: "Financial Ratios", accuracy: 71, answered: 88 },
  { id: "valuation", name: "Valuation Basics", accuracy: 54, answered: 37 },
  { id: "mental-math", name: "Mental Math", accuracy: 93, answered: 210 },
];
