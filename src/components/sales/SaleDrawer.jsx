// src/components/sales/SaleDrawer.jsx
// Full-screen slide-up sheet for creating a new sale (mobile-first POS flow).
import { useState, useEffect } from 'react'
import { X, ShoppingCart, User, FileText, Calendar, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import ProductSearch from './ProductSearch'
import SaleCart from './SaleCart'
import SaleSummary from './SaleSummary'
import { todayISO } from '../../utils/dateHelpers'
import { formatCUP } from '../../utils/formatCurrency'

export default function SaleDrawer({ open, onClose }) {
  const { products, addSale } = useApp()

  const [cartItems,    setCartItems]    = useState([])
  const [customerName, setCustomerName] = useState('')
  const [notes,        setNotes]        = useState('')
  const [date,         setDate]         = useState(todayISO())
  const [submitting,   setSubmitting]   = useState(false)
  const [success,      setSuccess]      = useState(false)

  // Reset when drawer opens
  useEffect(() => {
    if (open) {
      setCartItems([])
      setCustomerName('')
      setNotes('')
      setDate(todayISO())
      setSubmitting(false)
      setSuccess(false)
    }
  }, [open])

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Cart helpers ─────────────────────────────────────────────────────────

  function addToCart(product) {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        // Increment qty (stock already validated via disabled state on search)
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        )
      }
      const unitPrice = Number(product.salePrice) || 0
      return [...prev, {
        productId:   product.id,
        productName: product.name,
        unitPrice,
        quantity:    1,
        subtotal:    unitPrice,
      }]
    })
  }

  function changeQty(productId, newQty) {
    setCartItems(prev =>
      prev.map(i =>
        i.productId === productId
          ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice }
          : i
      ).filter(i => i.quantity > 0)
    )
  }

  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(i => i.productId !== productId))
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (cartItems.length === 0) return

    // Stock validation
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId)
      if (!product || item.quantity > Number(product.stock)) {
        alert(`Stock insuficiente para "${item.productName}". Disponibles: ${product?.stock ?? 0}`)
        return
      }
    }

    setSubmitting(true)
    try {
      const total = cartItems.reduce((s, i) => s + i.subtotal, 0)
      await addSale({
        customerName: customerName.trim() || null,
        items:  cartItems,
        total,
        notes:  notes.trim() || null,
        date,
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 900)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const total         = cartItems.reduce((s, i) => s + i.subtotal, 0)
  const cartProductIds = cartItems.map(i => i.productId)
  const canSubmit      = cartItems.length > 0 && !submitting

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl animate-slide-up"
        style={{ maxHeight: '95dvh' }}
      >
        {/* Handle + Header */}
        <div className="flex flex-col items-center pt-3 pb-1 px-4 shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full mb-4" />
          <div className="w-full flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Nueva venta</h2>
              <p className="text-xs text-slate-400 mt-0.5">Agrega productos al carrito</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center active:bg-slate-200 transition-colors"
            >
              <X size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Product search */}
          <div className="w-full">
            <ProductSearch
              products={products}
              cartProductIds={cartProductIds}
              onAdd={addToCart}
            />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">

          {/* Cart */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Carrito {cartItems.length > 0 ? `(${cartItems.length})` : ''}
              </p>
            </div>
            <SaleCart
              cartItems={cartItems}
              products={products}
              onQtyChange={changeQty}
              onRemove={removeFromCart}
            />
          </div>

          {/* Live summary */}
          {cartItems.length > 0 && (
            <div className="mt-3">
              <SaleSummary cartItems={cartItems} />
            </div>
          )}

          {/* Optional fields — always visible */}
          <div className="mt-4 space-y-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Detalles opcionales
            </p>

            {/* Customer name */}
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="relative">
              <FileText size={15} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notas (opcional)"
                rows={2}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Date */}
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bottom spacer so content isn't hidden under the button */}
          <div className="h-4" />
        </div>

        {/* Process sale button — sticky footer */}
        <div className="shrink-0 px-4 pb-safe pt-2 border-t border-slate-100 bg-white">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all
              ${success
                ? 'bg-green-500 text-white'
                : canSubmit
                  ? 'bg-primary-600 text-white active:bg-primary-700 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            {success ? (
              <>
                <CheckCircle size={18} />
                ¡Venta registrada!
              </>
            ) : submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Procesar venta · {cartItems.length > 0 ? formatCUP(total) : '—'}
              </>
            )}
          </button>
          <div className="h-2" />
        </div>
      </div>
    </>
  )
}
