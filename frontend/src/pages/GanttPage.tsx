import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, GanttChartSquare, Filter, X,
  ZoomIn, ZoomOut, ArrowDownUp,
} from 'lucide-react'
import type { Task, TaskStatus, Requirement } from '@/types'
import { useAllTasksQuery, useAppsQuery } from '@/hooks/useApi'
import { SingleSelect } from '@/components/ui/Select'
import RequirementPanel from '@/components/requirements/RequirementPanel'
import { cn } from '@/utils'

type Zoom = 'day' | 'week' | 'month'

const STATUS_COLOR: Record<TaskStatus, { bar: string; label: string }> = {
  todo:        { bar: '#9ca3af', label: 'To Do' },
  in_progress: { bar: '#8b5cf6', label: 'In Progress' },
  done:        { bar: '#10b981', label: 'Done' },
  blocked:     { bar: '#ef4444', label: 'Blocked' },
}

const DAY_MS = 24 * 60 * 60 * 1000
const LABEL_COL_PX = 280

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function diffDays(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS)
}

const ZOOM_CONFIG: Record<Zoom, { dayWidth: number; tickStep: number }> = {
  day:   { dayWidth: 36, tickStep: 1 },
  week:  { dayWidth: 14, tickStep: 7 },
  month: { dayWidth: 5,  tickStep: 14 },
}

