import { statusConfig } from '@/utils'
import type { Status } from '@/types'
import { cn } from '@/utils'

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = statusConfig[status] || statusConfig.draft
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      cfg.bg, cfg.color,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}
