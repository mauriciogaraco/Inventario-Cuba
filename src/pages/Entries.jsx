// src/pages/Entries.jsx

import { useState, useMemo } from 'react'
import {
  PackagePlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react'

import { useApp } from '../context/AppContext'

import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import ConfirmDialog from '../components/ui/ConfirmDialog'

import SelectPremium from '../components/ui/SelectPremium'
import NumberInputPremium from '../components/ui/NumberInputPremium'

import { formatCUP } from '../utils/formatCurrency'
import { formatDate, todayISO } from '../utils/dateHelpers'

import {
  PRODUCT_CATEGORIES,
} from '../constants/categories'

export default function Entries({ embedded = false }) {
  const {
    products,
    entries,
    addEntry,
    deleteEntry,
    addProduct,
  } = useApp()

  const [deleteTarget, setDeleteTarget] = useState(null)

  const [form, setForm] = useState({
    productName: '',
    category: PRODUCT_CATEGORIES[0],

    quantity: '',
    totalCost: '',
    salePrice: '',
    minStock: '10',

    supplier: '',
    date: todayISO(),
    notes: '',
  })

  const [submitting, setSubmitting] =
    useState(false)

  const [expanded, setExpanded] =
    useState(null)

  const set = (k, v) =>
    setForm(f => ({
      ...f,
      [k]: v,
    }))

  const existingProduct = useMemo(() => {
    return products.find(
      p =>
        p.name.trim().toLowerCase() ===
        form.productName
          .trim()
          .toLowerCase()
    )
  }, [products, form.productName])

  async function handleSubmit(e) {
    e.preventDefault()

    if (
      !form.productName ||
      !form.quantity ||
      !form.totalCost ||
      !form.salePrice
    ) {
      return
    }

    setSubmitting(true)

    let productId = existingProduct?.id

    // Crear producto automáticamente
    if (!existingProduct) {
      const newProduct = {
        name: form.productName.trim(),
        category: form.category,

        stock: 0,
        minStock: Number(form.minStock),

        costPrice:
          Number(form.totalCost) /
          Number(form.quantity),

        salePrice:
          Number(form.salePrice),
      }

      const created =
       await addProduct(newProduct)

      if (created?.id) {
        productId = created.id
      } else {
        const found = products.find(
          p =>
            p.name
              .trim()
              .toLowerCase() ===
            form.productName
              .trim()
              .toLowerCase()
        )

        if (found) {
          productId = found.id
        }
      }
    }

    // fallback extra
    if (!productId) {
      const found = products.find(
        p =>
          p.name.trim().toLowerCase() ===
          form.productName
            .trim()
            .toLowerCase()
      )

      if (found) {
        productId = found.id
      }
    }

    await addEntry({
      productId: Number(productId),
      quantity: Number(form.quantity),
      totalCost: Number(form.totalCost),
      supplier: form.supplier,
      date: form.date,
      notes: form.notes,
    })

    setForm({
      productName: '',
      category: PRODUCT_CATEGORIES[0],

      quantity: '',
      totalCost: '',
      salePrice: '',
      minStock: '10',

      supplier: '',
      date: todayISO(),
      notes: '',
    })

    setSubmitting(false)
  }

  const unitCost =
    form.quantity && form.totalCost
      ? (
          Number(form.totalCost) /
          Number(form.quantity)
        ).toFixed(2)
      : null

  const estimatedMargin =
    form.salePrice && unitCost
      ? (
          ((Number(form.salePrice) -
            Number(unitCost)) /
            Number(unitCost)) *
          100
        ).toFixed(0)
      : null

  const content = (
    <div className="space-y-5">

      {/* Formulario */}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Plus
              size={18}
              className="text-blue-600"
            />
          </div>

          <div>
            <p className="section-title">
              Nueva entrada
            </p>

            <p className="text-xs text-slate-400">
              Crear producto + agregar stock
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Nombre */}

          <div>
            <label className="field-label">
              Nombre del producto *
            </label>

            <input
              className="field-input"
              placeholder="Ej: Saco de arroz"
              value={form.productName}
              onChange={e =>
                set(
                  'productName',
                  e.target.value
                )
              }
              required
            />

            {existingProduct && (
              <p className="text-xs text-blue-600 mt-1">
                Producto existente detectado.
                Se añadirá stock automáticamente.
              </p>
            )}
          </div>

          {/* Categoría */}

          {!existingProduct && (
            <SelectPremium
              label="Categoría"
              value={form.category}
              onChange={v =>
                set('category', v)
              }
              options={PRODUCT_CATEGORIES.map(
                c => ({
                  value: c,
                  label: c,
                })
              )}
            />
          )}

          {/* Cantidad + costo */}

          <div className="grid grid-cols-2 gap-3">
            <NumberInputPremium
              label="Cantidad *"
              value={form.quantity}
              onChange={v =>
                set('quantity', v)
              }
              min={1}
            />

            <NumberInputPremium
              label="Costo total (CUP) *"
              value={form.totalCost}
              onChange={v =>
                set('totalCost', v)
              }
              min={0}
              step={10}
            />
          </div>

          {/* Precio venta + stock mínimo */}

          {!existingProduct && (
            <div className="grid grid-cols-2 gap-3">

              <NumberInputPremium
                label="Precio de venta *"
                value={form.salePrice}
                onChange={v =>
                  set('salePrice', v)
                }
                min={0}
                step={10}
              />

              <NumberInputPremium
                label="Stock mínimo"
                value={form.minStock}
                onChange={v =>
                  set('minStock', v)
                }
                min={0}
              />
            </div>
          )}

          {/* Costos */}

          {unitCost && (
            <div className="bg-blue-50 rounded-2xl px-4 py-3 text-sm text-blue-700 space-y-2">
              <div className="flex items-center justify-between">
                <span>
                  Costo por unidad
                </span>

                <strong>
                  {formatCUP(unitCost)}
                </strong>
              </div>

              {estimatedMargin &&
                !existingProduct && (
                  <div className="flex items-center justify-between">
                    <span>
                      Margen estimado
                    </span>

                    <strong>
                      {estimatedMargin}%
                    </strong>
                  </div>
                )}
            </div>
          )}

          {/* Proveedor */}

          <div>
            <label className="field-label">
              Proveedor
            </label>

            <input
              className="field-input"
              placeholder="Ej: Almacén Central"
              value={form.supplier}
              onChange={e =>
                set(
                  'supplier',
                  e.target.value
                )
              }
            />
          </div>

          {/* Fecha */}

          <div>
            <label className="field-label">
              Fecha
            </label>

            <input
              className="field-input"
              type="date"
              value={form.date}
              onChange={e =>
                set(
                  'date',
                  e.target.value
                )
              }
            />
          </div>

          {/* Notas */}

          <div>
            <label className="field-label">
              Notas (opcional)
            </label>

            <textarea
              className="field-input min-h-[90px] resize-none py-3"
              placeholder="Observaciones..."
              value={form.notes}
              onChange={e =>
                set(
                  'notes',
                  e.target.value
                )
              }
            />
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            <PackagePlus size={18} />

            {submitting
              ? 'Registrando...'
              : existingProduct
              ? 'Agregar stock'
              : 'Crear producto y agregar stock'}
          </button>
        </form>
      </div>

      {/* Historial */}

      <div>
        <p className="section-title mb-3">
          Historial ({entries.length})
        </p>

        {entries.length === 0 ? (
          <div className="empty-state">
            <PackagePlus
              size={36}
              className="mb-2"
            />

            <p className="text-sm">
              Sin entradas registradas
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => {
              const product =
                products.find(
                  p =>
                    p.id ===
                    entry.productId
                )

              const isOpen =
                expanded === entry.id

              return (
                <div
                  key={entry.id}
                  className="card p-0 overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() =>
                      setExpanded(
                        isOpen
                          ? null
                          : entry.id
                      )
                    }
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <PackagePlus
                        size={18}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {product?.name ||
                          'Producto eliminado'}
                      </p>

                      <p className="text-xs text-slate-400">
                        {entry.quantity} un
                        {' · '}
                        {formatCUP(
                          entry.totalCost
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">
                        {formatDate(
                          entry.date
                        )}
                      </span>

                      {isOpen ? (
                        <ChevronUp
                          size={15}
                          className="text-slate-400"
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          className="text-slate-400"
                        />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-slate-50 space-y-2 animate-fade-in">

                      {entry.supplier && (
                        <div className="flex justify-between text-sm pt-3">
                          <span className="text-slate-500">
                            Proveedor
                          </span>

                          <span className="font-medium">
                            {entry.supplier}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Costo/unidad
                        </span>

                        <span className="font-medium">
                          {formatCUP(
                            entry.totalCost /
                              entry.quantity
                          )}
                        </span>
                      </div>

                      {entry.notes && (
                        <p className="text-xs text-slate-400 italic">
                          {entry.notes}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget(
                            entry
                          )
                        }
                        className="flex items-center gap-1.5 text-xs text-red-500 font-medium pt-1"
                      >
                        <Trash2 size={13} />
                        Eliminar entrada
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
  )

  return (
    <>
      {!embedded && (
        <Header
          title="Entradas"
          subtitle="Registrar mercancía"
        />
      )}

      {embedded ? (
        content
      ) : (
        <PageWrapper>
          {content}
        </PageWrapper>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() =>
          setDeleteTarget(null)
        }
        onConfirm={() =>
          deleteEntry(deleteTarget.id)
          
        }
        title="Eliminar entrada"
        message="Al eliminar esta entrada se restará el stock del producto. ¿Continuar?"
      />
    </>
  )
}