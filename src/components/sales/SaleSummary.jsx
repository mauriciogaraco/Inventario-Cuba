// src/components/sales/SaleSummary.jsx
// Live totals bar shown at the bottom of the cart: products, units, total.
import { ShoppingCart } from 'lucide-react'
import { formatCUP } from '../../utils/formatCurrency'

export default function SaleSummary({ cartItems }) {
  const totalProducts = cartItems.length
  const totalUnits    = cartItems.reduce((s, i) => s + i.quantity, 0)
  const total         = cartItems.reduce((s, i) => s + i.subtotal, 0)

  if (totalProducts === 0) return null

  return (
    <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between gap-2">
      {/* Left: counts */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
          <ShoppingCart size={14} className="text-primary-700" />
        </div>
        <div>
          <p className="text-xs text-slate-500">
            {totalProducts} producto{totalProducts !== 1 ? 's' : ''} · {totalUnits} unid.
          </p>
        </div>
      </div>

      {/* Right: total */}
      <div className="text-right">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total</p>
        <p className="text-lg font-bold text-primary-700">{formatCUP(total)}</p>
      </div>
    </div>
  )
}
