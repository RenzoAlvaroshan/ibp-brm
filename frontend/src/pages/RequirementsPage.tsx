import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Download, Columns3, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react'
import {
  useRequirementsQuery, useTagsQuery, useUsersQuery, useDeleteRequirement,
} from '@/hooks/useApi'
import type { Requirement, Status, Priority, RequirementFilters } from '@/types'
import StatusBadge from '@/components/requirements/StatusBadge'
import PriorityBadge from '@/components/requirements/PriorityBadge'
import UserAvatar from '@/components/requirements/UserAvatar'
import RequirementModal from '@/components/requirements/RequirementModal'
import RequirementPanel from '@/components/requirements/RequirementPanel'
import { formatDate } from '@/utils'
import { useAuthStore } from '@/store/auth'
import { useDemoStore } from '@/store/demo'
import { requirementsApi } from '@/api/endpoints'

export default function RequirementsPage() {
  const { user } = useAuthStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)
  const [editReq, setEditReq] = useState<Requirement | null>(null)

  const canCreate = user?.role === 'admin' || user?.role === 'editor'

  const filters: RequirementFilters = {
    status: (searchParams.get('status') as Status) || undefined,
    priority: (searchParams.get('priority') as Priority) || undefined,
    tag: searchParams.get('tag') || undefined,
    assignee: searchParams.get('assignee') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'created_at',
    dir: (searchParams.get('dir') as 'asc' | 'desc') || 'desc',
    page: Number(searchParams.get('page') || 1),
    limit: 20,
  }

  const reqQuery = useRequirementsQuery(filters)
  const tagsQuery = useTagsQuery()
  const usersQuery = useUsersQuery()
  const deleteReq = useDeleteRequirement()

  const { data, isLoading } = useQuery(reqQuery)
  const { data: tags } = useQuery(tagsQuery)
  const { data: users } = useQuery(usersQuery)

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setSearchParams(params)
  }

  const setSort = (field: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', field)
    params.set('dir', filters.sort === field && filters.dir === 'asc' ? 'desc' : 'asc')
    setSearchParams(params)
  }

  const exportCSV = async () => {
    if (isDemoMode) {
      // client-side CSV from demo data
      const reqs = data?.data || []
      const rows = [
        'ID,Title,Status,Priority,AssignedTo,DueDate,CreatedAt',
        ...reqs.map((r) =>
          [r.id, `"${r.title}"`, r.status, r.priority, r.assigned_to?.full_name || '', r.due_date?.split('T')[0] || '', r.created_at.split('T')[0]].join(',')
        ),
      ].join('\n')
      const blob = new Blob([rows], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'requirements.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV exported')
      return
    }
    try {
      const res = await requirementsApi.exportCsv(filters)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = 'requirements.csv'; a.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV exported')
    } catch { toast.error('Export failed') }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sort !== field) return null
    return filters.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  const reqs = data?.data || []
  const total = data?.total || 0
  const page = filters.page || 1
  const totalPages = Math.ceil(total / (filters.limit || 20))

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          defaultValue={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        />
        <select value={filters.status || ''} onChange={(e) => setFilter('status', e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filters.priority || ''} onChange={(e) => setFilter('priority', e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filters.tag || ''} onChange={(e) => setFilter('tag', e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Tags</option>
          {tags?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filters.assignee || ''} onChange={(e) => setFilter('assignee', e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Assignees</option>
          {users?.map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">{total} results</span>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => navigate('/kanban')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
            <Columns3 size={14} /> Kanban
          </button>
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
              <Plus size={14} /> New
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => setSort('title')}>
                  <div className="flex items-center gap-1">Title <SortIcon field="title" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => setSort('priority')}>
                  <div className="flex items-center gap-1">Priority <SortIcon field="priority" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Assignee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => setSort('due_date')}>
                  <div className="flex items-center gap-1">Due <SortIcon field="due_date" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => setSort('created_at')}>
                  <div className="flex items-center gap-1">Created <SortIcon field="created_at" /></div>
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full" /> Loading...
                  </div>
                </td></tr>
              ) : reqs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No requirements found</td></tr>
              ) : (
                reqs.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedReq(req)}>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="font-medium text-gray-900 line-clamp-1">{req.title}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} size="sm" /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={req.priority} size="sm" /></td>
                    <td className="px-4 py-3"><UserAvatar user={req.assigned_to} size="sm" showName /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {req.tags?.slice(0, 3).map((t) => (
                          <span key={t.id} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: t.color + '20', color: t.color }}>{t.name}</span>
                        ))}
                        {(req.tags?.length || 0) > 3 && <span className="text-xs text-gray-400">+{(req.tags?.length || 0) - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(req.due_date)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(req.created_at)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {canCreate && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditReq(req)} className="p-1 text-gray-400 hover:text-indigo-600 rounded"><Pencil size={13} /></button>
                          <button
                            onClick={() => { if (confirm('Delete this requirement?')) deleteReq(req.id).catch(() => toast.error('Failed to delete')) }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          ><Trash2 size={13} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setFilter('page', String(page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs border rounded hover:bg-white disabled:opacity-40">Previous</button>
              <button onClick={() => setFilter('page', String(page + 1))} disabled={page >= totalPages} className="px-3 py-1 text-xs border rounded hover:bg-white disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {showCreate && <RequirementModal onClose={() => setShowCreate(false)} />}
      {editReq && <RequirementModal requirement={editReq} onClose={() => setEditReq(null)} />}
      {selectedReq && <RequirementPanel requirement={selectedReq} onClose={() => setSelectedReq(null)} />}
    </div>
  )
}
