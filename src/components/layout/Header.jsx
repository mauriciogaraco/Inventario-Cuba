// src/components/layout/Header.jsx
import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'


export default function Header({ title, subtitle, actions }) {
  const navigate = useNavigate()


  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <button
            onClick={() => navigate('/ajustes')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
