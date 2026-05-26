// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { useApp } from './context/AppContext'
import BottomNav from './components/layout/BottomNav'
import Sidebar from './components/layout/Sidebar'
import Toast from './components/ui/Toast'
import PinLock from './components/PinLock'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'

import Outputs from './pages/Outputs'
import Sales from './pages/Sales'
import Expenses from './pages/Expenses'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-card-md">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.29 7 12 12 20.71 7"/>
          <line x1="12" y1="22" x2="12" y2="12"/>
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-600">Cargando...</p>
      <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '60%' }} />
      </div>
    </div>
  )
}

export default function App() {
  const { loading, unlocked, settings } = useApp()

  if (loading) return <LoadingScreen />

  // Show PIN lock if PIN is set and session is not unlocked
  if (settings?.pin && !unlocked) return <PinLock />

  return (
    <div className="min-h-dvh flex">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/ventas"     element={<Sales />} />
          <Route path="/inventario" element={<Inventory />} />
          
          <Route path="/salidas"    element={<Outputs />} />
          <Route path="/gastos"     element={<Expenses />} />
          <Route path="/analitica"  element={<Analytics />} />
          <Route path="/ajustes"    element={<Settings />} />
        </Routes>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Global toast */}
      <Toast />
    </div>
  )
}
