import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useDashboardQuery, useMyRequirementsQuery, useTagsQuery } from '@/hooks/useApi'
import { statusConfig, priorityConfig, formatRelative, actionLabel, cn } from '@/utils'
import UserAvatar from '@/components/requirements/UserAvatar'
import StatusBadge from '@/components/requirements/StatusBadge'
import PriorityBadge from '@/components/requirements/PriorityBadge'
import type { DashboardFilters, Priority, Status } from '@/types'
import { MultiSelect } from '@/components/ui/Select'
import {
  CheckCircle2, Clock, AlertCircle, BarChart2, TrendingUp, Activity,
  SlidersHorizontal, X,
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  todo: '#9ca3af', requirement_gathering: '#3b82f6', development: '#6366f1',
  sit: '#f59e0b', uat: '#8b5cf6', d2p: '#ec4899', production_test: '#f97316', completed: '#10b981',
}
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af',
}

const METRIC_ICONS = [BarChart2, CheckCircle2, Clock, AlertCircle]
const METRIC_BG    = ['bg-violet-50', 'bg-emerald-50', 'bg-amber-50', 'bg-red-50']
const METRIC_TEXT  = ['text-violet-600', 'text-emerald-600', 'text-amber-600', 'text-red-600']

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

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, idx }: { label: string; value: number; idx: number }) {
  const Icon = METRIC_ICONS[idx]
  return (
    <div
      className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${idx * 55}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-medium text-gray-500 leading-tight">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${METRIC_BG[idx]} flex items-center justify-center shrink-0`}>
          <Icon size={16} className={METRIC_TEXT[idx]} />
        </div>
      </div>
      <p className={`text-[30px] font-bold tabular-nums ${METRIC_TEXT[idx]}`}>{value}</p>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-white rounded-xl border border-gray-200 h-[88px] skeleton" />
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color }}>{p.value} items</p>
      ))}
    </div>
  )
}

// ─── Active filter chip ───────────────────────────────────────────────────────

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
    { label: 'Completed',          value: metrics?.approved      ?? 0 },
    { label: 'In Review',          value: metrics?.in_review     ?? 0 },
    { label: 'Critical Open',      value: metrics?.critical_open ?? 0 },
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

  return (
    <div className="space-y-5 max-w-7xl">

      {/* ── Filter bar ────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle button */}
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

          {/* Active chips (when bar is closed) */}
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
              <button
                onClick={clearAll}
                className="text-[11px] text-red-400 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>

        {/* Expanded filter controls */}
        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
            {/* Date range */}
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

      {/* ── Metric cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1,2,3,4].map((i) => <SkeletonCard key={i} />)
          : metricItems.map((m, i) => <MetricCard key={m.label} {...m} idx={i} />)
        }
      </div>

      {/* ── Charts ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-violet-500" />
            <h3 className="text-[13px] font-semibold text-gray-700">By Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} barSize={28} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
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

      {/* ── Bottom row ────────────────────────────────────── */}
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
