import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  SlidersHorizontal,
  X,
  PackagePlus,
  Boxes,
} from 'lucide-react'

import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import SelectPremium from '../components/ui/SelectPremium'
import Entries from './Entries'

import { formatCUP } from '../utils/formatCurrency'
import { PRODUCT_CATEGORIES } from '../constants/categories'

// ── Stock badge ─────────────────────────────────────────────────────────────

function StockBadge({ stock, minStock }) {
  if (stock <= 0) {
    return <span className="badge-red">Sin stock</span>
  }

  if (stock <= minStock) {
    return (
      <span className="badge-yellow">
        {stock}
      </span>
    )
  }

  return (
    <span className="badge-green">
      {stock}
    </span>
  )
}

// ── Product Form ────────────────────────────────────────────────────────────

function ProductForm({
  initial,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(
    initial || {
      name: '',
      category: PRODUCT_CATEGORIES[0],
      costPrice: '',
      salePrice: '',
      stock: '',
      minStock: '10',
    }
  )

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.name.trim()) return

    onSave({
      ...form,
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      stock: Number(form.stock),
      minStock: Number(form.minStock),
    })

    onClose()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="field-label">
          Nombre del producto *
        </label>

        <input
          className="field-input"
          placeholder="Ej: Saco de arroz"
          value={form.name}
          onChange={e =>
            set('name', e.target.value)
          }
          required
        />
      </div>

      <div>
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">
            Precio de costo (CUP)
          </label>

          <input
            className="field-input"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={form.costPrice}
            onChange={e =>
              set(
                'costPrice',
                e.target.value
              )
            }
            required
          />
        </div>

        <div>
          <label className="field-label">
            Precio de venta (CUP)
          </label>

          <input
            className="field-input"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={form.salePrice}
            onChange={e =>
              set(
                'salePrice',
                e.target.value
              )
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">
            Stock actual
          </label>

          <input
            className="field-input"
            type="number"
            placeholder="0"
            min="0"
            value={form.stock}
            onChange={e =>
              set('stock', e.target.value)
            }
          />
        </div>

        <div>
          <label className="field-label">
            Mínimo de stock
          </label>

          <input
            className="field-input"
            type="number"
            placeholder="10"
            min="0"
            value={form.minStock}
            onChange={e =>
              set(
                'minStock',
                e.target.value
              )
            }
          />
        </div>
      </div>

      {form.costPrice &&
        form.salePrice && (
          <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
            Margen estimado:{' '}
            <strong>
              {formatCUP(
                Number(form.salePrice) -
                  Number(
                    form.costPrice
                  )
              )}
            </strong>{' '}
            por unidad
          </div>
        )}

      <button
        type="submit"
        className="btn-primary"
      >
        {initial
          ? 'Guardar cambios'
          : 'Agregar producto'}
      </button>
    </form>
  )
}

// ── Adjust Stock Modal ──────────────────────────────────────────────────────

function AdjustStockModal({
  product,
  onClose,
  onSave,
}) {
  const [newStock, setNewStock] =
    useState(product?.stock ?? 0)

  function handle(e) {
    e.preventDefault()

    onSave(Number(newStock))

    onClose()
  }

  return (
    <form
      onSubmit={handle}
      className="space-y-4"
    >
      <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
        Stock actual:{' '}
        <strong>
          {product?.stock}
        </strong>
      </div>

      <div>
        <label className="field-label">
          Nuevo stock
        </label>

        <input
          className="field-input text-lg font-bold"
          type="number"
          min="0"
          value={newStock}
          onChange={e =>
            setNewStock(e.target.value)
          }
          autoFocus
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
      >
        Actualizar stock
      </button>
    </form>
  )
}

