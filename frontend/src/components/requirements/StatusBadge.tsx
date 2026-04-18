import type { Status } from '@/types'
import { cn } from '@/utils'

const config: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  todo:                 { label: 'To Do',              dot: 'bg-gray-400',    bg: 'bg-gray-100',    text: 'text-gray-600' },
  requirement_gathering:{ label: 'Req. Gathering',     dot: 'bg-blue-400',    bg: 'bg-blue-50',     text: 'text-blue-700' },
  development:          { label: 'Development',        dot: 'bg-indigo-400',  bg: 'bg-indigo-50',   text: 'text-indigo-700' },
  sit:                  { label: 'SIT',                dot: 'bg-amber-400',   bg: 'bg-amber-50',    text: 'text-amber-700' },
  uat:                  { label: 'UAT',                dot: 'bg-violet-400',  bg: 'bg-violet-50',   text: 'text-violet-700' },
  d2p:                  { label: 'D2P',                dot: 'bg-pink-400',    bg: 'bg-pink-50',     text: 'text-pink-700' },
  production_test:      { label: 'Production Test',    dot: 'bg-orange-400',  bg: 'bg-orange-50',   text: 'text-orange-700' },
  completed:            { label: 'Completed',          dot: 'bg-emerald-400', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = config[status] || config.todo
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
