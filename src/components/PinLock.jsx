// src/components/PinLock.jsx
import { useState, useEffect } from 'react'
import { Package, Delete } from 'lucide-react'
import { useApp } from '../context/AppContext'

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function PinLock() {
  const { settings, unlock } = useApp()
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const storedPin = settings?.pin

  // If no PIN set, auto-unlock
  useEffect(() => {
    if (!storedPin) unlock()
  }, [storedPin])

  function handleDigit(d) {
    if (d === '⌫') {
      setInput(prev => prev.slice(0, -1))
      return
    }
    if (d === '' || input.length >= 4) return
    const next = input + d
    setInput(next)

    if (next.length === 4) {
      if (next === String(storedPin)) {
        unlock()
      } else {
        setAttempts(a => a + 1)
        setShake(true)
        setTimeout(() => { setInput(''); setShake(false) }, 600)
      }
    }
  }

  if (!storedPin) return null

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-card-md">
          <Package size={30} className="text-white" />
        </div>
        <p className="text-lg font-bold text-slate-900">Inventario Cuba</p>
        <p className="text-sm text-slate-500">Ingresa tu PIN para continuar</p>
      </div>

      {/* Dots */}
      <div className={`flex gap-4 mb-10 ${shake ? 'animate-shake' : ''}`}>
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-150 ${
              i < input.length ? 'bg-primary-600 scale-110' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {DIGITS.map((d, i) => {
          if (d === '') return <div key={i} />
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              className={`pin-btn mx-auto ${d === '⌫' ? 'bg-transparent shadow-none text-slate-500' : ''}`}
            >
              {d === '⌫' ? <Delete size={22} /> : d}
            </button>
          )
        })}
      </div>

      {attempts > 0 && (
        <p className="mt-6 text-sm text-red-500 font-medium">
          PIN incorrecto. Intenta de nuevo.
        </p>
      )}

      <p className="absolute bottom-8 text-xs text-slate-400">Desarrollado por Mauricio</p>
    </div>
  )
}