export default function GanttPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = (searchParams.get('search') || '').trim()
  const status = searchParams.get('status') || ''
  const appId  = searchParams.get('app') || ''
  const [zoom, setZoom] = useState<Zoom>('week')
  const [groupByReq, setGroupByReq] = useState(true)
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)
  const [initialTaskId, setInitialTaskId] = useState<string | undefined>()

  const tasksQuery = useAllTasksQuery({
    search: search || undefined,
    status: status || undefined,
    app_id: appId || undefined,
  })
  const { data: tasks = [], isLoading } = useQuery(tasksQuery)

  const appsQuery = useAppsQuery()
  const { data: apps = [] } = useQuery(appsQuery)

  const dated = useMemo(
    () => tasks.filter((t) => t.start_date || t.target_date),
    [tasks],
  )

  const range = useMemo(() => {
    if (!dated.length) return null
    let minTs = Infinity
    let maxTs = -Infinity
    for (const t of dated) {
      const s = t.start_date ? new Date(t.start_date).getTime() : null
      const e = t.target_date ? new Date(t.target_date).getTime() : null
      const lo = s ?? e!
      const hi = e ?? s!
      if (lo < minTs) minTs = lo
      if (hi > maxTs) maxTs = hi
    }
    const start = addDays(startOfDay(new Date(minTs)), -3)
    const end   = addDays(startOfDay(new Date(maxTs)),  6)
    const totalDays = Math.max(1, diffDays(end, start))
    return { start, end, totalDays }
  }, [dated])

  const { dayWidth, tickStep } = ZOOM_CONFIG[zoom]
  const timelineWidth = range ? range.totalDays * dayWidth : 0

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    setSearchParams(next, { replace: true })
  }
  const clearAll = () => setSearchParams({})

  const activeFilters = [search, status, appId].filter(Boolean).length

  // Build month markers
  const monthMarkers: { left: number; width: number; label: string }[] = []
  if (range) {
    let cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1)
    while (cursor <= range.end) {
      const monthStart = cursor
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
      const vs = monthStart < range.start ? range.start : monthStart
      const ve = monthEnd > range.end ? range.end : monthEnd
      monthMarkers.push({
        left: diffDays(vs, range.start) * dayWidth,
        width: (diffDays(ve, vs) + 1) * dayWidth,
        label: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      })
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    }
  }

  // Rows: either grouped by requirement or flat
  type Row =
    | { kind: 'group'; req: Requirement; tasks: Task[] }
    | { kind: 'task'; task: Task }

  const rows: Row[] = useMemo(() => {
    if (!groupByReq) return dated.map((t) => ({ kind: 'task' as const, task: t }))
    const byReq = new Map<string, { req: Requirement; tasks: Task[] }>()
    for (const t of dated) {
      if (!t.requirement) continue
      const entry = byReq.get(t.requirement.id)
      if (entry) entry.tasks.push(t)
      else byReq.set(t.requirement.id, { req: t.requirement, tasks: [t] })
    }
    const out: Row[] = []
    for (const { req, tasks: ts } of byReq.values()) {
      out.push({ kind: 'group', req, tasks: ts })
      for (const t of ts) out.push({ kind: 'task', task: t })
    }
    return out
  }, [dated, groupByReq])

  const today = startOfDay(new Date())
  const todayOffset = range ? diffDays(today, range.start) : -1
  const showToday = range && todayOffset >= 0 && todayOffset <= range.totalDays

  const openTask = (task: Task) => {
    if (!task.requirement) return
    setInitialTaskId(task.id)
    setSelectedReq(task.requirement)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-gray-600">
          <GanttChartSquare size={16} className="text-violet-500" />
          <span className="text-[14px] font-semibold">Timeline</span>
          <span className="text-[11px] text-gray-400 ml-1">{dated.length} tasks</span>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <SingleSelect
            value={status}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: 'todo',        label: 'To Do',       dot: '#9ca3af' },
              { value: 'in_progress', label: 'In Progress', dot: '#8b5cf6' },
              { value: 'done',        label: 'Done',        dot: '#10b981' },
              { value: 'blocked',     label: 'Blocked',     dot: '#ef4444' },
            ]}
            placeholder="All Statuses"
            className="px-2.5 py-1.5 text-[12px]"
          />
          <SingleSelect
            value={appId}
            onChange={(v) => setFilter('app', v)}
            options={apps.map((a) => ({ value: a.id, label: a.name, dot: '#3b82f6' }))}
            placeholder="All Apps"
            className="px-2.5 py-1.5 text-[12px]"
          />

          <button
            onClick={() => setGroupByReq((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] border rounded-md transition-colors',
              groupByReq
                ? 'bg-violet-50 border-violet-200 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            <Filter size={12} /> Group by requirement
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-md p-0.5">
            {(['month', 'week', 'day'] as Zoom[]).map((z, i) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-sm capitalize transition-colors flex items-center gap-1',
                  zoom === z ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100',
                )}
                title={`Zoom: ${z}`}
              >
                {i === 0 && <ZoomOut size={11} />}
                {i === 2 && <ZoomIn size={11} />}
                {z}
              </button>
            ))}
          </div>

          {activeFilters > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Gantt container */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">
            Loading timeline…
          </div>
        ) : !range ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <Calendar size={40} className="text-gray-200 mb-3" />
            <p className="text-[14px] font-medium text-gray-600">No tasks with dates to show</p>
            <p className="text-[12px] text-gray-400 mt-1 max-w-[340px]">
              Add a start or end date to tasks (or adjust your filters) to see them on the timeline.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="flex" style={{ minWidth: LABEL_COL_PX + timelineWidth }}>
              {/* Label column (sticky left) */}
              <div
                className="shrink-0 sticky left-0 z-20 bg-white border-r border-gray-200"
                style={{ width: LABEL_COL_PX }}
              >
                {/* Header spacer */}
                <div className="h-14 border-b border-gray-200 bg-gray-50/80 flex items-end px-3 pb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    <ArrowDownUp size={10} className="inline mr-1 opacity-60" />
                    {groupByReq ? 'Requirement / Task' : 'Task'}
                  </span>
                </div>
                {rows.map((row, i) => (
                  row.kind === 'group' ? (
                    <div
                      key={`g-${row.req.id}-${i}`}
                      className="h-9 border-b border-gray-200 bg-gray-50/80 flex items-center px-3 gap-2 cursor-pointer hover:bg-violet-50/40 transition-colors"
                      onClick={() => setSelectedReq(row.req)}
                      title={row.req.title}
                    >
                      <span className="text-[12px] font-semibold text-gray-700 truncate flex-1">
                        {row.req.title}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {row.tasks.length}
                      </span>
                    </div>
                  ) : (
                    <div
                      key={`t-${row.task.id}`}
                      className="h-9 border-b border-gray-100 flex items-center px-3 gap-2 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openTask(row.task)}
                      title={row.task.title}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_COLOR[row.task.status].bar }}
                      />
                      <span className={cn(
                        'text-[12px] truncate flex-1',
                        groupByReq && 'pl-3 text-gray-600',
                        !groupByReq && 'text-gray-700',
                        row.task.status === 'done' && 'line-through text-gray-400',
                      )}>
                        {row.task.title}
                      </span>
                      {row.task.app && (
                        <span className="hidden xl:inline text-[9.5px] text-blue-600 bg-blue-50 border border-blue-100 px-1 py-px rounded shrink-0 max-w-[80px] truncate">
                          {row.task.app.name}
                        </span>
                      )}
                    </div>
                  )
                ))}
              </div>

              {/* Timeline */}
              <div className="relative" style={{ width: timelineWidth }}>
                {/* Sticky month header */}
                <div className="sticky top-0 z-10 bg-white">
                  <div className="relative h-8 border-b border-gray-200 bg-gray-50">
                    {monthMarkers.map((m, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 flex items-center px-2 text-[10.5px] font-semibold text-gray-600 uppercase tracking-wide border-l border-gray-200"
                        style={{ left: m.left, width: m.width }}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                  {/* Day/tick row */}
                  <div className="relative h-6 border-b border-gray-200 bg-gray-50/40 text-[9.5px] text-gray-400">
                    {Array.from({ length: Math.floor(range.totalDays / tickStep) + 1 }).map((_, i) => {
                      const offset = i * tickStep
                      if (offset > range.totalDays) return null
                      const d = addDays(range.start, offset)
                      const isMonday = d.getDay() === 1
                      return (
                        <div
                          key={i}
                          className={cn('absolute top-0 bottom-0 flex items-center px-1 border-l',
                            isMonday ? 'border-gray-300' : 'border-gray-100')}
                          style={{ left: offset * dayWidth }}
                        >
                          {zoom === 'day'
                            ? d.getDate()
                            : zoom === 'week'
                              ? (isMonday ? `${d.getDate()}` : '')
                              : (d.getDate() === 1 || d.getDate() === 15 ? `${d.getDate()}` : '')}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Body */}
                <div className="relative">
                  {/* Weekend / grid background */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: range.totalDays + 1 }).map((_, i) => {
                      const d = addDays(range.start, i)
                      const day = d.getDay()
                      const isWeekend = day === 0 || day === 6
                      if (!isWeekend || zoom === 'month') return null
                      return (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 bg-gray-50/70"
                          style={{ left: i * dayWidth, width: dayWidth }}
                        />
                      )
                    })}
                  </div>

                  {/* Today line */}
                  {showToday && (
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none z-10"
                      style={{ left: todayOffset * dayWidth }}
                    >
                      <div className="w-px h-full bg-violet-400" />
                      <div className="absolute -top-0 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-violet-500 whitespace-nowrap shadow-sm">
                        TODAY
                      </div>
                    </div>
                  )}

                  {/* Rows */}
                  {rows.map((row, i) => {
                    if (row.kind === 'group') {
                      // span bar representing aggregate range of tasks
                      const tasksDated = row.tasks.filter((t) => t.start_date || t.target_date)
                      if (tasksDated.length === 0) {
                        return <div key={`gr-${row.req.id}-${i}`} className="h-9 border-b border-gray-200 bg-gray-50/80" />
                      }
                      let minTs = Infinity
                      let maxTs = -Infinity
                      for (const t of tasksDated) {
                        const s = t.start_date ? new Date(t.start_date).getTime() : null
                        const e = t.target_date ? new Date(t.target_date).getTime() : null
                        const lo = s ?? e!
                        const hi = e ?? s!
                        if (lo < minTs) minTs = lo
                        if (hi > maxTs) maxTs = hi
                      }
                      const s = startOfDay(new Date(minTs))
                      const e = startOfDay(new Date(maxTs))
                      const left = diffDays(s, range.start) * dayWidth
                      const width = Math.max(dayWidth, (diffDays(e, s) + 1) * dayWidth)
                      return (
                        <div
                          key={`gr-${row.req.id}-${i}`}
                          className="relative h-9 border-b border-gray-200 bg-gray-50/80"
                        >
                          <div
                            className="absolute top-3.5 h-2 rounded-full bg-gradient-to-r from-violet-300/70 to-violet-400/60 border border-violet-300/50"
                            style={{ left, width }}
                            title={`${row.req.title}: ${s.toLocaleDateString()} → ${e.toLocaleDateString()}`}
                          />
                        </div>
                      )
                    }
                    const t = row.task
                    const s = t.start_date ? new Date(t.start_date) : null
                    const e = t.target_date ? new Date(t.target_date) : null
                    const barStart = s ?? e!
                    const barEnd = e ?? s!
                    const left = diffDays(barStart, range.start) * dayWidth
                    const width = Math.max(dayWidth, (diffDays(barEnd, barStart) + 1) * dayWidth)
                    const color = STATUS_COLOR[t.status]
                    const oneSided = !s || !e
                    return (
                      <div
                        key={`tr-${t.id}`}
                        className="relative h-9 border-b border-gray-100 hover:bg-gray-50/60 transition-colors"
                      >
                        <button
                          onClick={() => openTask(t)}
                          className={cn(
                            'absolute top-2 h-5 rounded-md flex items-center px-1.5 overflow-hidden',
                            'transition-all duration-150 hover:brightness-95 hover:shadow-md hover:scale-[1.02] origin-left',
                            oneSided && 'border border-dashed',
                          )}
                          style={{
                            left,
                            width,
                            backgroundColor: color.bar + (oneSided ? '22' : 'e6'),
                            borderColor: oneSided ? color.bar : undefined,
                            color: oneSided ? color.bar : '#fff',
                          }}
                          title={`${t.title}\n${barStart.toLocaleDateString()} → ${barEnd.toLocaleDateString()}`}
                        >
                          <span className="text-[10.5px] font-medium truncate">{t.title}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {range && (
          <div className="flex items-center flex-wrap gap-3 px-4 py-2 border-t border-gray-100 bg-gray-50/40 text-[10.5px] shrink-0">
            {(Object.entries(STATUS_COLOR) as [TaskStatus, typeof STATUS_COLOR[TaskStatus]][]).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c.bar }} />
                <span className="text-gray-500">{c.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-gray-400" />
              <span className="text-gray-400">Single date</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="w-2.5 h-2.5 bg-violet-400" />
              <span className="text-gray-500">Today</span>
            </div>
          </div>
        )}
      </div>

      {selectedReq && (
        <RequirementPanel
          requirement={selectedReq}
          initialTaskId={initialTaskId}
          onClose={() => { setSelectedReq(null); setInitialTaskId(undefined) }}
        />
      )}
    </div>
  )
}
