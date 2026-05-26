// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,

  PackageMinus,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react'

import { useApp } from '../../context/AppContext'

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, label: 'Inicio' },
  { to: '/ventas',     icon: ShoppingCart,    label: 'Ventas' },
  { to: '/inventario', icon: Package,         label: 'Inventario' },
 
  { to: '/salidas',    icon: PackageMinus,    label: 'Salidas' },
  { to: '/gastos',     icon: DollarSign,      label: 'Gastos' },
  { to: '/analitica',  icon: BarChart3,       label: 'Análisis' },
  { to: '/ajustes',    icon: Settings,        label: 'Ajustes' },
]

export default function Sidebar() {
  const { settings } = useApp()

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-white border-r border-slate-100 fixed left-0 top-0 bottom-0 z-20">
      
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
            <Package size={18} className="text-white" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-tight truncate">
              {settings?.businessName || 'Mi Negocio'}
            </p>

            <p className="text-[10px] text-slate-400">
              Inventario
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          Desarrollado por Mauricio
        </p>
      </div>
    </aside>
  )
}