// src/pages/Expenses.jsx
import { useState, useMemo } from 'react'
import { DollarSign, Trash2, ChevronDown, ChevronUp, Truck, Users, Fuel, Building2, Zap, Package, MoreHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatCUP, formatCUPShort } from '../utils/formatCurrency'
import { formatDate, todayISO } from '../utils/dateHelpers'
import { EXPENSE_CATEGORIES, EXPENSE_CAT_MAP } from '../constants/expenseCategories'

const ICON_MAP = { Truck, Users, Fuel, Building2, Zap, Package, MoreHorizontal }

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useApp()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm] = useState({
    category: 'transport', amount: '', description: '', date: todayISO(),
  })
  const [submitting, setSubmitting] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount) return
    setSubmitting(true)
    await addExpense({ category: form.category, amount: Number(form.amount), description: form.description, date: form.date })
    setForm({ category: 'transport', amount: '', description: '', date: todayISO() })
    setSubmitting(false)
  }

  const totalThisMonth = useMemo(() => {
    const now = new Date()
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, e) => s + Number(e.amount), 0)
  }, [expenses])

  const byCategory = useMemo(() => {
    const map = {}
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [expenses])

  return (
    <>
      <Header title="Gastos" subtitle="Control de gastos operacionales" />
      <PageWrapper>
        <div className="space-y-5">

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-card">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <DollarSign size={15} className="text-amber-600" />
              </div>
              <p className="text-lg font-bold text-amber-700">{formatCUPShort(totalThisMonth)}</p>
              <p className="text-[10px] text-slate-500">Gastos este mes</p>
            </div>
            <div className="metric-card">
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                <DollarSign size={15} className="text-slate-500" />
              </div>
              <p className="text-lg font-bold text-slate-700">
                {formatCUPShort(expenses.reduce((s, e) => s + Number(e.amount), 0))}
              </p>
              <p className="text-[10px] text-slate-500">Total acumulado</p>
            </div>
          </div>

          {/* Category breakdown */}
          {byCategory.length > 0 && (
            <div className="card">
              <p className="section-title mb-3">Por categoría</p>
              <div className="space-y-2">
                {byCategory.map(([cat, total]) => {
                  const info = EXPENSE_CAT_MAP[cat] || {}
                  const Icon = ICON_MAP[info.icon] || MoreHorizontal
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 font-medium">{info.label || cat}</span>
                          <span className="text-slate-600">{formatCUP(total)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${Math.min(100, (total / (byCategory[0]?.[1] || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="card">
            <p className="section-title mb-4">Nuevo gasto</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="field-label">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {EXPENSE_CATEGORIES.map(cat => {
                    const Icon = ICON_MAP[cat.icon] || MoreHorizontal
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => set('category', cat.value)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                          form.category === cat.value
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-50 text-slate-500 border-transparent'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-center leading-tight">{cat.label.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="field-label">Monto (CUP) *</label>
                <input className="field-input text-lg font-bold" type="number" placeholder="0.00"
                  min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required />
              </div>
              <div>
                <label className="field-label">Descripción</label>
                <input className="field-input" placeholder="Ej: Flete desde almacén..." value={form.description}
                  onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Fecha</label>
                <input className="field-input" type="date" value={form.date}
                  onChange={e => set('date', e.target.value)} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary">
                <DollarSign size={18} />
                {submitting ? 'Registrando...' : 'Registrar gasto'}
              </button>
            </form>
          </div>

          {/* History */}
          <div>
            <p className="section-title mb-3">Historial ({expenses.length})</p>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={36} className="mb-2" />
                <p className="text-sm">Sin gastos registrados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.map(expense => {
                  const info = EXPENSE_CAT_MAP[expense.category] || {}
                  const Icon = ICON_MAP[info.icon] || MoreHorizontal
                  const isOpen = expanded === expense.id
                  return (
                    <div key={expense.id} className="card p-0 overflow-hidden">
                      <button className="w-full flex items-center gap-3 p-4 text-left"
                        onClick={() => setExpanded(isOpen ? null : expense.id)}>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <Icon size={18} className="text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {expense.description || info.label || expense.category}
                          </p>
                          <p className="text-xs text-slate-400">{info.label}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-amber-700">{formatCUPShort(expense.amount)}</span>
                          {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-slate-50 animate-fade-in">
                          <p className="text-xs text-slate-400 pt-3">{formatDate(expense.date)}</p>
                          <button onClick={() => setDeleteTarget(expense)}
                            className="flex items-center gap-1.5 text-xs text-red-500 font-medium pt-2">
                            <Trash2 size={13} /> Eliminar gasto
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteExpense(deleteTarget.id)}
        title="Eliminar gasto"
        message="¿Seguro que deseas eliminar este gasto?"
      />
    </>
  )
}
