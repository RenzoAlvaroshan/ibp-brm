import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import type { Task, TaskStatus } from '@/types'
import { cn } from '@/utils'

const STATUS_COLOR: Record<TaskStatus, { bar: string; bg: string; text: string }> = {
  todo:        { bar: '#9ca3af', bg: 'bg-gray-100',    text: 'text-gray-700' },
  in_progress: { bar: '#8b5cf6', bg: 'bg-violet-100',  text: 'text-violet-700' },
  done:        { bar: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  blocked:     { bar: '#ef4444', bg: 'bg-red-100',     text: 'text-red-700' },
}

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function diffDays(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS)
}

export default function TaskGantt({
  tasks,
  onTaskClick,
}: {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}) {
  const datedTasks = useMemo(
    () => tasks.filter((t) => t.start_date || t.target_date),
    [tasks],
  )

  const range = useMemo(() => {
    if (!datedTasks.length) return null

    let minTs = Infinity
    let maxTs = -Infinity
    for (const t of datedTasks) {
      const s = t.start_date ? new Date(t.start_date).getTime() : null
      const e = t.target_date ? new Date(t.target_date).getTime() : null
      const lo = s ?? e!
      const hi = e ?? s!
      if (lo < minTs) minTs = lo
      if (hi > maxTs) maxTs = hi
    }

    let start = startOfDay(new Date(minTs))
    let end = startOfDay(new Date(maxTs))
    // Pad both sides for breathing room
    start = addDays(start, -1)
    end = addDays(end, 2)

    const totalDays = Math.max(1, diffDays(end, start))
    return { start, end, totalDays }
  }, [datedTasks])

  if (!datedTasks.length || !range) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl px-5 py-6 text-center bg-gray-50/40">
        <Calendar size={18} className="mx-auto mb-1.5 text-gray-300" />
        <p className="text-[12px] text-gray-400">
          No tasks with dates yet. Add a start or end date to a task to see it here.
        </p>
      </div>
    )
  }

  const { start, end, totalDays } = range
  const today = startOfDay(new Date())
  const todayOffset = diffDays(today, start)
  const showToday = todayOffset >= 0 && todayOffset <= totalDays

  // Build month markers
  const monthMarkers: { left: number; width: number; label: string }[] = []
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cursor <= end) {
    const monthStart = cursor
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
    const visibleStart = monthStart < start ? start : monthStart
    const visibleEnd = monthEnd > end ? end : monthEnd
    const left = (diffDays(visibleStart, start) / totalDays) * 100
    const width = ((diffDays(visibleEnd, visibleStart) + 1) / totalDays) * 100
    monthMarkers.push({
      left,
      width,
      label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  // Decide tick density: every 1, 2, 7, or 14 days
  const tickStep = totalDays <= 14 ? 1 : totalDays <= 31 ? 2 : totalDays <= 90 ? 7 : 14

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
        <Calendar size={13} className="text-gray-400" />
        <span className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide">
          Timeline ({datedTasks.length})
        </span>
        <span className="text-[11px] text-gray-400 ml-1">
          {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' → '}
          {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Month axis */}
          <div className="relative h-6 border-b border-gray-100 bg-gray-50/30">
            {monthMarkers.map((m, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 flex items-center px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-l border-gray-200"
                style={{ left: `${m.left}%`, width: `${m.width}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="relative">
            {/* Day grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: Math.floor(totalDays / tickStep) + 1 }).map((_, i) => {
                const offset = (i * tickStep) / totalDays * 100
                if (offset > 100) return null
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-gray-100"
                    style={{ left: `${offset}%` }}
                  />
                )
              })}
            </div>

            {/* Today line */}
            {showToday && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10"
                style={{ left: `${(todayOffset / totalDays) * 100}%` }}
              >
                <div className="w-px h-full bg-violet-400" />
                <div className="absolute -top-[18px] -translate-x-1/2 px-1.5 py-px rounded text-[9px] font-semibold text-white bg-violet-500 whitespace-nowrap">
                  Today
                </div>
              </div>
            )}

            {/* Task rows */}
            {datedTasks.map((task) => {
              const s = task.start_date ? new Date(task.start_date) : null
              const e = task.target_date ? new Date(task.target_date) : null
              const barStart = s ?? e!
              const barEnd = e ?? s!
              const leftDays = diffDays(barStart, start)
              const spanDays = Math.max(1, diffDays(barEnd, barStart) + 1)
              const left = (leftDays / totalDays) * 100
              const width = (spanDays / totalDays) * 100
              const color = STATUS_COLOR[task.status]
              const oneSided = !s || !e

              return (
                <div
                  key={task.id}
                  className="relative h-9 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50/60 transition-colors"
                >
                  <div
                    onClick={() => onTaskClick?.(task)}
                    title={`${task.title}\n${barStart.toLocaleDateString()} → ${barEnd.toLocaleDateString()}`}
                    className={cn(
                      'absolute top-1.5 h-6 rounded-md cursor-pointer flex items-center px-2 overflow-hidden',
                      'transition-all duration-150 hover:brightness-95 hover:shadow-md',
                      oneSided && 'border border-dashed',
                    )}
                    style={{
                      left: `${left}%`,
                      width: `max(${width}%, 24px)`,
                      backgroundColor: color.bar + (oneSided ? '22' : 'dd'),
                      borderColor: oneSided ? color.bar : undefined,
                      color: oneSided ? color.bar : '#fff',
                    }}
                  >
                    <span className="text-[11px] font-medium truncate">
                      {task.title}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-3 px-4 py-2 border-t border-gray-100 bg-gray-50/30 text-[10px]">
        {(Object.entries(STATUS_COLOR) as [TaskStatus, typeof STATUS_COLOR[TaskStatus]][]).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.bar }} />
            <span className="text-gray-500 capitalize">{s.replace('_', ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-gray-400" />
          <span className="text-gray-400">Single date</span>
        </div>
      </div>
    </div>
  )
}
