// src/pages/Sales.jsx
// Dedicated POS-style Sales page.
// Primary flow: FAB → SaleDrawer → cart → process → history.
import { useState, useMemo } from 'react'
import {
  ShoppingCart, Plus, TrendingUp, Package, DollarSign, Search, X
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import SaleDrawer from '../components/sales/SaleDrawer'
import SaleHistoryCard from '../components/sales/SaleHistoryCard'
import { formatCUP, formatCUPShort } from '../utils/formatCurrency'
import { PERIODS, formatDate } from '../utils/dateHelpers'

// ── Small metric card ────────────────────────────────────────────────────────
function SaleMetric({ label, value, icon: Icon, color }) {
  const c = {
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700'  },
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'   },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', val: 'text-violet-700' },
  }[color] || {}
  return (
    <div className="metric-card">
      <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon size={14} className={c.icon} />
      </div>
      <p className={`text-base font-bold leading-tight mt-1 ${c.val}`}>{value}</p>
      <p className="text-[10px] text-slate-500 leading-tight">{label}</p>
    </div>
  )
}

// ── Period filter tabs ───────────────────────────────────────────────────────
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

// ── Main page ────────────────────────────────────────────────────────────────
export default function Sales() {
  const { sales, products, deleteSale } = useApp()

  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [period,        setPeriod]        = useState('month')
  const [searchQuery,   setSearchQuery]   = useState('')

  // Filter by period
  const { isInPeriod } = useMemo(() => {
    // inline helper so we don't need to import
    const now = new Date()
    const startOf = (p) => {
      const d = new Date(now)
      if (p === 'today') { d.setHours(0, 0, 0, 0); return d }
      if (p === 'week')  { d.setDate(d.getDate() - 6); d.setHours(0,0,0,0); return d }
      if (p === 'month') { d.setDate(1); d.setHours(0,0,0,0); return d }
      return new Date(0)
    }
    const start = startOf(period)
    return { isInPeriod: (dateStr) => new Date(dateStr) >= start }
  }, [period])

  const periodSales = useMemo(() =>
    sales.filter(s => isInPeriod(s.date)),
    [sales, isInPeriod]
  )

  // Metrics
  const totalRevenue  = periodSales.reduce((s, sale) => s + (Number(sale.total) || 0), 0)
  const totalSales    = periodSales.length
  const totalUnits    = periodSales.reduce((s, sale) =>
    s + (sale.items || []).reduce((ss, i) => ss + Number(i.quantity), 0), 0
  )

  // Filter by search (customer name or product name in items)
  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return periodSales
    return periodSales.filter(sale =>
      (sale.customerName || '').toLowerCase().includes(q) ||
      (sale.items || []).some(item =>
        (item.productName || '').toLowerCase().includes(q) ||
        (products.find(p => p.id === item.productId)?.name || '').toLowerCase().includes(q)
      )
    )
  }, [periodSales, searchQuery, products])

  return (
    <>
      <Header title="Ventas" subtitle="Registro de transacciones" />

      <PageWrapper>
        <div className="space-y-4">

          {/* Period tabs */}
          <PeriodTabs value={period} onChange={setPeriod} />

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-3">
            <SaleMetric
              label="Ingresos"
              value={formatCUPShort(totalRevenue)}
              icon={DollarSign}
              color="green"
            />
            <SaleMetric
              label="Ventas"
              value={totalSales}
              icon={ShoppingCart}
              color="blue"
            />
            <SaleMetric
              label="Unidades"
              value={totalUnits}
              icon={Package}
              color="violet"
            />
          </div>

          {/* History section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">
                Historial ({filteredSales.length})
              </p>
            </div>

            {/* Search bar */}
            {sales.length > 0 && (
              <div className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente o producto..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900
                             placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {filteredSales.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={36} className="mb-2 opacity-40" />
                <p className="text-sm font-medium text-slate-500">
                  {sales.length === 0 ? 'Sin ventas registradas' : 'Sin resultados'}
                </p>
                {sales.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Toca el botón + para registrar tu primera venta
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 stagger-children">
                {filteredSales.map(sale => (
                  <SaleHistoryCard
                    key={sale.id}
                    sale={sale}
                    products={products}
                    onDelete={(id) => setDeleteTarget(id)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </PageWrapper>

      {/* FAB — "Nueva venta" */}
      <button
        id="nueva-venta-fab"
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fab"
        aria-label="Nueva venta"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* POS Drawer */}
      <SaleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteSale(deleteTarget)
          setDeleteTarget(null)
        }}
        title="Eliminar venta"
        message="Al eliminar esta venta se devolverá el stock de todos los productos. ¿Continuar?"
      />
    </>
  )
}
