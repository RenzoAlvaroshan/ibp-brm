import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/utils'

interface Props {
  open: boolean
  title?: string
  message?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      else if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 backdrop-blur-[2px] animate-fade-in p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-200/60 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-3">
          <div
            className={cn(
              'shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
              isDanger ? 'bg-red-50 text-red-500' : 'bg-violet-50 text-violet-600',
            )}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">{title}</h3>
            {message && (
              <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">{message}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50/60 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3.5 py-1.5 text-[13px] font-medium rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-1.5 text-[13px] font-medium text-white rounded-lg transition-colors shadow-sm disabled:opacity-50',
              isDanger
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-red-500/25'
                : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 shadow-violet-600/25',
            )}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
