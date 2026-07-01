import * as React from 'react';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieSlice[];
  height?: number;
  innerRadiusRatio?: number;
}

export function PieChart({ data, height = 220, innerRadiusRatio = 0.6 }: PieChartProps) {
  const width = 220;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 8;
  const inner = r * innerRadiusRatio;

  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let cumAngle = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;

    const x1 = cx + Math.cos(startAngle) * r;
    const y1 = cy + Math.sin(startAngle) * r;
    const x2 = cx + Math.cos(endAngle) * r;
    const y2 = cy + Math.sin(endAngle) * r;
    const ix1 = cx + Math.cos(endAngle) * inner;
    const iy1 = cy + Math.sin(endAngle) * inner;
    const ix2 = cx + Math.cos(startAngle) * inner;
    const iy2 = cy + Math.sin(startAngle) * inner;

    const largeArc = angle > Math.PI ? 1 : 0;

    const path =
      angle >= Math.PI * 2 - 0.0001
        ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} M ${cx - inner} ${cy} A ${inner} ${inner} 0 1 0 ${cx + inner} ${cy} A ${inner} ${inner} 0 1 0 ${cx - inner} ${cy} Z`
        : `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${inner} ${inner} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

    const pct = Math.round((d.value / total) * 100);
    return { ...d, path, pct };
  });

  return (
    <div className="flex items-center gap-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Donut chart"
        className="h-auto w-44 shrink-0"
      >
        {slices.length === 0 ? (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={r - inner}
          />
        ) : (
          slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} stroke="#050510" strokeWidth={1.5} />
          ))
        )}
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}88` }}
              />
              <span className="truncate text-white/70">{s.label}</span>
            </div>
            <span className="font-mono text-white">
              {s.pct}% <span className="text-white/40">({s.value})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
