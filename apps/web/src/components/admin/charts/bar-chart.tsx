import * as React from 'react';

export interface BarItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarItem[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function BarChart({
  data,
  height = 200,
  color = '#00F0FF',
  formatValue = (v) => v.toLocaleString('tr-TR'),
}: BarChartProps) {
  const rowH = 28;
  const labelWidth = 160;
  const valueWidth = 80;
  const width = 600;
  const barAreaWidth = width - labelWidth - valueWidth - 12;
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Bar chart"
      className="h-auto w-full"
    >
      {data.map((d, i) => {
        const y = i * rowH + 6;
        const barW = (d.value / max) * barAreaWidth;
        const c = d.color ?? color;
        return (
          <g key={i}>
            <text
              x={labelWidth - 8}
              y={y + rowH / 2 + 4}
              textAnchor="end"
              fontSize={11}
              fill="rgba(255,255,255,0.7)"
            >
              {d.label}
            </text>
            <rect
              x={labelWidth}
              y={y + 6}
              width={barAreaWidth}
              height={rowH - 14}
              fill="rgba(255,255,255,0.05)"
              rx={3}
            />
            <rect
              x={labelWidth}
              y={y + 6}
              width={barW}
              height={rowH - 14}
              fill={c}
              rx={3}
              opacity={0.85}
            />
            <text
              x={labelWidth + barW + 6}
              y={y + rowH / 2 + 4}
              fontSize={11}
              fill="rgba(255,255,255,0.9)"
            >
              {formatValue(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
