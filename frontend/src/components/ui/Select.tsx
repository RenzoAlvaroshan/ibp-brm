import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, X } from 'lucide-react'
import { cn, getInitials } from '@/utils'

export interface SelectOption {
  value: string
  label: string
  dot?: string
}

// ─── Shared portal hook ───────────────────────────────────────────────────────

function usePortalDrop() {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropRef    = useRef<HTMLDivElement>(null)

  const openDrop = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 160) })
    }
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return { open, setOpen, pos, triggerRef, dropRef, openDrop }
}

const dropCls = 'bg-white border border-gray-200/80 rounded-xl shadow-xl shadow-black/10 py-1 animate-fade-in-up'

// ─── SingleSelect ─────────────────────────────────────────────────────────────

export function SingleSelect({ value, onChange, options, placeholder, className }: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}) {
  const { open, setOpen, pos, triggerRef, dropRef, openDrop } = usePortalDrop()

  const selected = options.find((o) => o.value === value)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openDrop()}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border bg-white transition-all duration-150 text-left',
          open
            ? 'border-violet-400 ring-2 ring-violet-500/20'
            : 'border-gray-200 hover:border-gray-300',
          className ?? 'w-full px-3 py-2 text-[13px]',
        )}
      >
        {selected?.dot && (
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selected.dot }} />
        )}
        <span className={cn('flex-1 truncate', selected ? 'text-gray-800' : 'text-gray-400')}>
          {selected?.label ?? placeholder ?? 'Select…'}
        </span>
        <ChevronDown
          size={13}
          className={cn('shrink-0 text-gray-400 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className={dropCls}
        >
          {placeholder !== undefined && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-[7px] text-[13px] text-left transition-colors',
                !value ? 'bg-violet-50 text-violet-700' : 'text-gray-400 hover:bg-gray-50',
              )}
            >
              <span className="flex-1">{placeholder}</span>
              {!value && <Check size={12} className="text-violet-500" />}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-[7px] text-[13px] text-left transition-colors',
                opt.value === value ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              {opt.dot && (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.dot }} />
              )}
              <span className="flex-1">{opt.label}</span>
              {opt.value === value && <Check size={12} className="shrink-0 text-violet-500" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

// ─── UserSelect ───────────────────────────────────────────────────────────────

export function UserSelect({ value, onChange, users, className }: {
  value: string
  onChange: (v: string) => void
  users: { id: string; full_name: string }[] | undefined
  className?: string
}) {
  const { open, setOpen, pos, triggerRef, dropRef, openDrop } = usePortalDrop()

  const selectedUser = users?.find((u) => u.id === value)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openDrop()}
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-white transition-all duration-150 text-left',
          open
            ? 'border-violet-400 ring-2 ring-violet-500/20'
            : 'border-gray-200 hover:border-gray-300',
          className ?? 'w-full px-3 py-2 text-[13px]',
        )}
      >
        {selectedUser ? (
          <>
            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-semibold flex items-center justify-center shrink-0">
              {getInitials(selectedUser.full_name)}
            </span>
            <span className="flex-1 truncate text-gray-800">{selectedUser.full_name}</span>
          </>
        ) : (
          <span className="flex-1 text-gray-400">Unassigned</span>
        )}
        <ChevronDown
          size={13}
          className={cn('shrink-0 text-gray-400 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className={dropCls}
        >
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-left transition-colors',
              !value ? 'bg-violet-50 text-violet-700' : 'text-gray-500 hover:bg-gray-50',
            )}
          >
            <span className="w-5 h-5 rounded-full border border-dashed border-gray-300 shrink-0" />
            <span className="flex-1">Unassigned</span>
            {!value && <Check size={12} className="text-violet-500" />}
          </button>
          {users?.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => { onChange(u.id); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-left transition-colors',
                u.id === value ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-semibold flex items-center justify-center shrink-0">
                {getInitials(u.full_name)}
              </span>
              <span className="flex-1">{u.full_name}</span>
              {u.id === value && <Check size={12} className="shrink-0 text-violet-500" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────

export function MultiSelect({ values, onChange, options, placeholder, className }: {
  values: string[]
  onChange: (v: string[]) => void
  options: SelectOption[]
  placeholder: string
  className?: string
}) {
  const { open, setOpen, pos, triggerRef, dropRef, openDrop } = usePortalDrop()

  const toggle = (val: string) =>
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val])

  const triggerLabel =
    values.length === 0 ? placeholder
    : values.length === 1 ? (options.find((o) => o.value === values[0])?.label ?? values[0])
    : `${values.length} selected`

  const firstDot = values.length === 1
    ? options.find((o) => o.value === values[0])?.dot
    : undefined

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openDrop()}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border transition-all duration-150 whitespace-nowrap',
          values.length > 0
            ? 'bg-violet-50 border-violet-200 text-violet-700 font-medium'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
          className ?? 'px-3 py-1.5 text-[12px]',
        )}
      >
        {firstDot && (
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: firstDot }} />
        )}
        {values.length > 1 && (
          <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 leading-none">
            {values.length}
          </span>
        )}
        <span>{triggerLabel}</span>
        <ChevronDown
          size={12}
          className={cn('text-current opacity-60 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
          className={dropCls}
        >
          {options.map((opt) => {
            const checked = values.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[12px] text-left transition-colors hover:bg-gray-50"
              >
                <span
                  className={cn(
                    'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all duration-100',
                    checked ? 'bg-violet-500 border-violet-500' : 'border-gray-300',
                  )}
                >
                  {checked && <Check size={9} className="text-white" strokeWidth={3} />}
                </span>
                {opt.dot && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.dot }} />
                )}
                <span className={cn('flex-1', checked ? 'text-gray-800 font-medium' : 'text-gray-600')}>
                  {opt.label}
                </span>
              </button>
            )
          })}
          {values.length > 0 && (
            <>
              <div className="mx-3 my-1 border-t border-gray-100" />
              <button
                type="button"
                onClick={() => { onChange([]); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-[6px] text-[11px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={11} /> Clear selection
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
