import { notFound } from "next/navigation";

import { PagePlaceholder } from "@/components/shell/page-placeholder";
import { getMode } from "@/features/game-modes/registry";
import { GameHost } from "@/lib/engine/game-host";

/** Modes in the nav that haven't registered yet. Shown as a placeholder, not a 404, so the
 *  sidebar never leads somewhere broken. Delete each line as its mode lands. */
const UNBUILT: Record<string, { title: string; description: string; task: string }> = {
  classic: {
    title: "Classic",
    description: "Ten questions, an explanation after each. The mode to learn in.",
    task: "M1",
  },
  daily: {
    title: "Daily",
    description: "The same run for everyone today. One attempt, and it feeds your streak.",
    task: "M4",
  },
  "time-attack": {
    title: "Time Attack",
    description: "Sixty seconds. Combos multiply, speed pays.",
    task: "M2",
  },
};

/** Game host route: resolves the mode from the registry and runs it through the engine. */
export default async function PlayPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;

  if (getMode(mode)) return <GameHost modeId={mode} />;

  const unbuilt = UNBUILT[mode];
  if (unbuilt) return <PagePlaceholder {...unbuilt} />;

  notFound();
}
