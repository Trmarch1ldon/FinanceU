import type { TopicAccuracy } from "@/types/dashboard";

type AccuracyByTopicProps = { topics: TopicAccuracy[] };

/** Magnitude across categories, so: one hue, direct labels, no legend, no grid.
 *  Sorted high to low — the ranking is the point.
 *
 *  The fill is neutral, not accent. Five accent bars here shout louder than the
 *  roadmap above them, and this panel is a readout, not a call to action. */
export function AccuracyByTopic({ topics }: AccuracyByTopicProps) {
  const sorted = [...topics].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <ul className="space-y-3">
      {sorted.map((topic, index) => (
        <li key={topic.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
          <span className="truncate text-[12px] text-fg">{topic.name}</span>
          <span className="font-mono text-[12px] text-fg tabular-nums">{topic.accuracy}%</span>

          <div className="col-span-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="bar-grow h-full rounded-full bg-bar"
                style={{ width: `${topic.accuracy}%`, animationDelay: `${index * 60}ms` }}
                role="img"
                aria-label={`${topic.name}: ${topic.accuracy} percent accuracy over ${topic.answered} questions`}
              />
            </div>
            <span className="shrink-0 font-mono text-[10px] text-muted tabular-nums">
              {topic.answered}q
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
