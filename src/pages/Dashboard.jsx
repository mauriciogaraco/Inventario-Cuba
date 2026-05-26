// src/pages/Dashboard.jsx
import { useState, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, Package, 
  AlertTriangle, ShoppingCart, Wallet, BarChart3, ArrowRight
} from 'lucide-react'
// BarChart3 is used for the analytics shortcut button on mobile
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import { calcFinancials, buildChartData } from '../utils/calcFinancials'
import { formatCUPShort, formatCUP } from '../utils/formatCurrency'
import { PERIODS, formatDate } from '../utils/dateHelpers'
import { OUTPUT_TYPE_MAP } from '../constants/outputTypes'
import SparkLine from '../components/charts/SparkLine'

// ── Period Filter Tabs ──────────────────────────────────────────────────────
function PeriodTabs({ value, onChange }) {
  return (
    <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
      {PERIODS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`tab-pill flex-1 ${value === p.value ? 'tab-pill-active' : 'tab-pill-inactive'}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

// ── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value,  icon: Icon, color, sparkData, sparkColor, trend }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'   },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700'  },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700'    },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  val: 'text-amber-700'  },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', val: 'text-violet-700' },
    slate:  { bg: 'bg-slate-50',  icon: 'text-slate-500',  val: 'text-slate-700'  },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className="metric-card animate-fade-in">
      <div className="flex items-center justify-between">
        <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon size={15} className={c.icon} />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className={`text-lg font-bold leading-tight ${c.val}`}>{value}</p>
      <p className="text-[10px] text-slate-500 leading-tight">{label}</p>
      {sparkData && (
        <div className="mt-1 -mx-1">
          <SparkLine data={sparkData} dataKey="v" color={sparkColor || '#2563eb'} height={28} />
        </div>
      )}
    </div>
  )
}

// ── Recent Movement Item ────────────────────────────────────────────────────
function MovementItem({ movement, products }) {
  const product = products.find(p => p.id === movement.productId)
  const isEntry = movement.type === 'entry'
  const outType = movement.outputType ? OUTPUT_TYPE_MAP[movement.outputType] : null

  return (
    <div className="list-item animate-fade-in">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        isEntry ? 'bg-blue-100' : (outType?.bgColor || 'bg-slate-100')
      }`}>
        {isEntry
          ? <Package size={16} className="text-blue-600" />
          : <ShoppingCart size={16} className={outType?.textColor || 'text-slate-500'} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {product?.name || 'Producto'}
        </p>
        <p className="text-xs text-slate-400">
          {isEntry ? `+${movement.quantity} unid. entrada` : `${movement.quantity} unid. — ${outType?.label || 'salida'}`}
        </p>
      </div>
      <p className="text-xs text-slate-400 shrink-0">{formatDate(movement.date)}</p>
    </div>
  )
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { products, entries, outputs, expenses, sales, movements, settings } = useApp()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('month')

  const financials = useMemo(() =>
    calcFinancials({ products, entries, outputs, expenses, sales, period }),
    [products, entries, outputs, expenses, sales, period]
  )

  const chartData = useMemo(() =>
    buildChartData({ outputs, expenses, sales, products, days: 30 }),
    [outputs, expenses, sales, products]
  )

  const profitSparkData = chartData.map(d => ({ v: Math.max(0, d.profit) }))
  const expenseSparkData = chartData.map(d => ({ v: d.expenses }))

  return (
    <>
      <Header
        title={settings?.businessName || 'Mi Negocio'}
        subtitle="Panel de control"
      />
      <PageWrapper>
        <div className="space-y-4">

          {/* Period Tabs */}
          <PeriodTabs value={period} onChange={setPeriod} />

          {/* ── 6 Key Metrics ── */}
          <div className="grid grid-cols-2 gap-3 stagger-children">
            <MetricCard
              label="Efectivo de ventas"
              value={formatCUPShort(financials.cashFromSales)}
              icon={Wallet}
              color={financials.cashFromSales >= 0 ? 'green' : 'red'}
            />
            <MetricCard
              label="Dinero en inventario"
              value={formatCUPShort(financials.inventoryValue)}
              icon={Package}
              color="blue"
            />
            <MetricCard
              label="Ganancia neta"
              value={formatCUPShort(financials.netProfit)}
              icon={TrendingUp}
              color={financials.netProfit >= 0 ? 'green' : 'red'}
              sparkData={profitSparkData}
              sparkColor={financials.netProfit >= 0 ? '#16a34a' : '#dc2626'}
            />
            <MetricCard
              label="Gastos del período"
              value={formatCUPShort(financials.totalExpenses)}
              icon={TrendingDown}
              color="amber"
              sparkData={expenseSparkData}
              sparkColor="#f59e0b"
            />
            <MetricCard
              label="Pérdidas / Merma"
              value={formatCUPShort(financials.lossValue)}
              icon={AlertTriangle}
              color={financials.lossValue > 0 ? 'red' : 'slate'}
            />
            <MetricCard
              label="Unidades en stock"
              value={financials.totalStock.toLocaleString('es')}
              icon={BarChart3}
              color="slate"
            />
          </div>

          {/* ── Low Stock Alert ── */}
          {financials.lowStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <p className="text-sm font-semibold text-red-700">
                  {financials.lowStockProducts.length} producto{financials.lowStockProducts.length > 1 ? 's' : ''} con stock bajo
                </p>
              </div>
              <div className="space-y-2">
                {financials.lowStockProducts.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-sm text-red-700 font-medium">{p.name}</span>
                    <span className="badge-red">{p.stock} {p.unit}</span>
                  </div>
                ))}
                {financials.lowStockProducts.length > 4 && (
                  <button
                    onClick={() => navigate('/inventario')}
                    className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1"
                  >
                    Ver todos <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Ingresos vs Gastos summary ── */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">Resumen financiero</p>
              <span className="text-xs text-slate-400">{PERIODS.find(p => p.value === period)?.label}</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Ingresos de ventas',  value: financials.revenue,       color: 'text-green-600'  },
                { label: 'Costo de lo vendido', value: financials.cogs,          color: 'text-slate-600'  },
                { label: 'Ganancia bruta',      value: financials.grossProfit,   color: 'text-blue-600'   },
                { label: 'Gastos operacionales',value: financials.totalExpenses, color: 'text-amber-600'  },
                { label: 'Ganancia neta',       value: financials.netProfit,     color: financials.netProfit >= 0 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                  <span className="text-slate-600">{row.label}</span>
                  <span className={row.color}>{formatCUP(row.value)}</span>
                </div>
              ))}
            </div>

            {/* Totales del negocio */}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-500">Efectivo de ventas</span>
                <span className={`font-medium ${financials.cashFromSales >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {formatCUP(financials.cashFromSales)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-1">
                <span className="text-slate-500">Dinero en inventario</span>
                <span className="font-medium text-blue-700">{formatCUP(financials.inventoryValue)}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 bg-slate-50 rounded-xl px-2">
                <span className="font-semibold text-slate-700">Total del negocio</span>
                <span className={`font-bold ${financials.totalBusiness >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  {formatCUP(financials.totalBusiness)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Recent Movements ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">Movimientos recientes</p>
              <button
                onClick={() => navigate('/entradas')}
                className="text-xs text-primary-600 font-medium flex items-center gap-1"
              >
                Ver más <ArrowRight size={12} />
              </button>
            </div>
            {movements.length === 0 ? (
              <div className="empty-state">
                <Package size={32} className="mb-2" />
                <p className="text-sm">Sin movimientos aún</p>
              </div>
            ) : (
              <div className="space-y-2">
                {movements.slice(0, 8).map((m, i) => (
                  <MovementItem key={i} movement={m} products={products} />
                ))}
              </div>
            )}
          </div>

          {/* ── Shortcuts (mobile) ── */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <button
              onClick={() => navigate('/ventas')}
              className="flex items-center justify-between bg-green-50 border border-green-100 rounded-2xl px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-green-700">Ventas</span>
              </div>
              <ArrowRight size={14} className="text-green-400" />
            </button>
            <button
              onClick={() => navigate('/analitica')}
              className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3.5"
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">Análisis</span>
              </div>
              <ArrowRight size={14} className="text-primary-400" />
            </button>
          </div>

        </div>
      </PageWrapper>
    </>
  )
}
