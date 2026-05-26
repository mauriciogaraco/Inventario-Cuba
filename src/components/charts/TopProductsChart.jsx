// src/components/charts/TopProductsChart.jsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-card-md px-3 py-2 text-xs">
      <p className="font-semibold text-primary-700">{payload[0].payload.name}</p>
      <p className="text-slate-500">{payload[0].value} unidades vendidas</p>
    </div>
  )
}

const COLORS = ['#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe','#eff6ff','#e0f2fe']

export default function TopProductsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state h-40">
        <p className="text-sm">Sin ventas registradas</p>
      </div>
    )
  }

  // Truncate long names
  const mapped = data.map(d => ({
    ...d,
    shortName: d.name.length > 10 ? d.name.slice(0, 10) + '…' : d.name,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={mapped} layout="vertical" margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="shortName" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} width={72} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="units" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {mapped.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
