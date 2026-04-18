import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts'
import { useDashboardQuery, useMyRequirementsQuery, useTagsQuery } from '@/hooks/useApi'
import { statusConfig, priorityConfig, formatRelative, formatDate, actionLabel, cn } from '@/utils'
import UserAvatar from '@/components/requirements/UserAvatar'
import StatusBadge from '@/components/requirements/StatusBadge'
import PriorityBadge from '@/components/requirements/PriorityBadge'
import type { DashboardFilters, DashboardReqItem, Priority, Status } from '@/types'
import { MultiSelect } from '@/components/ui/Select'
import {
  CheckCircle2, BarChart2, TrendingUp, Activity,
  SlidersHorizontal, X, AlertTriangle, CalendarDays, Users, Tag as TagIcon,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  todo: '#9ca3af', requirement_gathering: '#3b82f6', development: '#6366f1',
  sit: '#f59e0b', uat: '#8b5cf6', d2p: '#ec4899', production_test: '#f97316', completed: '#10b981',
}
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af',
}
const PRIORITY_HEX: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af',
}

const STATUS_OPTIONS  = [
  { value: 'todo',                  label: 'To Do',           dot: '#9ca3af' },
  { value: 'requirement_gathering', label: 'Req. Gathering',  dot: '#3b82f6' },
  { value: 'development',           label: 'Development',     dot: '#6366f1' },
  { value: 'sit',                   label: 'SIT',             dot: '#f59e0b' },
  { value: 'uat',                   label: 'UAT',             dot: '#8b5cf6' },
  { value: 'd2p',                   label: 'D2P',             dot: '#ec4899' },
  { value: 'production_test',       label: 'Production Test', dot: '#f97316' },
  { value: 'completed',             label: 'Completed',       dot: '#10b981' },
]
const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', dot: '#ef4444' },
  { value: 'high',     label: 'High',     dot: '#f97316' },
  { value: 'medium',   label: 'Medium',   dot: '#3b82f6' },
  { value: 'low',      label: 'Low',      dot: '#9ca3af' },
]

// ─── Metric card ─────────────────────────────────────────────────────────────

const METRIC_CONFIG = [
  { icon: BarChart2,     bg: 'bg-violet-50',  text: 'text-violet-600' },
  { icon: AlertTriangle, bg: 'bg-orange-50',  text: 'text-orange-600' },
  { icon: CalendarDays,  bg: 'bg-sky-50',     text: 'text-sky-600' },
]

function MetricCard({ label, value, idx }: { label: string; value: number; idx: number }) {
  const { icon: Icon, bg, text } = METRIC_CONFIG[idx] ?? METRIC_CONFIG[0]
  return (
    <div
      className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-medium text-gray-500 leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon size={16} className={text} />
        </div>
      </div>
      <p className={`text-[30px] font-bold tabular-nums ${text}`}>{value}</p>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-white rounded-xl border border-gray-200 h-[88px] skeleton" />
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color || p.stroke }}>{p.value} items</p>
      ))}
    </div>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, dot, onRemove }: { label: string; dot?: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-violet-50 border border-violet-200 rounded-full text-[11px] text-violet-700 font-medium">
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
      {label}
      <button onClick={onRemove} className="p-0.5 rounded-full hover:bg-violet-200 transition-colors ml-0.5">
        <X size={10} />
      </button>
    </span>
  )
}

// ─── Throughput chart ────────────────────────────────────────────────────────

