// src/components/ui/Toast.jsx
import { useApp } from '../../context/AppContext'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function Toast() {
  const { toast } = useApp()
  if (!toast) return null

  const configs = {
    success: { icon: CheckCircle, bg: 'bg-green-600',  text: 'text-white' },
    error:   { icon: XCircle,     bg: 'bg-red-600',    text: 'text-white' },
    warning: { icon: AlertCircle, bg: 'bg-amber-500',  text: 'text-white' },
  }
  const cfg = configs[toast.type] || configs.success
  const Icon = cfg.icon

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5
                    px-4 py-3 rounded-2xl shadow-lg animate-fade-in ${cfg.bg} ${cfg.text}
                    min-w-[200px] max-w-[320px]`}>
      <Icon size={18} className="shrink-0" />
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  )
}
