import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { CalendarClock, Search, SlidersHorizontal } from 'lucide-react'
import { useAllTasksQuery, useAppsQuery } from '@/hooks/useApi'
import { cn } from '@/utils'
import type { TaskStatus } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo:        { label: 'To Do',       color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  done:        { label: 'Done',        color: 'bg-green-100 text-green-700' },
  blocked:     { label: 'Blocked',     color: 'bg-red-100 text-red-700' },
}

const ALL = '__all__'

function DeadlineBadge({ targetDate }: { targetDate?: string }) {
  if (!targetDate) {
    return <span className="text-xs text-gray-300 italic">No deadline</span>
  }

  const days = differenceInCalendarDays(parseISO(targetDate), new Date())
  const label =
    days < 0  ? `${Math.abs(days)}d overdue` :
    days === 0 ? 'Due today' :
    days === 1 ? 'Due tomorrow' :
                 `${days}d left`

  const color =
    days < 0  ? 'text-red-600 font-semibold' :
    days === 0 ? 'text-orange-500 font-semibold' :
    days <= 7  ? 'text-yellow-600 font-medium' :
                 'text-gray-500'

  const date = parseISO(targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="text-right shrink-0">
      <p className={cn('text-xs', color)}>{label}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{date}</p>
    </div>
  )
}

export default function TasksPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(ALL)
  const [appFilter, setAppFilter] = useState<string>(ALL)

  // Fetch with server-side filters (status, app_id) — search is client-side for instant response
  const allTasksQuery = useAllTasksQuery({
    status: statusFilter !== ALL ? statusFilter : undefined,
    app_id: appFilter !== ALL ? appFilter : undefined,
  })
  const { data: tasks = [], isLoading } = useQuery(allTasksQuery)

  const appsQuery = useAppsQuery()
  const { data: apps = [] } = useQuery(appsQuery)

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks
    const s = search.toLowerCase()
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.description?.toLowerCase().includes(s) ||
        t.requirement?.title?.toLowerCase().includes(s)
    )
  }, [tasks, search])

  // Group by deadline proximity
  const overdue  = filtered.filter((t) => t.target_date && differenceInCalendarDays(parseISO(t.target_date), new Date()) < 0)
  const today    = filtered.filter((t) => t.target_date && differenceInCalendarDays(parseISO(t.target_date), new Date()) === 0)
  const upcoming = filtered.filter((t) => t.target_date && differenceInCalendarDays(parseISO(t.target_date), new Date()) > 0)
  const noDate   = filtered.filter((t) => !t.target_date)

  const groups = [
    { label: 'Overdue',  items: overdue,  labelColor: 'text-red-600' },
    { label: 'Due Today', items: today,   labelColor: 'text-orange-500' },
    { label: 'Upcoming', items: upcoming, labelColor: 'text-gray-700' },
    { label: 'No Deadline', items: noDate, labelColor: 'text-gray-400' },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">All tasks across requirements, ordered by closest deadline.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or requirements…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal size={14} className="text-gray-400" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={ALL}>All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>

          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={ALL}>All apps</option>
            {apps.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center text-gray-400 text-sm py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-12 bg-white rounded-xl border border-gray-200">
          No tasks found.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock size={13} className={group.labelColor} />
                <span className={cn('text-xs font-semibold uppercase tracking-wide', group.labelColor)}>
                  {group.label} ({group.items.length})
                </span>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                {group.items.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 px-4 py-3">
                    {/* Status dot */}
                    <div className="pt-0.5 shrink-0">
                      <span className={cn('inline-block text-[10px] font-medium px-2 py-0.5 rounded-full', statusConfig[task.status].color)}>
                        {statusConfig[task.status].label}
                      </span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {task.requirement && (
                          <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                            {task.requirement.title}
                          </span>
                        )}
                        {task.app && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                            {task.app.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Deadline */}
                    <DeadlineBadge targetDate={task.target_date} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
