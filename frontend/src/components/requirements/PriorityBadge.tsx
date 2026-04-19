import type { Priority } from '@/types'
import { cn } from '@/utils'

const config: Record<Priority, { label: string; color: string; bg: string; text: string; hex: string; mutedHex: string }> = {
  critical: { label: 'Critical', color: 'text-red-600',    bg: 'bg-red-50',    text: 'text-red-600',    hex: '#ef4444', mutedHex: '#8b5cf6' },
  high:     { label: 'High',     color: 'text-orange-600', bg: 'bg-orange-50', text: 'text-orange-600', hex: '#f97316', mutedHex: '#ef4444' },
  medium:   { label: 'Medium',   color: 'text-blue-600',   bg: 'bg-blue-50',   text: 'text-blue-600',   hex: '#3b82f6', mutedHex: '#f59e0b' },
  low:      { label: 'Low',      color: 'text-gray-500',   bg: 'bg-gray-100',  text: 'text-gray-500',   hex: '#9ca3af', mutedHex: '#9ca3af' },
}

interface Props {
  priority: Priority
  size?: 'sm' | 'md'
  dotOnly?: boolean
  mode?: 'fill' | 'muted'
}

export default function PriorityBadge({ priority, size = 'md', dotOnly = false, mode = 'fill' }: Props) {
  const cfg = config[priority] || config.medium
  if (dotOnly) {
    return (
      <span
        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
        style={{ backgroundColor: cfg.hex }}
        title={cfg.label}
      />
    )
  }
  if (mode === 'muted') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-gray-500">
        <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: cfg.mutedHex }} />
        {cfg.label}
      </span>
    )
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-md whitespace-nowrap',
      cfg.bg, cfg.text,
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
    )}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.hex }} />
      {cfg.label}
    </span>
  )
}

export function PriorityDot({ priority }: { priority: Priority }) {
  const cfg = config[priority] || config.medium
  return (
    <span
      className="w-2 h-2 rounded-full inline-block shrink-0"
      style={{ backgroundColor: cfg.hex }}
      title={cfg.label}
    />
  )
}
