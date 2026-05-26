// src/components/sales/SaleHistoryCard.jsx
// Expandable card showing one completed sale from history.
import { useState } from 'react'
import { ChevronDown, ChevronUp, ShoppingCart, User, Trash2, Package } from 'lucide-react'
import { formatCUP } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dateHelpers'

export default function SaleHistoryCard({ sale, products, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const productMap   = Object.fromEntries(products.map(p => [p.id, p]))
  const itemCount    = (sale.items || []).reduce((s, i) => s + i.quantity, 0)
  const productCount = (sale.items || []).length

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header row — always visible */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-slate-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <ShoppingCart size={18} className="text-green-600" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">
              {sale.customerName || 'Venta'}
            </p>
            {sale.customerName && (
              <User size={11} className="text-slate-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {productCount} producto{productCount !== 1 ? 's' : ''} · {itemCount} unid.
          </p>
        </div>

        {/* Amount + date + chevron */}
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-sm font-bold text-green-700">{formatCUP(sale.total)}</span>
          <span className="text-xs text-slate-400">{formatDate(sale.date)}</span>
        </div>
        <div className="ml-1 shrink-0 text-slate-400">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Expandable detail */}
      {expanded && (
        <div className="border-t border-slate-50 px-4 pb-4 animate-fade-in">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3 mb-2">
            Productos
          </p>
          <div className="space-y-2">
            {(sale.items || []).map((item, idx) => {
              const product = productMap[item.productId]
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <Package size={12} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {product?.name || item.productName || 'Producto'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.quantity} × {formatCUP(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {formatCUP(item.subtotal)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Totals line */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Total</span>
            <span className="text-sm font-bold text-green-700">{formatCUP(sale.total)}</span>
          </div>

          {/* Notes */}
          {sale.notes && (
            <p className="text-xs text-slate-400 italic mt-2">{sale.notes}</p>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(sale.id)}
            className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-3"
          >
            <Trash2 size={13} />
            Eliminar venta
          </button>
        </div>
      )}
    </div>
  )
}
