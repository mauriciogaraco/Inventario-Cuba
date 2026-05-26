// src/constants/expenseCategories.js

export const EXPENSE_CATEGORIES = [
  { value: 'transport',  label: 'Transporte',      icon: 'Truck',       color: 'blue'   },
  { value: 'salary',     label: 'Salarios',         icon: 'Users',       color: 'green'  },
  { value: 'fuel',       label: 'Combustible',      icon: 'Fuel',        color: 'amber'  },
  { value: 'rent',       label: 'Alquiler',         icon: 'Building2',   color: 'violet' },
  { value: 'utilities',  label: 'Servicios',        icon: 'Zap',         color: 'yellow' },
  { value: 'packaging',  label: 'Embalaje',         icon: 'Package',     color: 'orange' },
  { value: 'other',      label: 'Otros gastos',     icon: 'MoreHorizontal', color: 'gray' },
]

export const EXPENSE_CAT_MAP = Object.fromEntries(
  EXPENSE_CATEGORIES.map(c => [c.value, c])
)
