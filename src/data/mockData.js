// src/data/mockData.js
// Realistic mock data for a Cuban wholesale business called "Mayorista La Habana"
// Products priced in CUP, spanning ~3 months of activity.

import { format, subDays, subMonths } from 'date-fns'

function d(daysAgo) {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd')
}

export const MOCK_PRODUCTS = [

]

export const MOCK_ENTRIES = [

]

export const MOCK_OUTPUTS = [

]

export const MOCK_EXPENSES = [

]

export const MOCK_SETTINGS = {
  businessName: 'Inventario-APP',
  pin: null,
  ownerName: '',
  seeded: true,
}
