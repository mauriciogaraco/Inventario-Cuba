// src/components/sales/SaleCart.jsx

import {
  Minus,
  Plus,
  Trash2,
  Package,
  AlertTriangle,
} from 'lucide-react'

import { formatCUP } from '../../utils/formatCurrency'

function CartItem({
  item,
  product,
  onQtyChange,
  onRemove,
}) {
  const currentStock = Number(product?.stock ?? 0)

  // stock real disponible + cantidad ya reservada
  const maxQty =
    currentStock + Number(item.quantity)

  const atMax =
    item.quantity >= maxQty

  const atMin =
    item.quantity <= 1

  const stockExceeded =
    item.quantity > currentStock

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-50/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex gap-3">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100">
          <Package
            size={20}
            className="text-primary-700"
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {item.productName}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  {formatCUP(item.unitPrice)} c/u
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-300" />

                <span>
                  Stock: {currentStock}
                </span>
              </div>
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() =>
                onRemove(item.productId)
              }
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-95"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Warning */}
          {stockExceeded && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              <AlertTriangle size={14} />
              <span>
                Solo quedan {currentStock}{' '}
                disponibles
              </span>
            </div>
          )}

          {/* Bottom */}
          <div className="mt-4 flex items-center justify-between gap-3">
            {/* Qty controls */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                disabled={atMin}
                onClick={() =>
                  onQtyChange(
                    item.productId,
                    item.quantity - 1
                  )
                }
                className={`
                  flex h-8 w-8 items-center justify-center rounded-lg transition-all
                  ${
                    atMin
                      ? 'cursor-not-allowed text-slate-300'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm active:scale-95'
                  }
                `}
              >
                <Minus size={15} />
              </button>

              <div className="min-w-[42px] text-center">
                <span className="text-sm font-bold text-slate-900">
                  {item.quantity}
                </span>
              </div>

              <button
                type="button"
                disabled={atMax}
                onClick={() =>
                  onQtyChange(
                    item.productId,
                    item.quantity + 1
                  )
                }
                className={`
                  flex h-8 w-8 items-center justify-center rounded-lg transition-all
                  ${
                    atMax
                      ? 'cursor-not-allowed text-slate-300'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200 active:scale-95'
                  }
                `}
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Subtotal
              </p>

              <p className="text-base font-bold text-slate-900">
                {formatCUP(item.subtotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SaleCart({
  cartItems,
  products,
  onQtyChange,
  onRemove,
}) {
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
          <Package
            size={30}
            className="text-slate-300"
          />
        </div>

        <p className="text-sm font-semibold text-slate-700">
          El carrito está vacío
        </p>

        <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-slate-400">
          Busca productos y agrégalos a la
          venta para comenzar
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cartItems.map(item => {
        const product = products.find(
          p => p.id === item.productId
        )

        return (
          <CartItem
            key={item.productId}
            item={item}
            product={product}
            onQtyChange={onQtyChange}
            onRemove={onRemove}
          />
        )
      })}
    </div>
  )
}