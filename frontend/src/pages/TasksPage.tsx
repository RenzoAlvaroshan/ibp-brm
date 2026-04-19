import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import {
  Search, CheckCircle2, Circle, Zap, XOctagon,
  ChevronDown, FileText, AppWindow, CalendarRange,
} from 'lucide-react'
import { useAllTasksQuery, useAppsQuery } from '@/hooks/useApi'
import { SingleSelect } from '@/components/ui/Select'
import { cn, formatDate } from '@/utils'
import type { Task, TaskStatus, Requirement } from '@/types'
import RequirementPanel from '@/components/requirements/RequirementPanel'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, {
  label: string
  icon: React.ElementType
  dot: string
  badgeBg: string
  badgeText: string
  headerText: string
  headerBg: string
}> = {
  in_progress: {
    label: 'In Progress', icon: Zap,
    dot: '#6366f1', badgeBg: 'bg-violet-50', badgeText: 'text-violet-700',
    headerText: 'text-violet-700', headerBg: 'bg-violet-50/60',
  },
  blocked: {
    label: 'Blocked', icon: XOctagon,
    dot: '#ef4444', badgeBg: 'bg-red-50', badgeText: 'text-red-600',
    headerText: 'text-red-600', headerBg: 'bg-red-50/60',
  },
  todo: {
    label: 'To Do', icon: Circle,
    dot: '#9ca3af', badgeBg: 'bg-gray-100', badgeText: 'text-gray-600',
    headerText: 'text-gray-600', headerBg: 'bg-gray-50',
  },
  done: {
    label: 'Done', icon: CheckCircle2,
    dot: '#10b981', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700',
    headerText: 'text-emerald-700', headerBg: 'bg-emerald-50/60',
  },
}

const STATUS_ORDER: TaskStatus[] = ['in_progress', 'blocked', 'todo', 'done']

const STATUS_OPTIONS = [
  { value: '__all__', label: 'All Statuses' },
  { value: 'in_progress', label: 'In Progress', dot: '#6366f1' },
  { value: 'blocked',     label: 'Blocked',     dot: '#ef4444' },
  { value: 'todo',        label: 'To Do',        dot: '#9ca3af' },
  { value: 'done',        label: 'Done',         dot: '#10b981' },
]

// ─── Deadline badge ───────────────────────────────────────────────────────────

function DeadlineBadge({ targetDate, status }: { targetDate?: string; status: TaskStatus }) {
  if (!targetDate || status === 'done') return null
  const days = differenceInCalendarDays(parseISO(targetDate), new Date())
  const label =
    days < 0  ? `${Math.abs(days)}d overdue` :
    days === 0 ? 'Due today' :
    days === 1 ? 'Due tomorrow' :
                 `${days}d left`
  const cls =
    days < 0  ? 'bg-red-50 text-red-600 border-red-200' :
    days === 0 ? 'bg-orange-50 text-orange-600 border-orange-200' :
    days <= 7  ? 'bg-amber-50 text-amber-600 border-amber-200' :
                 'bg-gray-50 text-gray-500 border-gray-200'
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0', cls)}>
      {label}
    </span>
  )
}

// ─── Date range pill ──────────────────────────────────────────────────────────

function DateRange({ startDate, targetDate }: { startDate?: string; targetDate?: string }) {
  if (!startDate && !targetDate) return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
      <CalendarRange size={10} className="shrink-0" />
      {startDate ? formatDate(startDate) : '—'}
      {' → '}
      {targetDate ? formatDate(targetDate) : '—'}
    </span>
  )
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TaskCard({ task, dimmed, onClick }: { task: Task; dimmed?: boolean; onClick?: () => void }) {
  const cfg = STATUS_CONFIG[task.status]
  const Icon = cfg.icon

  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex items-start gap-4 px-4 py-3.5 hover:bg-gray-50/80 transition-colors',
        onClick && 'cursor-pointer',
        dimmed && 'opacity-60',
      )}
    >
      {/* Status icon */}
      <div className="shrink-0 mt-0.5">
        <Icon size={15} style={{ color: cfg.dot }} strokeWidth={2} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 justify-between">
          <p className={cn(
            'text-[13px] font-semibold leading-snug',
            dimmed ? 'text-gray-500 line-through' : 'text-gray-900',
          )}>
            {task.title}
          </p>
          <DeadlineBadge targetDate={task.target_date} status={task.status} />
        </div>

        {task.description && (
          <p className="text-[12px] text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
        )}

        {/* Meta pills */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {task.requirement && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-violet-50 text-violet-700 border border-violet-200/80 px-2 py-0.5 rounded-md font-medium truncate max-w-[220px]">
              <FileText size={9} className="shrink-0" />
              {task.requirement.title}
            </span>
          )}
          {task.app && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-md font-medium">
              <AppWindow size={9} className="shrink-0" />
              {task.app.name}
            </span>
          )}
          <DateRange startDate={task.start_date} targetDate={task.target_date} />
        </div>
      </div>
    </div>
  )
}

