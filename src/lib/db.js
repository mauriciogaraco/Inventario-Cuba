// src/lib/db.js
// Dexie.js — IndexedDB abstraction layer
// Version history:
//   v1 — initial schema
//   v2 — added `createdAt` index to `movements` for orderBy support
//   v3 — added `sales` table for multi-item POS transactions

import Dexie from 'dexie'

export const db = new Dexie('InventarioCubaDB')

// v1 kept for migration continuity
db.version(1).stores({
  products:  '++id, name, category, createdAt',
  entries:   '++id, productId, date, supplier',
  outputs:   '++id, productId, date, type',
  expenses:  '++id, category, date',
  settings:  'key',
  movements: '++id, date',
})

// v2 — movements.createdAt now indexed so we can sort by it
db.version(2).stores({
  products:  '++id, name, category, createdAt',
  entries:   '++id, productId, date, supplier',
  outputs:   '++id, productId, date, type',
  expenses:  '++id, category, date',
  settings:  'key',
  movements: '++id, date, createdAt',
})

// v3 — dedicated sales table for multi-item POS transactions
db.version(3).stores({
  products:  '++id, name, category, createdAt',
  entries:   '++id, productId, date, supplier',
  outputs:   '++id, productId, date, type',
  expenses:  '++id, category, date',
  settings:  'key',
  movements: '++id, date, createdAt',
  sales:     '++id, date, createdAt, customerName',
})

export default db
