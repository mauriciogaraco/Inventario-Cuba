// src/components/charts/SparkLine.jsx
// Minimal sparkline chart — no axes, no labels, just the shape. Ultra-lightweight.
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function SparkLine({ data, dataKey = 'value', color = '#2563eb', height = 40 }) {
  if (!data || data.length < 2) {
    return <div style={{ height }} className="flex items-center justify-center">
      <span className="text-xs text-slate-300">Sin datos</span>
    </div>
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.8}
          fill={`url(#spark-${color.replace('#','')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
