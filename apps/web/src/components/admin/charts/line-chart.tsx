import * as React from 'react';

export interface LineChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showDots?: boolean;
}

export function LineChart({
  data,
  labels,
  height = 200,
  color = '#0057FF',
  gradientFrom = 'rgba(0,87,255,0.35)',
  gradientTo = 'rgba(0,87,255,0)',
  showDots = true,
}: LineChartProps) {
  const width = 600;
  const padding = { top: 12, right: 12, bottom: 24, left: 36 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + h - ((v - min) / range) * h;
    return { x, y, v };
  });

  const path = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  const areaPath = `${path} L ${padding.left + (data.length - 1) * stepX} ${padding.top + h} L ${padding.left} ${padding.top + h} Z`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => min + (range * i) / yTicks);

  const gradId = React.useId();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Line chart"
      className="h-auto w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>
      </defs>
      {tickValues.map((tv, i) => {
        const y = padding.top + h - ((tv - min) / range) * h;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + w}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={10}
              fill="rgba(255,255,255,0.4)"
            >
              {Math.round(tv)}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showDots &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill={color}
            stroke="#050510"
            strokeWidth={1.5}
          />
        ))}
      {labels &&
        labels.map((lab, i) => {
          if (i % Math.ceil(labels.length / 8) !== 0 && i !== labels.length - 1) return null;
          const x = padding.left + i * stepX;
          return (
            <text
              key={i}
              x={x}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fill="rgba(255,255,255,0.4)"
            >
              {lab}
            </text>
          );
        })}
    </svg>
  );
}
