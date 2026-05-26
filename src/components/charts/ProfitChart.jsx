// src/components/charts/ProfitChart.jsx
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts'
import { formatCUPShort } from '../../utils/formatCurrency'
import { formatDateShort } from '../../utils/dateHelpers'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-card-md px-3 py-2 text-xs">
      <p className="text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatCUPShort(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function ProfitChart({ data }) {
  const mapped = (data || []).map(d => ({
    ...d,
    fecha: formatDateShort(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={mapped} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={formatCUPShort} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" name="Ingresos" stroke="#16a34a" strokeWidth={1.5} fill="url(#revenueGrad)" dot={false} />
        <Area type="monotone" dataKey="profit"  name="Ganancia" stroke="#2563eb" strokeWidth={2}   fill="url(#profitGrad)"  dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
