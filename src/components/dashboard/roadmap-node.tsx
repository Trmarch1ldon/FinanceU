"use client";

import { Check, Lock } from "lucide-react";
import { motion, type Transition } from "motion/react";

import { cn } from "@/lib/utils";
import type { RoadmapNode } from "@/types/dashboard";

type RoadmapNodeProps = {
  node: RoadmapNode;
  onSelect: (node: RoadmapNode) => void;
  landDelayMs?: number;
};

const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Fast and flat: a press is acknowledged, not celebrated. */
const PRESS: Transition = { type: "spring", bounce: 0, visualDuration: 0.15 };

export function RoadmapNodeMark({ node, onSelect, landDelayMs = 0 }: RoadmapNodeProps) {
  const locked = node.state === "locked";
  const inProgress = node.state === "in-progress";

  const describe = locked
    ? `${node.name}, locked`
    : inProgress
      ? `${node.name}, ${node.progress}% complete`
      : `${node.name}, completed`;

  return (
    <li
      className="node-land flex min-w-0 flex-col items-center gap-2"
      style={{ animationDelay: `${landDelayMs}ms` }}
    >
      <motion.button
        type="button"
        disabled={locked}
        whileTap={locked ? undefined : { scale: 0.94 }}
        transition={PRESS}
        onClick={() => onSelect(node)}
        aria-label={describe}
        title={describe}
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-full border",
          // `translate`, not `transform`: Tailwind's hover lift uses the translate property,
          // and Motion owns transform for the press — a CSS transition on transform would
          // fight Motion's per-frame writes.
          "transition-[border-color,translate] duration-150",
          locked
            ? "cursor-not-allowed border-border bg-panel text-locked-fg"
            : "border-transparent bg-panel hover:-translate-y-px hover:border-accent",
        )}
      >
        {inProgress && (
          <svg
            viewBox="0 0 44 44"
            className="absolute inset-0 -rotate-90"
            aria-hidden
            style={{ ["--ring" as string]: `${CIRCUMFERENCE * (1 - node.progress / 100)}` }}
          >
            <circle cx="22" cy="22" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="2" />
            <circle
              cx="22"
              cy="22"
              r={RADIUS}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              className="roadmap-ring"
            />
          </svg>
        )}

        {node.state === "completed" && (
          <span className="grid size-11 place-items-center rounded-full bg-accent-dim text-accent">
            <Check size={16} strokeWidth={2.25} aria-hidden />
          </span>
        )}
        {inProgress && (
          <span className="relative font-mono text-[11px] text-accent tabular-nums">
            {node.progress}
          </span>
        )}
        {locked && <Lock size={14} strokeWidth={1.75} aria-hidden />}
      </motion.button>

      <span
        className={cn(
          "max-w-[9ch] text-center font-mono text-[10px] leading-tight tracking-wide",
          locked ? "text-locked-fg" : "text-muted",
        )}
      >
        {node.short}
      </span>
    </li>
  );
}
