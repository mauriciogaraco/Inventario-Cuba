// src/pages/Outputs.jsx
// Handles ONLY inventory losses: damaged, theft, personal, other_loss.
// Sales are now managed by the dedicated Sales module (/ventas).
import { useState } from 'react'
import { PackageMinus, Trash2, ChevronDown, ChevronUp, AlertTriangle, Home, HelpCircle, PackageX } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatCUP } from '../utils/formatCurrency'
import { formatDate, todayISO } from '../utils/dateHelpers'
import { OUTPUT_TYPES, OUTPUT_TYPE_MAP } from '../constants/outputTypes'
import ProductPicker from '../components/ui/ProductPicker'

const ICON_MAP = { AlertTriangle, Home, HelpCircle, PackageX }

function TypeButton({ type, selected, onClick }) {
  const Icon = ICON_MAP[type.icon] || PackageMinus
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
        selected
          ? `${type.bgColor} ${type.textColor} border-current`
          : 'bg-slate-50 text-slate-500 border-transparent'
      }`}
    >
      <Icon size={18} />
      <span className="text-center leading-tight">{type.label}</span>
    </button>
  )
}

export default function Outputs() {
  const { products, outputs, addOutput, deleteOutput } = useApp()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [form, setForm] = useState({
    productId: '', quantity: '', type: 'damaged', notes: '', date: todayISO(),
  })
  const [submitting, setSubmitting] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.productId || !form.quantity) return
    const product = products.find(p => p.id === Number(form.productId))
    if (!product) return
    if (Number(form.quantity) > product.stock) {
      alert(`Stock insuficiente. Solo hay ${product.stock} ${product.unit} disponibles.`)
      return
    }
    setSubmitting(true)
    await addOutput({
      productId: Number(form.productId),
      quantity:  Number(form.quantity),
      type:      form.type,
      notes:     form.notes,
      date:      form.date,
    })
    setForm({ productId: '', quantity: '', type: 'damaged', notes: '', date: todayISO() })
    setSubmitting(false)
  }

  // Group output types
  const groups = [
    { label: 'Pérdidas',  types: OUTPUT_TYPES.filter(t => t.group === 'loss') },
    { label: 'Personal',  types: OUTPUT_TYPES.filter(t => t.group === 'personal') },
  ]

  return (
    <>
      <Header title="Salidas" subtitle="Pérdidas y mermas de inventario" />
      <PageWrapper>
        <div className="space-y-5">

          {/* Info banner */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Esta sección es para registrar <strong>pérdidas de inventario</strong>: productos dañados, robos o consumo personal.
              Para ventas usa el módulo <strong>Ventas</strong>.
            </p>
          </div>

          <div className="card">
            <p className="section-title mb-4">Registrar pérdida</p>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Loss type selector */}
              <div>
                <label className="field-label mb-2 block">Tipo de pérdida *</label>
                {groups.map(g => (
                  <div key={g.label} className="mb-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{g.label}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {g.types.map(t => (
                        <TypeButton key={t.value} type={t} selected={form.type === t.value} onClick={() => set('type', t.value)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

           <ProductPicker
  label="Producto *"
  value={form.productId}
  onChange={v => set('productId', v)}
  products={products.filter(p => p.stock > 0)}
/>

              <div>
                <label className="field-label">Cantidad *</label>
                <input className="field-input" type="number" placeholder="0" min="1"
                  value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
              </div>

              <div>
                <label className="field-label">Fecha</label>
                <input className="field-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Notas (opcional)</label>
                <input className="field-input" placeholder="Descripción de la pérdida..." value={form.notes}
                  onChange={e => set('notes', e.target.value)} />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary">
                <PackageMinus size={18} />
                {submitting ? 'Registrando...' : 'Registrar pérdida'}
              </button>
            </form>
          </div>

          <div>
            <p className="section-title mb-3">Historial de pérdidas ({outputs.length})</p>
            {outputs.length === 0 ? (
              <div className="empty-state">
                <PackageMinus size={36} className="mb-2" />
                <p className="text-sm">Sin pérdidas registradas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {outputs.map(output => {
                  const product = products.find(p => p.id === output.productId)
                  const typeInfo = OUTPUT_TYPE_MAP[output.type] || {}
                  const isOpen  = expanded === output.id
                  const Icon    = ICON_MAP[typeInfo.icon] || PackageMinus
                  return (
                    <div key={output.id} className="card p-0 overflow-hidden">
                      <button className="w-full flex items-center gap-3 p-4 text-left"
                        onClick={() => setExpanded(isOpen ? null : output.id)}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.bgColor || 'bg-slate-100'}`}>
                          <Icon size={18} className={typeInfo.textColor || 'text-slate-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{product?.name || 'Producto eliminado'}</p>
                          <p className="text-xs text-slate-400">{output.quantity} {product?.unit || 'un'} · {typeInfo.label || output.type}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400">{formatDate(output.date)}</span>
                          {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-slate-50 space-y-2 animate-fade-in">
                          {product && (
                            <div className="flex justify-between text-sm pt-3">
                              <span className="text-slate-500">Valor perdido</span>
                              <span className="font-medium text-red-600">{formatCUP(output.quantity * (product.costPrice || 0))}</span>
                            </div>
                          )}
                          {output.notes && <p className="text-xs text-slate-400 italic pt-1">{output.notes}</p>}
                          <button onClick={() => setDeleteTarget(output)}
                            className="flex items-center gap-1.5 text-xs text-red-500 font-medium pt-1">
                            <Trash2 size={13} /> Eliminar salida
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
        onConfirm={() => deleteOutput(deleteTarget.id)}
        title="Eliminar pérdida"
        message="Al eliminar esta pérdida se devolverá el stock al producto. ¿Continuar?"
      />
    </>
  )
}
