import { useMemo, useState } from 'react'
import { Search, Package2, Check } from 'lucide-react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function ProductPicker({
  label,
  value,
  onChange,
  products = [],
  placeholder = 'Buscar producto...',
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedProduct = products.find(
    p => String(p.id) === String(value)
  )

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()

    return [...products]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(product => {
        if (!q) return true

        return (
          product.name.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q)
        )
      })
  }, [products, query])

  function handleSelect(productId) {
    onChange(String(productId))
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-1.5 relative">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="
          h-12 w-full rounded-2xl
          border border-slate-200
          bg-white px-4
          text-left text-sm
          shadow-sm transition-all

          hover:border-slate-300
          hover:bg-slate-50/50

          focus:border-primary-500
          focus:ring-4
          focus:ring-primary-100
        "
      >
        {selectedProduct ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800">
                {selectedProduct.name}
              </p>

              <p className="text-[11px] text-slate-400">
                Stock: {selectedProduct.stock}{' '}
                {selectedProduct.unit}
              </p>
            </div>

            <Package2
              size={16}
              className="text-primary-500 shrink-0"
            />
          </div>
        ) : (
          <span className="text-slate-400">
            Seleccionar producto...
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute top-full z-50 mt-2 w-full
            overflow-hidden rounded-2xl
            border border-slate-200
            bg-white shadow-2xl
          "
        >
          {/* Header */}
<div className="border-b border-slate-100 p-3 space-y-3">
  <div className="flex items-center justify-between">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      Seleccionar producto
    </p>

    <button
      type="button"
      onClick={() => {
        setOpen(false)
        setQuery('')
      }}
      className="
        flex items-center justify-center
        w-8 h-8 rounded-lg
        text-slate-400 transition-all

        hover:bg-slate-100
        hover:text-slate-600
      "
    >
      <XMarkIcon size={16} />
    </button>
  </div>

  <div className="relative">
    <Search
      size={15}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />

    <input
      autoFocus
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder={placeholder}
      className="
        h-10 w-full rounded-xl
        border border-slate-200
        bg-slate-50
        pl-9 pr-10
        text-sm outline-none

        focus:border-primary-400
        focus:bg-white
        focus:ring-4
        focus:ring-primary-100
      "
    />

    {query && (
      <button
        type="button"
        onClick={() => setQuery('')}
        className="
          absolute right-3 top-1/2
          -translate-y-1/2
          text-slate-400
          hover:text-slate-600
        "
      >
        <XMarkIcon size={14} />
      </button>
    )}
  </div>
</div>

          {/* Options */}
          <div className="max-h-72 overflow-y-auto p-1.5">
            {filteredProducts.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-slate-400">
                No se encontraron productos
              </div>
            ) : (
              filteredProducts.map(product => {
                const selected =
                  String(product.id) === String(value)

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      handleSelect(product.id)
                    }
                    className={`
                      w-full rounded-xl px-3 py-3
                      text-left transition-all

                      hover:bg-primary-50

                      ${
                        selected
                          ? 'bg-primary-100'
                          : ''
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {product.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>
                            Stock: {product.stock}{' '}
                            {product.unit}
                          </span>

                          {product.category && (
                            <>
                              <span>•</span>

                              <span>
                                {product.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {selected && (
                        <Check
                          size={16}
                          className="text-primary-600 shrink-0"
                        />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}