function ThroughputChart({ data }: { data: { week: string; count: number }[] }) {
  const formatted = data.map((d) => ({
    label: new Date(d.week + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: Number(d.count),
  }))
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={15} className="text-violet-500" />
        <h3 className="text-[13px] font-semibold text-gray-700">Weekly Completions</h3>
        <span className="ml-auto text-[11px] text-gray-400">Last 8 weeks</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#throughputGrad)"
            dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#6366f1' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Horizontal bar chart (by tag / by assignee) ──────────────────────────────

function HBarChart({
  title, icon, data,
}: {
  title: string
  icon: React.ReactNode
  data: { name: string; count: number; color?: string }[]
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
      </div>
      {data.length === 0 ? (
        <p className="text-[13px] text-gray-400 py-4 text-center">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 32, 80)}>
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={14}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ─── Req list item ────────────────────────────────────────────────────────────

function ReqListItem({ item, isOverdue }: { item: DashboardReqItem; isOverdue?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 -mx-2 transition-colors group">
      <div
        className="w-1 self-stretch rounded-full shrink-0 min-h-[36px]"
        style={{ backgroundColor: PRIORITY_HEX[item.priority] ?? '#9ca3af' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800 truncate">{item.title}</p>
        <p className={cn('text-[11px] mt-0.5', isOverdue ? 'text-red-500 font-medium' : 'text-amber-600')}>
          {item.due_date ? formatDate(item.due_date) : '—'}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {item.assigned_to && <UserAvatar user={item.assigned_to} size="sm" />}
        <PriorityBadge priority={item.priority} size="sm" />
      </div>
    </div>
  )
}

function ReqListPanel({
  title, icon, items, isOverdue, emptyMsg,
}: {
  title: string
  icon: React.ReactNode
  items: DashboardReqItem[]
  isOverdue?: boolean
  emptyMsg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
        {items.length > 0 && (
          <span className="ml-auto text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] text-gray-400 py-2">{emptyMsg}</p>
      ) : (
        <div className="space-y-0.5">
          {items.map((item) => (
            <ReqListItem key={item.id} item={item} isOverdue={isOverdue} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const tagsQuery = useTagsQuery()
  const { data: tags } = useQuery(tagsQuery)

  const dashQuery  = useDashboardQuery(filters)
  const myReqQuery = useMyRequirementsQuery()

  const { data: metrics, isLoading } = useQuery({ ...dashQuery, refetchInterval: 60_000 })
  const { data: myReqs }             = useQuery(myReqQuery)

  const tagOptions = tags?.map((t) => ({ value: t.id, label: t.name, dot: t.color })) ?? []

  const setArr = <K extends keyof DashboardFilters>(key: K, val: string[]) =>
    setFilters((prev) => ({ ...prev, [key]: val.length ? val : undefined }))

  const setDate = (key: 'from_date' | 'to_date', val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val || undefined }))

  const activeCount =
    (filters.statuses?.length   ?? 0) +
    (filters.priorities?.length ?? 0) +
    (filters.tag_ids?.length    ?? 0) +
    (filters.from_date ? 1 : 0) +
    (filters.to_date   ? 1 : 0)

  const clearAll = () => setFilters({})

  const metricItems = [
    { label: 'Total Requirements', value: metrics?.total         ?? 0 },
    { label: 'Overdue',            value: metrics?.overdue       ?? 0 },
    { label: 'Due This Week',      value: metrics?.due_this_week ?? 0 },
  ]

  const statusChartData = metrics?.by_status?.map((s) => ({
    name:  statusConfig[s.status as Status]?.label || s.status,
    count: Number(s.count),
    fill:  STATUS_COLORS[s.status] || '#9ca3af',
  })) ?? []

  const priorityChartData = metrics?.by_priority?.map((p) => ({
    name:  priorityConfig[p.priority as Priority]?.label || p.priority,
    value: Number(p.count),
    color: PRIORITY_COLORS[p.priority] || '#9ca3af',
  })) ?? []

  const tagChartData = (metrics?.by_tag ?? []).map((t) => ({
    name:  t.tag_name,
    count: Number(t.count),
    color: t.color,
  }))

  const assigneeChartData = (metrics?.by_assignee ?? []).map((a) => ({
    name:  a.full_name.split(' ')[0],
    count: Number(a.count),
    color: '#6366f1',
  }))

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── Filter bar ──────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-all duration-150',
              showFilters || activeCount > 0
                ? 'bg-violet-50 border-violet-200 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
            )}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeCount > 0 && (
              <span className="bg-violet-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {activeCount}
              </span>
            )}
          </button>

          {!showFilters && activeCount > 0 && (
            <>
              {filters.from_date && (
                <Chip label={`From ${filters.from_date}`} onRemove={() => setDate('from_date', '')} />
              )}
              {filters.to_date && (
                <Chip label={`To ${filters.to_date}`} onRemove={() => setDate('to_date', '')} />
              )}
              {filters.statuses?.map((s) => (
                <Chip
                  key={s}
                  label={STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s}
                  dot={STATUS_OPTIONS.find((o) => o.value === s)?.dot}
                  onRemove={() => setArr('statuses', (filters.statuses ?? []).filter((x) => x !== s))}
                />
              ))}
              {filters.priorities?.map((p) => (
                <Chip
                  key={p}
                  label={PRIORITY_OPTIONS.find((o) => o.value === p)?.label ?? p}
                  dot={PRIORITY_OPTIONS.find((o) => o.value === p)?.dot}
                  onRemove={() => setArr('priorities', (filters.priorities ?? []).filter((x) => x !== p))}
                />
              ))}
              {filters.tag_ids?.map((id) => {
                const tag = tagOptions.find((o) => o.value === id)
                return tag ? (
                  <Chip
                    key={id}
                    label={tag.label}
                    dot={tag.dot}
                    onRemove={() => setArr('tag_ids', (filters.tag_ids ?? []).filter((x) => x !== id))}
                  />
                ) : null
              })}
              <button onClick={clearAll} className="text-[11px] text-red-400 hover:text-red-600 transition-colors">
                Clear all
              </button>
            </>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-gray-400">From</span>
              <input
                type="date"
                value={filters.from_date ?? ''}
                onChange={(e) => setDate('from_date', e.target.value)}
                className={cn(
                  'px-2.5 py-1.5 text-[12px] rounded-lg border transition-all bg-white',
                  filters.from_date
                    ? 'border-violet-200 text-violet-700 bg-violet-50'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-gray-400">To</span>
              <input
                type="date"
                value={filters.to_date ?? ''}
                onChange={(e) => setDate('to_date', e.target.value)}
                className={cn(
                  'px-2.5 py-1.5 text-[12px] rounded-lg border transition-all bg-white',
                  filters.to_date
                    ? 'border-violet-200 text-violet-700 bg-violet-50'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              />
            </div>
            <MultiSelect
              values={filters.statuses ?? []}
              onChange={(v) => setArr('statuses', v)}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
            <MultiSelect
              values={filters.priorities ?? []}
              onChange={(v) => setArr('priorities', v)}
              options={PRIORITY_OPTIONS}
              placeholder="All Priorities"
            />
            {tagOptions.length > 0 && (
              <MultiSelect
                values={filters.tag_ids ?? []}
                onChange={(v) => setArr('tag_ids', v)}
                options={tagOptions}
                placeholder="All Tags"
              />
            )}
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Metric cards (6) ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {isLoading
          ? [1,2,3].map((i) => <SkeletonCard key={i} />)
          : metricItems.map((m, i) => <MetricCard key={m.label} {...m} idx={i} />)
        }
      </div>

      {/* ── Charts row 1: Status + Priority ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-violet-500" />
            <h3 className="text-[13px] font-semibold text-gray-700">By Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} barSize={24} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {statusChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-violet-500" />
            <h3 className="text-[13px] font-semibold text-gray-700">By Priority</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={priorityChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {priorityChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-[11px] text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Throughput ───────────────────────────────────────── */}
      <ThroughputChart data={metrics?.throughput ?? []} />

      {/* ── Charts row 2: By Tag + By Assignee ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HBarChart
          title="By Tag"
          icon={<TagIcon size={15} className="text-violet-500" />}
          data={tagChartData}
        />
        <HBarChart
          title="Workload by Assignee"
          icon={<Users size={15} className="text-violet-500" />}
          data={assigneeChartData}
        />
      </div>

      {/* ── Overdue + Upcoming ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReqListPanel
          title="Overdue"
          icon={<AlertTriangle size={15} className="text-orange-500" />}
          items={metrics?.overdue_list ?? []}
          isOverdue
          emptyMsg="No overdue requirements"
        />
        <ReqListPanel
          title="Due This Week"
          icon={<CalendarDays size={15} className="text-sky-500" />}
          items={metrics?.upcoming_list ?? []}
          emptyMsg="Nothing due in the next 7 days"
        />
      </div>

      {/* ── Recent Activity + My Requirements ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-violet-500" />
            <h3 className="text-[13px] font-semibold text-gray-700">Recent Activity</h3>
          </div>
          <div className="space-y-3.5">
            {!metrics?.recent_activity?.length ? (
              <p className="text-[13px] text-gray-400 py-2">No recent activity</p>
            ) : (
              metrics.recent_activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <UserAvatar user={a.actor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-700 leading-snug">
                      <span className="font-medium">{a.actor?.full_name}</span>{' '}
                      {actionLabel(a.action)}
                      {a.requirement_title && (
                        <span className="text-violet-600 font-medium"> "{a.requirement_title}"</span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatRelative(a.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={15} className="text-violet-500" />
            <h3 className="text-[13px] font-semibold text-gray-700">My Requirements</h3>
            {myReqs?.length ? (
              <span className="ml-auto text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {myReqs.length}
              </span>
            ) : null}
          </div>
          {!myReqs?.length ? (
            <p className="text-[13px] text-gray-400 py-2">No requirements assigned to you</p>
          ) : (
            <div className="space-y-1.5">
              {myReqs.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors -mx-2">
                  <p className="text-[13px] font-medium text-gray-800 truncate mr-3 flex-1">{r.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={r.status} size="sm" />
                    <PriorityBadge priority={r.priority} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
