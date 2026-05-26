// src/components/ui/ConfirmDialog.jsx
import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Eliminar', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white ${danger ? 'bg-red-600 active:bg-red-700' : 'bg-primary-600 active:bg-primary-700'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
