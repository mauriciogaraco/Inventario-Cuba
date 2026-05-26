// src/utils/formatCurrency.js

/**
 * Format a number as CUP currency.
 * e.g. 12500 → "$12,500.00 CUP"
 */
export function formatCUP(value, options = {}) {
  const { compact = false, showSymbol = true } = options
  const num = Number(value) || 0

  if (compact) {
    if (Math.abs(num) >= 1_000_000) {
      return `${showSymbol ? '$' : ''}${(num / 1_000_000).toFixed(1)}M`
    }
    if (Math.abs(num) >= 1_000) {
      return `${showSymbol ? '$' : ''}${(num / 1_000).toFixed(1)}K`
    }
    return `${showSymbol ? '$' : ''}${num.toFixed(0)}`
  }

  return new Intl.NumberFormat('es-CU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' CUP'
}

/**
 * Short currency for metric cards: $12,500
 */
export function formatCUPShort(value) {
  const num = Number(value) || 0
  return '$' + new Intl.NumberFormat('es-CU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}
