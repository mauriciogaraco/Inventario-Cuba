// src/services/storage.js
// Abstract storage service — all DB access goes through here.
// Swap db import to migrate to a different backend.

import { db } from '../lib/db'

// ─── Products ──────────────────────────────────────────────────────────────

export const ProductService = {
  async getAll() {
    return db.products.orderBy('name').toArray()
  },
  async add(product) {
    const id = await db.products.add({ ...product, createdAt: new Date().toISOString() })
    return { ...product, id }
  },
  async update(id, changes) {
    await db.products.update(id, changes)
  },
  async remove(id) {
    await db.products.delete(id)
  },
  async adjustStock(id, delta) {
    const product = await db.products.get(id)
    if (!product) return
    const newStock = Math.max(0, (Number(product.stock) || 0) + delta)
    await db.products.update(id, { stock: newStock })
  },
}

// ─── Entries (incoming inventory) ───────────────────────────────────────────

export const EntryService = {
  async getAll() {
    return db.entries.orderBy('date').reverse().toArray()
  },
  async add(entry) {
    // Also update product stock
    await ProductService.adjustStock(entry.productId, +Number(entry.quantity))
    const id = await db.entries.add({ ...entry, createdAt: new Date().toISOString() })
    // Log movement
    await db.movements.add({
      type: 'entry',
      productId: entry.productId,
      quantity: entry.quantity,
      date: entry.date,
      note: entry.notes || '',
      createdAt: new Date().toISOString(),
    })
    return id
  },
  async remove(id) {
    const entry = await db.entries.get(id)
    if (entry) {
      await ProductService.adjustStock(entry.productId, -Number(entry.quantity))
    }
    await db.entries.delete(id)
  },
}

// ─── Outputs (losses only — damaged, theft, personal, other) ─────────────────

export const OutputService = {
  async getAll() {
    return db.outputs.orderBy('date').reverse().toArray()
  },
  async add(output) {
    // Deduct from product stock
    await ProductService.adjustStock(output.productId, -Number(output.quantity))
    const id = await db.outputs.add({ ...output, createdAt: new Date().toISOString() })
    // Log movement
    await db.movements.add({
      type: 'output',
      outputType: output.type,
      productId: output.productId,
      quantity: output.quantity,
      date: output.date,
      note: output.notes || '',
      createdAt: new Date().toISOString(),
    })
    return id
  },
  async remove(id) {
    const output = await db.outputs.get(id)
    if (output) {
      await ProductService.adjustStock(output.productId, +Number(output.quantity))
    }
    await db.outputs.delete(id)
  },
}

// ─── Sales (multi-item POS transactions) ─────────────────────────────────────

export const SaleService = {
  async getAll() {
    return db.sales.orderBy('createdAt').reverse().toArray()
  },

  /**
   * Process a sale:
   * - Deducts stock for each item
   * - Saves the sale record
   * - Logs a movement per item
   */
  async add(sale) {
    const now = new Date().toISOString()
    // Compute total
    const total = sale.items.reduce((s, item) => s + (Number(item.subtotal) || 0), 0)

    // Deduct stock for each item (in parallel)
    await Promise.all(
      sale.items.map(item =>
        ProductService.adjustStock(item.productId, -Number(item.quantity))
      )
    )

    const id = await db.sales.add({
      ...sale,
      total,
      createdAt: now,
    })

    // Log one movement per line item
    await Promise.all(
      sale.items.map(item =>
        db.movements.add({
          type: 'sale',
          saleId: id,
          productId: item.productId,
          quantity: item.quantity,
          date: sale.date,
          note: sale.notes || '',
          createdAt: now,
        })
      )
    )

    return id
  },

  /** Delete a sale and restore stock for every item */
  async remove(id) {
    const sale = await db.sales.get(id)
    if (sale?.items) {
      await Promise.all(
        sale.items.map(item =>
          ProductService.adjustStock(item.productId, +Number(item.quantity))
        )
      )
    }
    await db.sales.delete(id)
  },
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export const ExpenseService = {
  async getAll() {
    return db.expenses.orderBy('date').reverse().toArray()
  },
  async add(expense) {
    const id = await db.expenses.add({ ...expense, createdAt: new Date().toISOString() })
    return id
  },
  async remove(id) {
    await db.expenses.delete(id)
  },
}

// ─── Settings (key-value) ────────────────────────────────────────────────────

export const SettingsService = {
  async get(key) {
    const record = await db.settings.get(key)
    return record?.value ?? null
  },
  async set(key, value) {
    await db.settings.put({ key, value })
  },
  async remove(key) {
    await db.settings.delete(key)
  },
  async getAll() {
    const records = await db.settings.toArray()
    return Object.fromEntries(records.map(r => [r.key, r.value]))
  },
}

// ─── Movements (recent activity) ─────────────────────────────────────────────

export const MovementService = {
  async getRecent(limit = 20) {
    return db.movements.orderBy('createdAt').reverse().limit(limit).toArray()
  },
}

// ─── Backup & Restore ────────────────────────────────────────────────────────

export const BackupService = {
  async exportAll() {
    const [products, entries, outputs, expenses, sales, settings] = await Promise.all([
      db.products.toArray(),
      db.entries.toArray(),
      db.outputs.toArray(),
      db.expenses.toArray(),
      db.sales.toArray(),
      db.settings.toArray(),
    ])
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      data: { products, entries, outputs, expenses, sales, settings },
    }
  },

  async importAll(backup) {
    if (!backup?.data) throw new Error('Archivo de respaldo inválido')
    const { products, entries, outputs, expenses, sales, settings } = backup.data

    await db.transaction('rw', db.products, db.entries, db.outputs, db.expenses, db.sales, db.settings, db.movements, async () => {
      await db.products.clear()
      await db.entries.clear()
      await db.outputs.clear()
      await db.expenses.clear()
      await db.sales.clear()
      await db.settings.clear()
      await db.movements.clear()

      if (products?.length)  await db.products.bulkAdd(products)
      if (entries?.length)   await db.entries.bulkAdd(entries)
      if (outputs?.length)   await db.outputs.bulkAdd(outputs)
      if (expenses?.length)  await db.expenses.bulkAdd(expenses)
      if (sales?.length)     await db.sales.bulkAdd(sales)
      if (settings?.length)  await db.settings.bulkAdd(settings)
    })
  },
}

