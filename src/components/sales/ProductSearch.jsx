// src/components/sales/ProductSearch.jsx

import {
  useState,
  useRef,
  useEffect,
  useMemo,
} from 'react'

import {
  Search,
  Package,
  X,
  ShoppingCart,
} from 'lucide-react'

import { formatCUP } from '../../utils/formatCurrency'

export default function ProductSearch({
  products,
  cartProductIds = [],
  onAdd,
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) {
      return products
    }

    return products.filter(
      p =>
        p.name
          .toLowerCase()
          .includes(q) ||
        (p.category || '')
          .toLowerCase()
          .includes(q)
    )
  }, [products, query])

  function handleSelect(product) {
    onAdd(product)

    // NO cerramos el dropdown
    // para permitir seguir agregando productos rápido
    setQuery('')

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  // cerrar al click afuera
  useEffect(() => {
    function handleOutside(e) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutside
      )
    }
  }, [])

  function getStockStyles(stock) {
    if (stock <= 0) {
      return 'bg-red-50 text-red-600 border-red-100'
    }

    if (stock <= 5) {
      return 'bg-amber-50 text-amber-700 border-amber-100'
    }

    return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      {/* INPUT */}
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar producto..."
          className="
            w-full rounded-2xl border border-slate-200
            bg-white py-3 pl-11 pr-10
            text-sm text-slate-900
            shadow-sm transition-all

            placeholder:text-slate-400

            focus:border-primary-400
            focus:outline-none
            focus:ring-4
            focus:ring-primary-100
          "
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="
              absolute right-3 top-1/2 flex h-7 w-7
              -translate-y-1/2 items-center justify-center
              rounded-lg text-slate-400 transition-all
              hover:bg-slate-100 hover:text-slate-600
            "
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* RESULTADOS */}
      {open && (
        <div
          className="
            mt-2 overflow-hidden rounded-3xl
            border border-slate-200
            bg-white shadow-2xl
          "
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Productos
              </p>

              <p className="text-[11px] text-slate-400">
                {filtered.length}{' '}
                resultados
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-xl text-slate-400 transition-all
                hover:bg-slate-100 hover:text-slate-600
              "
            >
              <X size={15} />
            </button>
          </div>

          {/* LISTA */}
          <div
            className="
              max-h-[320px]
              overflow-y-auto
              overscroll-contain
            "
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Package
                    size={24}
                    className="text-slate-400"
                  />
                </div>

                <p className="text-sm font-medium text-slate-700">
                  Sin resultados
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Intenta con otro nombre
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filtered.map(product => {
                  const inCart =
                    cartProductIds.includes(
                      product.id
                    )

                  const outOfStock =
                    Number(product.stock) <= 0

                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() =>
                        handleSelect(product)
                      }
                      className={`
                        mb-2 flex w-full items-center gap-3
                        rounded-2xl border border-transparent
                        px-3 py-3 text-left transition-all
                        last:mb-0

                        ${
                          outOfStock
                            ? 'cursor-not-allowed opacity-50'
                            : `
                              hover:border-slate-200
                              hover:bg-slate-50
                              active:scale-[0.99]
                            `
                        }
                      `}
                    >
                      {/* icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100">
                        <Package
                          size={18}
                          className="text-primary-700"
                        />
                      </div>

                      {/* info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {product.name}
                          </p>

                          {inCart && (
                            <div className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                              <ShoppingCart size={10} />
                              En carrito
                            </div>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>
                            {formatCUP(
                              product.salePrice ||
                                0
                            )}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-slate-300" />

                          <span>
                            {product.category}
                          </span>
                        </div>
                      </div>

                      {/* stock */}
                      <div
                        className={`
                          shrink-0 rounded-xl border px-2.5 py-1
                          text-[11px] font-semibold
                          ${getStockStyles(
                            product.stock
                          )}
                        `}
                      >
                        {product.stock}{' '}
                        {product.unit}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}