// ── Product Card ────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
  onDelete,
  onAdjust,
}) {
  const margin = (
    ((product.salePrice -
      product.costPrice) /
      product.costPrice) *
    100
  ).toFixed(0)

  return (
    <div className="card animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {product.name}
          </p>

          <p className="text-xs text-slate-400">
            {product.category}
          </p>
        </div>

        <StockBadge
          stock={product.stock}
          minStock={product.minStock}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-slate-50 rounded-xl p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">
            Costo
          </p>

          <p className="text-sm font-bold text-slate-700">
            ${product.costPrice}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">
            Venta
          </p>

          <p className="text-sm font-bold text-slate-700">
            ${product.salePrice}
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">
            Margen
          </p>

          <p className="text-sm font-bold text-green-700">
            {margin}%
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() =>
            onAdjust(product)
          }
          className="flex-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium py-2 active:bg-blue-100 flex items-center justify-center gap-1"
        >
          <SlidersHorizontal size={13} />
          Ajustar
        </button>

        <button
          onClick={() => onEdit(product)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200"
        >
          <Edit2 size={14} />
        </button>

        <button
          onClick={() =>
            onDelete(product)
          }
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 active:bg-red-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Main Inventory Page ─────────────────────────────────────────────────────

export default function Inventory() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  } = useApp()

  const [search, setSearch] =
    useState('')

  const [catFilter, setCat] =
    useState('')

  const [tab, setTab] =
    useState('inventory')

  const [addOpen, setAddOpen] =
    useState(false)

  const [editProd, setEditProd] =
    useState(null)

  const [
    deleteProd,
    setDeleteProd,
  ] = useState(null)

  const [
    adjustProd,
    setAdjustProd,
  ] = useState(null)

  const filtered = useMemo(() => {
    let list = products

    if (search) {
      list = list.filter(p =>
        p.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
    }

    if (catFilter) {
      list = list.filter(
        p => p.category === catFilter
      )
    }

    return list.sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [products, search, catFilter])

  const lowCount = products.filter(
    p => p.stock <= p.minStock
  ).length

  return (
    <>
      <Header
        title="Inventario"
        subtitle={`${products.length} productos`}
      />

      <PageWrapper>
        <div className="space-y-4">

          {/* Tabs */}

          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() =>
                setTab('inventory')
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition
                ${
                  tab === 'inventory'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500'
                }`}
            >
              <Boxes size={16} />
              Inventario
            </button>

            <button
              onClick={() =>
                setTab('entries')
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition
                ${
                  tab === 'entries'
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-500'
                }`}
            >
              <PackagePlus size={16} />
              Entradas
            </button>
          </div>

          {/* Entries */}

          {tab === 'entries' ? (
            <Entries embedded />
          ) : (
            <>
              {/* Search */}

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="field-input pl-9"
                  placeholder="Buscar producto..."
                  value={search}
                  onChange={e =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch('')
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Categories */}

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setCat('')}
                  className={`shrink-0 tab-pill ${
                    !catFilter
                      ? 'tab-pill-active'
                      : 'tab-pill-inactive'
                  }`}
                >
                  Todos
                </button>

                {PRODUCT_CATEGORIES.map(
                  c => (
                    <button
                      key={c}
                      onClick={() =>
                        setCat(
                          c === catFilter
                            ? ''
                            : c
                        )
                      }
                      className={`shrink-0 tab-pill ${
                        catFilter === c
                          ? 'tab-pill-active'
                          : 'tab-pill-inactive'
                      }`}
                    >
                      {c.split(' ')[0]}
                    </button>
                  )
                )}
              </div>

              {/* Low stock */}

              {lowCount > 0 &&
                !search && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <Package
                      size={15}
                      className="text-amber-600 shrink-0"
                    />

                    <p className="text-xs text-amber-700 font-medium">
                      {lowCount} producto
                      {lowCount > 1
                        ? 's'
                        : ''}{' '}
                      con stock bajo
                      o agotado
                    </p>
                  </div>
                )}

              {/* Products */}

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <Package
                    size={40}
                    className="mb-3"
                  />

                  <p className="text-sm font-medium">
                    No se encontraron
                    productos
                  </p>

                  <p className="text-xs mt-1">
                    Agrega tu primer
                    producto con el botón +
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onEdit={
                        setEditProd
                      }
                      onDelete={
                        setDeleteProd
                      }
                      onAdjust={
                        setAdjustProd
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>

      {/* FAB */}

      {tab === 'inventory' && (
        <button
          className="fab"
          onClick={() =>
            setAddOpen(true)
          }
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add modal */}

      <Modal
        open={addOpen}
        onClose={() =>
          setAddOpen(false)
        }
        title="Agregar producto"
      >
        <ProductForm
          onSave={addProduct}
          onClose={() =>
            setAddOpen(false)
          }
        />
      </Modal>

      {/* Edit modal */}

      <Modal
        open={!!editProd}
        onClose={() =>
          setEditProd(null)
        }
        title="Editar producto"
      >
        {editProd && (
          <ProductForm
            initial={editProd}
            onSave={data =>
              updateProduct(
                editProd.id,
                data
              )
            }
            onClose={() =>
              setEditProd(null)
            }
          />
        )}
      </Modal>

      {/* Adjust modal */}

      <Modal
        open={!!adjustProd}
        onClose={() =>
          setAdjustProd(null)
        }
        title={`Ajustar stock — ${adjustProd?.name}`}
      >
        {adjustProd && (
          <AdjustStockModal
            product={adjustProd}
            onSave={newStock =>
              adjustStock(
                adjustProd.id,
                newStock
              )
            }
            onClose={() =>
              setAdjustProd(null)
            }
          />
        )}
      </Modal>

      {/* Delete confirm */}

      <ConfirmDialog
        open={!!deleteProd}
        onClose={() =>
          setDeleteProd(null)
        }
        onConfirm={() =>
          deleteProduct(
            deleteProd.id
          )
        }
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${deleteProd?.name}"? Esta acción no se puede deshacer.`}
      />
    </>
  )
}