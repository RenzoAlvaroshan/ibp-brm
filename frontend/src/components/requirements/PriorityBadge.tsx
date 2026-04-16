import { priorityConfig } from '@/utils'
import type { Priority } from '@/types'
import { cn } from '@/utils'

interface Props {
  priority: Priority
  size?: 'sm' | 'md'
  dotOnly?: boolean
}

export default function PriorityBadge({ priority, size = 'md', dotOnly = false }: Props) {
  const cfg = priorityConfig[priority] || priorityConfig.medium
  if (dotOnly) {
    return (
      <span
        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
        style={{ backgroundColor: cfg.hex }}
        title={cfg.label}
      />
    )
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      cfg.bg, cfg.color,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
    )}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.hex }} />
      {cfg.label}
    </span>
  )
}
