"use client";

import type { RoadmapNode } from "@/types/dashboard";

import { RoadmapNodeMark } from "./roadmap-node";

type SkillRoadmapProps = { nodes: RoadmapNode[] };

/** The track. One rail runs behind every node, filled up to where you've reached —
 *  so the panel answers "how far am I?" before you read a single label. */
export function SkillRoadmap({ nodes }: SkillRoadmapProps) {
  const lastIndex = nodes.length - 1;
  const activeIndex = Math.max(
    0,
    nodes.findIndex((n) => n.state === "in-progress") !== -1
      ? nodes.findIndex((n) => n.state === "in-progress")
      : nodes.map((n) => n.state === "completed").lastIndexOf(true),
  );

  // Rail runs centre-to-centre, so it insets by half a column at each end.
  const halfColumn = 50 / nodes.length;
  const filled = lastIndex > 0 ? (activeIndex / lastIndex) * 100 : 0;

  const handleSelect = (node: RoadmapNode) => {
    // eslint-disable-next-line no-console -- placeholder until topics are playable (task U1b)
    console.info(`[roadmap] start topic: ${node.id}`);
  };

  return (
    <div className="relative overflow-x-auto pb-1">
      <div className="relative min-w-[560px]">
        {/* Rails sit behind the marks, aligned to their centres (44px / 2). */}
        <div
          aria-hidden
          className="absolute top-[21px] h-0.5 bg-border"
          style={{ left: `${halfColumn}%`, right: `${halfColumn}%` }}
        />
        <div
          aria-hidden
          className="rail-draw absolute top-[21px] h-0.5 bg-accent"
          style={{
            left: `${halfColumn}%`,
            width: `calc((100% - ${halfColumn * 2}%) * ${filled / 100})`,
          }}
        />

        <ol
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${nodes.length}, 1fr)` }}
        >
          {nodes.map((node, index) => (
            <RoadmapNodeMark
              key={node.id}
              node={node}
              onSelect={handleSelect}
              // Nodes land behind the rail as it reaches them.
              landDelayMs={180 + index * 70}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
