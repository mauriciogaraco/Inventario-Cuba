// src/pages/Settings.jsx
import { useState, useRef } from 'react'
import { Lock, Unlock, Download, Upload, Trash2,  Package, ChevronRight, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import PageWrapper from '../components/layout/PageWrapper'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

// PIN setup modal
function PinSetupModal({ currentPin, onClose, onSave }) {
  const [step, setStep] = useState(currentPin ? 'verify' : 'new')
  const [input, setInput] = useState('')
  const [newPin, setNewPin] = useState('')
  const [shake, setShake] = useState(false)

  const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  function handleDigit(d) {
    if (d === '⌫') { setInput(p => p.slice(0, -1)); return }
    if (d === '' || input.length >= 4) return
    const next = input + d
    setInput(next)
    if (next.length === 4) {
      if (step === 'verify') {
        if (next === String(currentPin)) { setStep('new'); setInput('') }
        else { setShake(true); setTimeout(() => { setInput(''); setShake(false) }, 600) }
      } else if (step === 'new') {
        setNewPin(next); setStep('confirm'); setInput('')
      } else if (step === 'confirm') {
        if (next === newPin) { onSave(next); onClose() }
        else { setShake(true); setTimeout(() => { setInput(''); setShake(false); setStep('new'); setNewPin('') }, 600) }
      }
    }
  }

  const labels = { verify: 'Ingresa tu PIN actual', new: 'Elige un nuevo PIN de 4 dígitos', confirm: 'Confirma tu nuevo PIN' }

  return (
    <div className="flex flex-col items-center py-4">
      <p className="text-sm text-slate-600 mb-6 text-center">{labels[step]}</p>
      <div className={`flex gap-4 mb-8 ${shake ? 'animate-shake' : ''}`}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < input.length ? 'bg-primary-600 scale-110' : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 w-56">
        {DIGITS.map((d, i) => {
          if (d === '') return <div key={i} />
          return (
            <button key={i} onClick={() => handleDigit(d)}
              className="pin-btn mx-auto">
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Settings() {
  const { settings, updateSetting, setPin, exportBackup, importBackup, showToast, lock } = useApp()
  const fileRef = useRef()
  const [pinModal, setPinModal] = useState(false)
  const [removePinConfirm, setRemovePinConfirm] = useState(false)
  const [importing, setImporting] = useState(false)

  const businessName = settings?.businessName || ''
  const ownerName    = settings?.ownerName    || ''
  const hasPin       = !!settings?.pin

  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      await importBackup(file)
    } catch (err) {
      showToast('Error al restaurar: archivo inválido', 'error')
    }
    setImporting(false)
    e.target.value = ''
  }

  return (
    <>
      <Header title="Ajustes" subtitle="Configuración del negocio" />
      <PageWrapper>
        <div className="space-y-5">

          {/* Business info */}
          <div className="card space-y-3">
            <p className="section-title">Información del negocio</p>
            <div>
              <label className="field-label">Nombre del negocio</label>
              <input
                className="field-input"
                value={businessName}
                onChange={e => updateSetting('businessName', e.target.value)}
                placeholder="Ej: Mayorista La Habana"
              />
            </div>
            <div>
              <label className="field-label">Nombre del propietario</label>
              <input
                className="field-input"
                value={ownerName}
                onChange={e => updateSetting('ownerName', e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
          </div>

          {/* Security */}
          <div className="card space-y-3">
            <p className="section-title">Seguridad</p>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                {hasPin ? <Lock size={20} className="text-primary-600" /> : <Unlock size={20} className="text-slate-400" />}
                <div>
                  <p className="text-sm font-medium text-slate-800">PIN de acceso</p>
                  <p className="text-xs text-slate-400">{hasPin ? 'Activo — toca para cambiar' : 'Sin protección'}</p>
                </div>
              </div>
              <button
                onClick={() => setPinModal(true)}
                className="text-xs text-primary-600 font-medium bg-primary-50 px-3 py-1.5 rounded-lg"
              >
                {hasPin ? 'Cambiar' : 'Activar'}
              </button>
            </div>
            {hasPin && (
              <>
                <button
                  onClick={() => lock()}
                  className="w-full flex items-center justify-between py-3 border-t border-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-slate-400" />
                    <span className="text-sm text-slate-700">Bloquear ahora</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button
                  onClick={() => setRemovePinConfirm(true)}
                  className="w-full flex items-center gap-3 py-3 border-t border-slate-50"
                >
                  <Trash2 size={18} className="text-red-400" />
                  <span className="text-sm text-red-500">Eliminar PIN</span>
                </button>
              </>
            )}
          </div>

          {/* Backup & Restore */}
          <div className="card space-y-3">
            <p className="section-title">Respaldo y restauración</p>
            <p className="text-xs text-slate-500">
              Exporta todos tus datos como archivo JSON para guardarlos de forma segura.
              Puedes restaurarlos en cualquier momento desde el mismo teléfono.
            </p>
            <button onClick={exportBackup} className="w-full flex items-center gap-3 py-3 border border-slate-200 rounded-xl px-4 active:bg-slate-50">
              <Download size={20} className="text-primary-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-800">Exportar respaldo</p>
                <p className="text-xs text-slate-400">Descarga archivo .json</p>
              </div>
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 py-3 border border-slate-200 rounded-xl px-4 active:bg-slate-50">
              <Upload size={20} className="text-amber-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-800">Restaurar respaldo</p>
                <p className="text-xs text-amber-600 font-medium">⚠️ Reemplaza todos los datos actuales</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            {importing && <p className="text-xs text-primary-600 text-center animate-fade-in">Restaurando datos...</p>}
          </div>

          {/* About */}
          <div className="card">
            <p className="section-title mb-3">Acerca de</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center">
                <Package size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Inventario Cuba</p>
                <p className="text-xs text-slate-500">Versión 1.0.2</p>
                <p className="text-xs text-slate-400 mt-1">Desarrollado por <span className="font-semibold text-primary-600">Mauricio</span></p>
              </div>
            </div>
            <div className="mt-4 bg-slate-50 rounded-xl p-3 space-y-1.5">
              {[
                'Gestión de inventario offline',
                'Datos seguros en tu dispositivo',
                'Respaldo y restauración',
                'Optimizado para Android',
              ].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-green-500 shrink-0" />
                  <span className="text-xs text-slate-600">{f}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </PageWrapper>

      {/* PIN Modal */}
      <Modal open={pinModal} onClose={() => setPinModal(false)} title={hasPin ? 'Cambiar PIN' : 'Configurar PIN'}>
        <PinSetupModal
          currentPin={settings?.pin}
          onClose={() => setPinModal(false)}
          onSave={pin => setPin(pin)}
        />
      </Modal>

      {/* Remove PIN Confirm */}
      <ConfirmDialog
        open={removePinConfirm}
        onClose={() => setRemovePinConfirm(false)}
        onConfirm={() => setPin(null)}
        title="Eliminar PIN"
        message="¿Seguro que deseas eliminar el PIN? El acceso quedará sin protección."
        confirmLabel="Eliminar PIN"
      />
    </>
  )
}
