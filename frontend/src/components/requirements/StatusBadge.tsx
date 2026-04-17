import type { Status } from '@/types'
import { cn } from '@/utils'

const config: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  draft:    { label: 'Draft',    dot: 'bg-gray-400',   bg: 'bg-gray-100',    text: 'text-gray-600' },
  review:   { label: 'Review',   dot: 'bg-amber-400',  bg: 'bg-amber-50',    text: 'text-amber-700' },
  approved: { label: 'Approved', dot: 'bg-emerald-400',bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  rejected: { label: 'Rejected', dot: 'bg-red-400',    bg: 'bg-red-50',      text: 'text-red-600' },
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = config[status] || config.draft
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-md whitespace-nowrap',
      cfg.bg, cfg.text,
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
    )}>
      <span className={cn('rounded-full shrink-0', cfg.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {cfg.label}
    </span>
  )
}