// ─── Status group ─────────────────────────────────────────────────────────────

function StatusGroup({
  status, tasks, onTaskClick,
}: {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (task: Task) => void
}) {
  const [open, setOpen] = useState(status !== 'done')
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  const isDone = status === 'done'

  if (tasks.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden animate-fade-in-up">
      {/* Group header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 transition-colors',
          open ? cfg.headerBg : 'hover:bg-gray-50',
        )}
      >
        <Icon size={14} style={{ color: cfg.dot }} strokeWidth={2.5} />
        <span className={cn('text-[12px] font-semibold', cfg.headerText)}>{cfg.label}</span>
        <span className={cn(
          'text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none',
          cfg.badgeBg, cfg.badgeText,
        )}>
          {tasks.length}
        </span>
        <ChevronDown
          size={13}
          className={cn('ml-auto text-gray-400 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* Task list */}
      {open && (
        <div className="divide-y divide-gray-100/80">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              dimmed={isDone}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL = '__all__'

export default function TasksPage() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState(ALL)
  const [appFilter, setApp]       = useState(ALL)
  const [openedReq, setOpenedReq] = useState<Requirement | null>(null)
  const [openedTaskId, setOpenedTaskId] = useState<string | null>(null)

  const handleTaskClick = (task: Task) => {
    if (!task.requirement) return
    setOpenedReq(task.requirement)
    setOpenedTaskId(task.id)
  }

  const handleCloseReq = () => {
    setOpenedReq(null)
    setOpenedTaskId(null)
  }

  const allTasksQuery = useAllTasksQuery({
    status: statusFilter !== ALL ? statusFilter : undefined,
    app_id: appFilter   !== ALL ? appFilter   : undefined,
  })
  const { data: tasks = [], isLoading } = useQuery(allTasksQuery)

  const appsQuery = useAppsQuery()
  const { data: apps = [] } = useQuery(appsQuery)

  const appOptions = [
    { value: ALL, label: 'All Apps' },
    ...apps.map((a) => ({ value: a.id, label: a.name })),
  ]

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks
    const s = search.toLowerCase()
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(s) ||
        t.description?.toLowerCase().includes(s) ||
        t.requirement?.title?.toLowerCase().includes(s) ||
        t.app?.name?.toLowerCase().includes(s),
    )
  }, [tasks, search])

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [], blocked: [] }
    for (const t of filtered) {
      map[t.status]?.push(t)
    }
    return map
  }, [filtered])

  const totalActive = grouped.in_progress.length + grouped.blocked.length + grouped.todo.length

  return (
    <div className="space-y-5 w-full">

      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold text-gray-900">Tasks</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          {isLoading ? 'Loading…' : `${totalActive} active · ${grouped.done.length} completed`}
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, requirements, apps…"
            className="w-full pl-8 pr-3 py-[7px] text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-gray-400"
          />
        </div>
        <SingleSelect
          value={statusFilter}
          onChange={setStatus}
          options={STATUS_OPTIONS}
          className="px-3 py-[7px] text-[13px] min-w-[140px]"
        />
        <SingleSelect
          value={appFilter}
          onChange={setApp}
          options={appOptions}
          className="px-3 py-[7px] text-[13px] min-w-[130px]"
        />
      </div>

      {/* Groups */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-[200px] skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-[13px] text-gray-400">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {STATUS_ORDER.map((status) => (
            <StatusGroup
              key={status}
              status={status}
              tasks={grouped[status]}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      )}

      {openedReq && (
        <RequirementPanel
          requirement={openedReq}
          initialTaskId={openedTaskId ?? undefined}
          onClose={handleCloseReq}
        />
      )}
    </div>
  )
}
