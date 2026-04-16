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

const STATUS_COLORS: Record<string, string> = {
  draft: '#9CA3AF', review: '#F59E0B', approved: '#10B981', rejected: '#EF4444',
}
const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444', high: '#F97316', medium: '#3B82F6', low: '#9CA3AF',
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const dashQuery = useDashboardQuery()
  const myReqQuery = useMyRequirementsQuery()

  const { data: metrics, isLoading } = useQuery({ ...dashQuery, refetchInterval: 60_000 })
  const { data: myReqs } = useQuery(myReqQuery)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const statusChartData = metrics?.by_status?.map((s) => ({
    name: statusConfig[s.status as Status]?.label || s.status,
    count: Number(s.count),
    fill: STATUS_COLORS[s.status] || '#9CA3AF',
  })) || []

  const priorityChartData = metrics?.by_priority?.map((p) => ({
    name: priorityConfig[p.priority as Priority]?.label || p.priority,
    value: Number(p.count),
    color: PRIORITY_COLORS[p.priority] || '#9CA3AF',
  })) || []

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Requirements" value={metrics?.total || 0} color="#6366F1" />
        <MetricCard label="Approved" value={metrics?.approved || 0} color="#10B981" />
        <MetricCard label="In Review" value={metrics?.in_review || 0} color="#F59E0B" />
        <MetricCard label="Critical Open" value={metrics?.critical_open || 0} color="#EF4444" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Requirements by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusChartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Requirements by Priority</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {priorityChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {!metrics?.recent_activity?.length && <p className="text-sm text-gray-400">No activity yet</p>}
            {metrics?.recent_activity?.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <UserAvatar user={a.actor} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{a.actor?.full_name}</span>{' '}
                    {actionLabel(a.action)}{' '}
                    {a.requirement_title && (
                      <span className="text-indigo-600 font-medium">"{a.requirement_title}"</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{formatRelative(a.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">My Assigned Requirements</h3>
          {!myReqs?.length ? (
            <p className="text-sm text-gray-400">No requirements assigned to you</p>
          ) : (
            <div className="space-y-2">
              {myReqs.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="text-sm font-medium text-gray-800 truncate mr-3 flex-1">{r.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
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
