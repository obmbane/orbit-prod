import { Tone } from './Badges';

/** A small trend line. Colour says whether the direction is good, bad or neutral. */
export default function Sparkline({ values, tone = 'grey', width = 120, height = 36 }: { values: number[]; tone?: Tone; width?: number; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => [(i / (values.length - 1)) * (width - 4) + 2, height - 4 - ((v - min) / span) * (height - 8)] as const);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lastX, lastY] = points[points.length - 1];
  return (
    <svg className={`spark tone-${tone}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={`${line} L${width - 2},${height} L2,${height} Z`} className="area" />
      <path d={line} className="line" />
      <circle cx={lastX} cy={lastY} r="2.5" className="end" />
    </svg>
  );
}
