type SparklineProps = {
  values: number[];
  /** Described by the stat value beside it, so the graphic itself is decorative. */
  label: string;
  className?: string;
};

/** Seven points, 2px stroke, no axes and no grid — it shows shape, not values. The
 *  number next to it carries the reading. */
export function Sparkline({ values, label, className }: SparklineProps) {
  if (values.length < 2) return null;

  const width = 72;
  const height = 24;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);

  const coords = values.map((value, index) => ({
    x: index * step,
    y: height - (value / max) * (height - 3) - 1.5,
  }));

  const points = coords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Path length drives stroke-dasharray so the line can draw itself left to right.
  // Summing the segments is exact for a polyline — no need for getTotalLength().
  const length = coords.reduce((total, point, index) => {
    if (index === 0) return 0;
    const previous = coords[index - 1];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="spark-draw"
        style={{ ["--spark-len" as string]: length.toFixed(1) }}
      />
    </svg>
  );
}
