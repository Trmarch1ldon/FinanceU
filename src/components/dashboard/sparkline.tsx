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

  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

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
      />
    </svg>
  );
}
