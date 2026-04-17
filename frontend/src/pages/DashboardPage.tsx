import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useDashboardQuery, useMyRequirementsQuery } from '@/hooks/useApi'
import { statusConfig, priorityConfig, formatRelative, actionLabel } from '@/utils'
import UserAvatar from '@/components/requirements/UserAvatar'
import StatusBadge from '@/components/requirements/StatusBadge'
import PriorityBadge from '@/components/requirements/PriorityBadge'
import type { Status, Priority } from '@/types'
import { CheckCircle2, Clock, AlertCircle, BarChart2, TrendingUp, Activity } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  draft: '#9ca3af', review: '#f59e0b', approved: '#10b981', rejected: '#ef4444',
}
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af',
}

const METRIC_ICONS = [BarChart2, CheckCircle2, Clock, AlertCircle]
const METRIC_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-400',
  'from-red-400 to-rose-500',
]
const METRIC_BG = ['bg-violet-50', 'bg-emerald-50', 'bg-amber-50', 'bg-red-50']
const METRIC_TEXT = ['text-violet-600', 'text-emerald-600', 'text-amber-600', 'text-red-600']

function MetricCard({ label, value, idx }: { label: string; value: number; idx: number }) {
  const Icon = METRIC_ICONS[idx]
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-medium text-gray-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${METRIC_BG[idx]} flex items-center justify-center shrink-0`}>
          <Icon size={16} className={METRIC_TEXT[idx]} />
        </div>
      </div>
      <p className={`text-[28px] font-bold ${METRIC_TEXT[idx]}`}>{value}</p>
    </div>
  )
}

function SkeletonCard() {
  return <div className="bg-white rounded-xl border border-gray-200 h-24 skeleton" />
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-[12px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color }}>{p.value} items</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const dashQuery  = useDashboardQuery()
  const myReqQuery = useMyRequirementsQuery()

  const { data: metrics, isLoading } = useQuery({ ...dashQuery, refetchInterval: 60_000 })
  const { data: myReqs }             = useQuery(myReqQuery)

  const metricItems = [
    { label: 'Total Requirements', value: metrics?.total || 0 },
    { label: 'Approved',           value: metrics?.approved || 0 },
    { label: 'In Review',          value: metrics?.in_review || 0 },
    { label: 'Critical Open',      value: metrics?.critical_open || 0 },
  ]

  const statusChartData = metrics?.by_status?.map((s) => ({
    name: statusConfig[s.status as Status]?.label || s.status,
    count: Number(s.count),
    fill: STATUS_COLORS[s.status] || '#9ca3af',
  })) || []

  const priorityChartData = metrics?.by_priority?.map((p) => ({
    name: priorityConfig[p.priority as Priority]?.label || p.priority,
    value: Number(p.count),
    color: PRIORITY_COLORS[p.priority] || '#9ca3af',
  })) || []

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [1,2,3,4].map((i) => <SkeletonCard key={i} />)
          : metricItems.map((m, i) => <MetricCard key={m.label} {...m} idx={i} />)
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-violet-500" />
            <h3 className="text-[13px] font-semibold text-gray-700">Requirements by Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} barSize={32} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
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
            <h3 className="text-[13px] font-semibold text-gray-700">Requirements by Priority</h3>
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

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
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

        {/* My Requirements */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={15} className="text-violet-500" />
            <h3 className="text-[13px] font-semibold text-gray-700">My Requirements</h3>
            {myReqs?.length ? (
              <span className="ml-auto text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{myReqs.length}</span>
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
