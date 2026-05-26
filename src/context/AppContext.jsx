// src/context/AppContext.jsx

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react'

import {
  ProductService,
  EntryService,
  OutputService,
  ExpenseService,
  SettingsService,
  MovementService,
  BackupService,
  SaleService,
} from '../services/storage'

import {
  MOCK_PRODUCTS,
  MOCK_ENTRIES,
  MOCK_OUTPUTS,
  MOCK_EXPENSES,
  MOCK_SETTINGS,
} from '../data/mockData'

import { db } from '../lib/db'

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  products: [],
  entries: [],
  outputs: [],
  expenses: [],
  sales: [],
  movements: [],
  settings: {},
  loading: true,
  unlocked: false,
  toast: null,
}

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_ALL':
      return {
        ...state,
        ...action.payload,
        loading: false,
      }

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      }

    case 'SET_ENTRIES':
      return {
        ...state,
        entries: action.payload,
      }

    case 'SET_OUTPUTS':
      return {
        ...state,
        outputs: action.payload,
      }

    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload,
      }

    case 'SET_SALES':
      return {
        ...state,
        sales: action.payload,
      }

    case 'SET_MOVEMENTS':
      return {
        ...state,
        movements: action.payload,
      }

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      }

    case 'SET_UNLOCKED':
      return {
        ...state,
        unlocked: action.payload,
      }

    case 'SET_TOAST':
      return {
        ...state,
        toast: action.payload,
      }

    default:
      return state
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ───────────────────────────────────────────────────────────────────────────
  // Seed mock data
  // ───────────────────────────────────────────────────────────────────────────

  async function seedIfEmpty() {
    try {
      const seeded = await SettingsService.get('seeded')

      if (seeded) return

      await db.transaction(
        'rw',
        db.products,
        db.entries,
        db.outputs,
        db.expenses,
        db.settings,
        async () => {
          await db.products.bulkPut(MOCK_PRODUCTS)
          await db.entries.bulkPut(MOCK_ENTRIES)
          await db.outputs.bulkPut(MOCK_OUTPUTS)
          await db.expenses.bulkPut(MOCK_EXPENSES)

          for (const [key, value] of Object.entries(MOCK_SETTINGS)) {
            await db.settings.put({ key, value })
          }

          await db.settings.put({
            key: 'seeded',
            value: true,
          })
        }
      )
    } catch (err) {
      console.warn('Seed error:', err)
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Load all data
  // ───────────────────────────────────────────────────────────────────────────

  async function loadAll() {
    try {
      await seedIfEmpty()

      const [
        products,
        entries,
        outputs,
        expenses,
        sales,
        movements,
        settingsArr,
      ] = await Promise.all([
        ProductService.getAll(),
        EntryService.getAll(),
        OutputService.getAll(),
        ExpenseService.getAll(),
        SaleService.getAll(),
        MovementService.getRecent(30),
        db.settings.toArray(),
      ])

      const settings = Object.fromEntries(
        settingsArr.map(item => [item.key, item.value])
      )

      dispatch({
        type: 'LOAD_ALL',
        payload: {
          products,
          entries,
          outputs,
          expenses,
          sales,
          movements,
          settings,
        },
      })
    } catch (err) {
      console.error('Load error:', err)

      dispatch({
        type: 'LOAD_ALL',
        payload: {
          products: [],
          entries: [],
          outputs: [],
          expenses: [],
          sales: [],
          movements: [],
          settings: {},
        },
      })
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // Toast
  // ───────────────────────────────────────────────────────────────────────────

  const showToast = useCallback((message, type = 'success') => {
    dispatch({
      type: 'SET_TOAST',
      payload: { message, type },
    })

    setTimeout(() => {
      dispatch({
        type: 'SET_TOAST',
        payload: null,
      })
    }, 3000)
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // Reload helpers
  // ───────────────────────────────────────────────────────────────────────────

  const reloadProducts = async () => {
    dispatch({
      type: 'SET_PRODUCTS',
      payload: await ProductService.getAll(),
    })
  }

  const reloadEntries = async () => {
    dispatch({
      type: 'SET_ENTRIES',
      payload: await EntryService.getAll(),
    })
  }

  const reloadOutputs = async () => {
    dispatch({
      type: 'SET_OUTPUTS',
      payload: await OutputService.getAll(),
    })
  }

  const reloadExpenses = async () => {
    dispatch({
      type: 'SET_EXPENSES',
      payload: await ExpenseService.getAll(),
    })
  }

  const reloadSales = async () => {
    dispatch({
      type: 'SET_SALES',
      payload: await SaleService.getAll(),
    })
  }

  const reloadMovements = async () => {
    dispatch({
      type: 'SET_MOVEMENTS',
      payload: await MovementService.getRecent(30),
    })
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Product actions
  // ───────────────────────────────────────────────────────────────────────────

  const addProduct = async (product) => {
  const created = await ProductService.add(product)

  await reloadProducts()

  showToast('Producto agregado')

  return created
}

  const updateProduct = async (id, changes) => {
    await ProductService.update(id, changes)

    await reloadProducts()

    showToast('Producto actualizado')
  }

  const deleteProduct = async (id) => {
    await ProductService.remove(id)

    await reloadProducts()

    showToast('Producto eliminado', 'error')
  }

  const adjustStock = async (id, newStock) => {
    await ProductService.update(id, {
      stock: newStock,
    })

    await reloadProducts()

    showToast('Stock ajustado')
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Entry actions
  // ───────────────────────────────────────────────────────────────────────────

  const addEntry = async (entry) => {
    await EntryService.add(entry)

    await reloadProducts()
    await reloadEntries()
    await reloadMovements()

    showToast('Entrada registrada')
  }

  const deleteEntry = async (id) => {
    await EntryService.remove(id)

    await reloadProducts()
    await reloadEntries()
await reloadMovements()
    showToast('Entrada eliminada', 'error')
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Output actions
  // ───────────────────────────────────────────────────────────────────────────

  const addOutput = async (output) => {
    await OutputService.add(output)

    await reloadProducts()
    await reloadOutputs()
    await reloadMovements()

    showToast('Salida registrada')
  }

  const deleteOutput = async (id) => {
    await OutputService.remove(id)

    await reloadProducts()
    await reloadOutputs()
await reloadMovements()
    showToast('Salida eliminada', 'error')
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Sale actions
  // ───────────────────────────────────────────────────────────────────────────

  const addSale = async (sale) => {
    await SaleService.add(sale)

    await reloadProducts()
    await reloadSales()
    await reloadMovements()

    showToast('Venta registrada ✓')
  }

  const deleteSale = async (id) => {
    await SaleService.remove(id)

    await reloadProducts()
    await reloadSales()
await reloadMovements()
    showToast('Venta eliminada', 'error')
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Expense actions
  // ───────────────────────────────────────────────────────────────────────────

  const addExpense = async (expense) => {
    await ExpenseService.add(expense)

    await reloadExpenses()

    showToast('Gasto registrado')
  }

  const deleteExpense = async (id) => {
    await ExpenseService.remove(id)

    await reloadExpenses()

    showToast('Gasto eliminado', 'error')
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Settings
  // ───────────────────────────────────────────────────────────────────────────

  const updateSetting = async (key, value) => {
    await SettingsService.set(key, value)

    const settingsArr = await db.settings.toArray()

    const settings = Object.fromEntries(
      settingsArr.map(item => [item.key, item.value])
    )

    dispatch({
      type: 'SET_SETTINGS',
      payload: settings,
    })
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PIN
  // ───────────────────────────────────────────────────────────────────────────

  const setPin = async (pin) => {
    await updateSetting('pin', pin)

    showToast(pin ? 'PIN configurado' : 'PIN eliminado')
  }

  const unlock = () => {
    dispatch({
      type: 'SET_UNLOCKED',
      payload: true,
    })
  }

  const lock = () => {
    dispatch({
      type: 'SET_UNLOCKED',
      payload: false,
    })
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Backup
  // ───────────────────────────────────────────────────────────────────────────

  const exportBackup = async () => {
    const data = await BackupService.exportAll()

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: 'application/json',
      }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')

    a.href = url
    a.download = `inventario-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`

    a.click()

    URL.revokeObjectURL(url)

    showToast('Respaldo exportado')
  }

  const importBackup = async (file) => {
    const text = await file.text()

    const backup = JSON.parse(text)

    await BackupService.importAll(backup)

    await loadAll()

    showToast('Respaldo restaurado correctamente')
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Context value
  // ───────────────────────────────────────────────────────────────────────────

  const value = {
    ...state,

    // Product
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,

    // Entry
    addEntry,
    deleteEntry,

    // Output
    addOutput,
    deleteOutput,

    // Sale
    addSale,
    deleteSale,

    // Expense
    addExpense,
    deleteExpense,

    // Settings
    updateSetting,

    // PIN
    setPin,
    unlock,
    lock,

    // Backup
    exportBackup,
    importBackup,

    // Toast
    showToast,

    // Reload
    reloadProducts,
    reloadEntries,
    reloadOutputs,
    reloadExpenses,
    reloadSales,
    reloadMovements,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}