import { Minus, Plus } from 'lucide-react'

export default function NumberInputPremium({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder = '0',
}) {
  const parsed = Number(value || 0)

  function increase() {
    onChange(String(parsed + step))
  }

  function decrease() {
    const next = parsed - step

    if (next < min) {
      onChange(String(min))
      return
    }

    onChange(String(next))
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </label>
      )}

      <div
        className="
          flex items-center
          rounded-2xl border border-slate-200
          bg-white shadow-sm
          overflow-hidden
          transition-all

          focus-within:border-primary-500
          focus-within:ring-4
          focus-within:ring-primary-100
        "
      >
        {/* Input */}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          className="
            flex-1 min-w-0
            bg-transparent
            px-4 py-3
            outline-none

            text-sm text-slate-800
            placeholder:text-slate-400
          "
        />

        {/* Actions */}
        <div className="flex shrink-0 border-l border-slate-100">
          <button
            type="button"
            onClick={decrease}
            className="
              h-12 w-10
              flex items-center justify-center
              text-slate-500
              transition-colors

              hover:bg-slate-50
              active:bg-slate-100
            "
          >
            <Minus size={15} />
          </button>

          <div className="w-px bg-slate-100" />

          <button
            type="button"
            onClick={increase}
            className="
              h-12 w-10
              flex items-center justify-center
              text-slate-500
              transition-colors

              hover:bg-slate-50
              active:bg-slate-100
            "
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}