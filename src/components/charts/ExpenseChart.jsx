// src/components/charts/ExpenseChart.jsx
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell
} from 'recharts'
import { formatCUPShort } from '../../utils/formatCurrency'
import { formatDateShort } from '../../utils/dateHelpers'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-card-md px-3 py-2 text-xs">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-amber-600">Gastos: {formatCUPShort(payload[0]?.value)}</p>
    </div>
  )
}

export default function ExpenseChart({ data }) {
  const mapped = (data || []).map(d => ({
    ...d,
    fecha: formatDateShort(d.date),
  })).filter(d => d.expenses > 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={mapped} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={formatCUPShort} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="expenses" name="Gastos" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {mapped.map((_, i) => <Cell key={i} fill="#f59e0b" fillOpacity={0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
