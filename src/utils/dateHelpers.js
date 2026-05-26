// src/utils/dateHelpers.js
import { startOfDay, startOfWeek, startOfMonth, startOfYear,
         endOfDay, format, isWithinInterval, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export const PERIODS = [
  { value: 'day',   label: 'Hoy' },
  { value: 'week',  label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year',  label: 'Año' },
]

export function getPeriodRange(period) {
  const now = new Date()
  switch (period) {
    case 'day':
      return { start: startOfDay(now), end: now }
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now }
    case 'month':
      return { start: startOfMonth(now), end: now }
    case 'year':
      return { start: startOfYear(now), end: now }
    default:
      return { start: startOfMonth(now), end: now }
  }
}

export function isInPeriod(dateStr, period) {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    const { start, end } = getPeriodRange(period)
    return isWithinInterval(date, { start, end })
  } catch {
    return false
  }
}

export function formatDate(dateStr) {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return format(date, 'd MMM yyyy', { locale: es })
  } catch {
    return dateStr || ''
  }
}

export function formatDateShort(dateStr) {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return format(date, 'd/MM', { locale: es })
  } catch {
    return ''
  }
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getLast30Days() {
  const result = []
  for (let i = 29; i >= 0; i--) {
    result.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return result
}

export function groupByDay(items, dateKey = 'date') {
  const map = {}
  items.forEach(item => {
    const day = item[dateKey]?.slice(0, 10) || 'unknown'
    if (!map[day]) map[day] = []
    map[day].push(item)
  })
  return map
}
