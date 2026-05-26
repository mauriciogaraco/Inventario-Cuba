// src/components/layout/BottomNav.jsx
// Gastos replaces Análisis in the bottom nav for daily-use accessibility.
// Analytics is still accessible from the sidebar (desktop) and Dashboard link.
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package,ShoppingCart, DollarSign } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, label: 'Inicio'     },
  { to: '/inventario', icon: Package,         label: 'Inventario' },
  
  { to: '/ventas',     icon: ShoppingCart,    label: 'Ventas'     },
  { to: '/gastos',     icon: DollarSign,      label: 'Gastos'     },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-100 lg:hidden">
      <div className="flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
