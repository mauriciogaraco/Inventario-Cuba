// src/components/ui/SelectPremium.jsx

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

export default function SelectPremium({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
}) {
  const current = options.find(
    option => option.value === value
  )

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </label>
      )}

      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger
          className={`
            h-12 w-full rounded-2xl
            border border-slate-200
            bg-white px-4
            text-left text-sm
            shadow-sm transition-all

            hover:border-slate-300
            hover:bg-slate-50/50

            focus:border-primary-500
            focus:ring-4
            focus:ring-primary-100

            data-[placeholder]:text-slate-400

            ${className}
          `}
        >
          <div className="flex min-w-0 items-center gap-2">
            <SelectValue
              placeholder={placeholder}
            />

            {current?.hint && (
              <span className="ml-auto truncate text-[11px] text-slate-400">
                {current.hint}
              </span>
            )}
          </div>
        </SelectTrigger>

        <SelectContent
          align="start"
          className="
            overflow-hidden rounded-2xl
            border border-slate-200
            bg-white p-1.5
            shadow-2xl
          "
        >
          {options.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-400">
              No hay opciones
            </div>
          ) : (
            options.map(option => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="
                  rounded-xl px-3 py-3
                  outline-none transition-all

                  focus:bg-primary-50
                  focus:text-primary-700

                  data-[state=checked]:bg-primary-100
                  data-[state=checked]:text-primary-800
                "
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {option.label}
                  </span>

                  {option.hint && (
                    <span className="mt-0.5 text-[11px] text-slate-400">
                      {option.hint}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}