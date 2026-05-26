// src/utils/calcFinancials.js
import { isInPeriod } from './dateHelpers'
import { LOSS_TYPES } from '../constants/outputTypes'

/**
 * Calculate all key financial metrics.
 *
 * DEFINITIONS (for Cuban wholesale context):
 * - Inventory Value    : current stock × cost price (what's on the shelves — NOT period-filtered)
 * - Revenue (Ingresos): sum of sale.total for all Sales records
 * - COGS              : qty × costPrice for each sale line item (only what was sold)
 * - Gross Profit      : Revenue − COGS
 * - Net Profit        : Gross Profit − Expenses  (true profit accounting for cost of sold goods)
 * - Expenses          : sum of all expense records
 * - Loss Value (Merma): qty × costPrice for damaged/theft/personal/other_loss outputs
 * - Cash From Sales   : Revenue − Expenses  (money collected from customers minus operating costs)
 * - Total Business    : Cash From Sales + Inventory Value
 */
export function calcFinancials({ products, entries, outputs, expenses, sales = [], period = 'month' }) {
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  // Filter by period
  const filteredSales    = sales.filter(s   => isInPeriod(s.date, period))
  const filteredOutputs  = outputs.filter(o  => isInPeriod(o.date, period))
  const filteredEntries  = entries.filter(e  => isInPeriod(e.date, period))
  const filteredExpenses = expenses.filter(ex => isInPeriod(ex.date, period))

  // Revenue & COGS — from multi-item Sales
  let revenue   = 0
  let cogs      = 0
  let saleUnits = 0

  filteredSales.forEach(sale => {
    revenue += Number(sale.total) || 0
    ;(sale.items || []).forEach(item => {
      const product = productMap[item.productId]
      const costPrice = Number(product?.costPrice) || 0
      cogs      += Number(item.quantity) * costPrice
      saleUnits += Number(item.quantity) || 0
    })
  })

  // Loss value — from Outputs (losses only)
  let lossValue = 0
  filteredOutputs.forEach(o => {
    const product = productMap[o.productId]
    if (!product) return
    const costPrice = Number(product.costPrice) || 0
    const qty       = Number(o.quantity) || 0
    if (LOSS_TYPES.includes(o.type)) {
      lossValue += qty * costPrice
    }
  })

  const grossProfit    = revenue - cogs
  const totalExpenses  = filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const netProfit      = grossProfit - totalExpenses
  const purchaseInvest = filteredEntries.reduce((s, e) => s + (Number(e.totalCost) || 0), 0)
  // cashFromSales: what you collected from customers minus operating expenses paid.
  // Does NOT deduct inventory purchases — that capital is represented by inventoryValue.
  const cashFromSales  = revenue - totalExpenses

  // Current inventory value (always full — not filtered by period)
  const inventoryValue = products.reduce(
    (s, p) => s + (Number(p.stock) || 0) * (Number(p.costPrice) || 0), 0
  )
  // totalBusiness: liquid cash from sales + capital locked in inventory
  const totalBusiness  = cashFromSales + inventoryValue

  const totalStock = products.reduce((s, p) => s + (Number(p.stock) || 0), 0)

  const lowStockProducts = products.filter(
    p => Number(p.stock) <= Number(p.minStock)
  )

  return {
    inventoryValue,
    revenue,
    cogs,
    grossProfit,
    netProfit,
    totalExpenses,
    lossValue,
    purchaseInvest,
    cashFromSales,
    totalBusiness,
    totalStock,
    saleUnits,
    lowStockProducts,
  }
}

/**
 * Build chart data: daily profit, expenses, losses for the last N days.
 */
export function buildChartData({ outputs, expenses, sales = [], products, days = 30 }) {
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  // Generate last N days
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, profit: 0, expenses: 0, losses: 0, revenue: 0, cogs: 0 })
  }
  const dayMap = Object.fromEntries(result.map(r => [r.date, r]))

  // Revenue from sales
  ;(sales || []).forEach(sale => {
    const day = sale.date?.slice(0, 10)
    if (!dayMap[day]) return
    dayMap[day].revenue += Number(sale.total) || 0
    // COGS per line item
    ;(sale.items || []).forEach(item => {
      const product = productMap[item.productId]
      const cost = Number(product?.costPrice) || 0
      dayMap[day].cogs   += Number(item.quantity) * cost
    })
    dayMap[day].profit = dayMap[day].revenue - dayMap[day].cogs
  })

  // Losses from outputs
  outputs.forEach(o => {
    const day = o.date?.slice(0, 10)
    if (!dayMap[day]) return
    const product = productMap[o.productId]
    if (!product) return
    const qty  = Number(o.quantity) || 0
    const cost = Number(product.costPrice) || 0
    if (LOSS_TYPES.includes(o.type)) {
      dayMap[day].losses += qty * cost
    }
  })

  expenses.forEach(ex => {
    const day = ex.date?.slice(0, 10)
    if (!dayMap[day]) return
    dayMap[day].expenses += Number(ex.amount) || 0
    dayMap[day].profit   -= Number(ex.amount) || 0
  })

  return result
}

/**
 * Top N products by sales units — now uses Sales items array.
 */
export function topProductsBySales(sales = [], products, n = 8) {
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))
  const salesMap = {}
  ;(sales || []).forEach(sale => {
    ;(sale.items || []).forEach(item => {
      if (!salesMap[item.productId]) salesMap[item.productId] = 0
      salesMap[item.productId] += Number(item.quantity) || 0
    })
  })
  return Object.entries(salesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id, units]) => ({
      name: productMap[id]?.name || 'Desconocido',
      units,
    }))
}

/**
 * Loss breakdown by type.
 */
export function lossBreakdown(outputs, products) {
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))
  const map = { damaged: 0, theft: 0, other_loss: 0, personal: 0 }
  outputs.filter(o => LOSS_TYPES.includes(o.type)).forEach(o => {
    const cost = Number(productMap[o.productId]?.costPrice) || 0
    map[o.type] = (map[o.type] || 0) + (Number(o.quantity) || 0) * cost
  })
  return [
    { name: 'Dañado',   value: map.damaged,    color: '#ef4444' },
    { name: 'Robo',     value: map.theft,       color: '#f97316' },
    { name: 'Personal', value: map.personal,    color: '#7c3aed' },
    { name: 'Otro',     value: map.other_loss,  color: '#f59e0b' },
  ].filter(d => d.value > 0)
}

