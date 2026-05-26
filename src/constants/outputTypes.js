// src/constants/outputTypes.js
// NOTE: 'sale' type removed — sales are handled by the dedicated Sales module.
// Outputs now cover ONLY inventory losses.

export const OUTPUT_TYPES = [
  {
    value: 'damaged',
    label: 'Producto dañado',
    group: 'loss',
    groupLabel: 'Pérdida',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
    icon: 'PackageX',
  },
  {
    value: 'theft',
    label: 'Robo / Extravío',
    group: 'loss',
    groupLabel: 'Pérdida',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    dotColor: 'bg-orange-500',
    icon: 'AlertTriangle',
  },
  {
    value: 'other_loss',
    label: 'Otra pérdida',
    group: 'loss',
    groupLabel: 'Pérdida',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
    icon: 'HelpCircle',
  },
  {
    value: 'personal',
    label: 'Consumo personal',
    group: 'personal',
    groupLabel: 'Personal',
    color: 'violet',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
    dotColor: 'bg-violet-500',
    icon: 'Home',
  },
]

export const OUTPUT_TYPE_MAP = Object.fromEntries(OUTPUT_TYPES.map(t => [t.value, t]))

export const LOSS_TYPES = ['damaged', 'theft', 'other_loss', 'personal']

