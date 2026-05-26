// src/pages/Analytics.jsx
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import ProfitChart from '../components/charts/ProfitChart'
import ExpenseChart from '../components/charts/ExpenseChart'
import LossChart from '../components/charts/LossChart'
import TopProductsChart from '../components/charts/TopProductsChart'
import { buildChartData, topProductsBySales, lossBreakdown, calcFinancials } from '../utils/calcFinancials'
import { formatCUP, formatCUPShort } from '../utils/formatCurrency'
import { PERIODS } from '../utils/dateHelpers'

function SectionCard({ title, children }) {
  return (
    <div className="card">
      <p className="section-title mb-4">{title}</p>
      {children}
    </div>
  )
}

function StatRow({ label, value, color = 'text-slate-800' }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}

export default function Analytics() {
  const { products, entries, outputs, expenses, sales } = useApp()
  const [period, setPeriod] = useState('month')

  const chartData = useMemo(() => buildChartData({ outputs, expenses, sales, products, days: 30 }), [outputs, expenses, sales, products])
  const topProducts = useMemo(() => topProductsBySales(sales, products, 8), [sales, products])
  const losses = useMemo(() => lossBreakdown(outputs, products), [outputs, products])
  const financials = useMemo(() => calcFinancials({ products, entries, outputs, expenses, sales, period }), [products, entries, outputs, expenses, sales, period])

  return (
    <>
      <Header title="Análisis" subtitle="Estadísticas del negocio" />
      <PageWrapper>
        <div className="space-y-4">

          {/* Period filter */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`tab-pill flex-1 ${period === p.value ? 'tab-pill-active' : 'tab-pill-inactive'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Key metrics for period */}
          <SectionCard title={`Resumen — ${PERIODS.find(p => p.value === period)?.label}`}>
            <StatRow label="Ingresos totales"     value={formatCUP(financials.revenue)}       color="text-green-700" />
            <StatRow label="Costo de ventas"      value={formatCUP(financials.cogs)}           color="text-slate-600" />
            <StatRow label="Ganancia bruta"        value={formatCUP(financials.grossProfit)}   color="text-blue-700"  />
            <StatRow label="Gastos operacionales"  value={formatCUP(financials.totalExpenses)} color="text-amber-700" />
            <StatRow
              label="Ganancia neta"
              value={formatCUP(financials.netProfit)}
              color={financials.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}
            />
            <StatRow label="Pérdidas / Merma"     value={formatCUP(financials.lossValue)}     color="text-red-600"   />
            <StatRow label="Inversión en compras" value={formatCUP(financials.purchaseInvest)} color="text-slate-600" />
            <StatRow label="Unidades vendidas"    value={`${financials.saleUnits} unidades`}   />
          </SectionCard>

          {/* Profit & Revenue chart — last 30 days */}
          <SectionCard title="Ganancias e ingresos (últimos 30 días)">
            <div className="flex gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-xs text-slate-500">Ganancia</span>
              </div>
            </div>
            <ProfitChart data={chartData} />
          </SectionCard>

          {/* Expenses chart */}
          <SectionCard title="Gastos (últimos 30 días)">
            <ExpenseChart data={chartData} />
          </SectionCard>

          {/* Top products */}
          <SectionCard title="Productos más vendidos">
            {topProducts.length > 0 ? (
              <TopProductsChart data={topProducts} />
            ) : (
              <div className="empty-state h-32">
                <p className="text-sm">Sin datos de ventas</p>
              </div>
            )}
          </SectionCard>

          {/* Loss breakdown */}
          <SectionCard title="Pérdidas y mermas">
            <LossChart data={losses} />
            {losses.length > 0 && (
              <div className="mt-3 space-y-2">
                {losses.map(l => (
                  <div key={l.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
                    <span className="text-sm text-slate-600 flex-1">{l.name}</span>
                    <span className="text-sm font-semibold text-slate-800">{formatCUP(l.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Inventory snapshot */}
          <SectionCard title="Estado del inventario">
            <StatRow label="Valor total en stock"   value={formatCUP(financials.inventoryValue)} color="text-blue-700" />
            <StatRow label="Total de unidades"       value={`${financials.totalStock} unidades`} />
            <StatRow label="Productos con stock bajo" value={`${financials.lowStockProducts.length} productos`} color={financials.lowStockProducts.length > 0 ? 'text-red-600' : 'text-green-700'} />
            <StatRow label="Total de productos"      value={`${products.length} productos`} />
          </SectionCard>

        </div>
      </PageWrapper>
    </>
  )
}
