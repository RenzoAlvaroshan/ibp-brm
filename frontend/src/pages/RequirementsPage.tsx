import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus, Download, ChevronDown, ChevronRight, Pencil, Trash2,
  Calendar, Filter, LayoutList, ListTree,
} from 'lucide-react'
import {
  DndContext, DragEndEvent, PointerSensor,
  closestCenter, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useRequirementsQuery, useTagsQuery, useUsersQuery,
  useDeleteRequirement, useReorderRequirements,
} from '@/hooks/useApi'
import { SingleSelect, UserSelect } from '@/components/ui/Select'
import type { Requirement, Status, Priority, RequirementFilters } from '@/types'
import StatusBadge from '@/components/requirements/StatusBadge'
import PriorityBadge from '@/components/requirements/PriorityBadge'
import UserAvatar from '@/components/requirements/UserAvatar'
import RequirementModal from '@/components/requirements/RequirementModal'
import RequirementPanel from '@/components/requirements/RequirementPanel'
import TaskSubrowList from '@/components/requirements/TaskSubrowList'
import TaskModal from '@/components/requirements/TaskModal'
import { formatDate } from '@/utils'
import { useAuthStore } from '@/store/auth'
import { useDemoStore } from '@/store/demo'
import { requirementsApi } from '@/api/endpoints'
import { cn } from '@/utils'

function useSubtaskCount(requirementId: string): number | undefined {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  return useDemoStore((s) => (isDemoMode ? s.tasks[requirementId]?.length ?? 0 : undefined))
}

const STATUS_ORDER: Status[] = ['todo', 'requirement_gathering', 'development', 'sit', 'uat', 'd2p', 'production_test', 'completed']

const STATUS_HEADER: Record<Status, { label: string; color: string; dot: string }> = {
  todo:                 { label: 'To Do',              color: 'text-gray-600',   dot: 'bg-gray-400' },
  requirement_gathering:{ label: 'Req. Gathering',     color: 'text-blue-700',   dot: 'bg-blue-400' },
  development:          { label: 'Development',        color: 'text-indigo-700', dot: 'bg-indigo-400' },
  sit:                  { label: 'SIT',                color: 'text-amber-700',  dot: 'bg-amber-400' },
  uat:                  { label: 'UAT',                color: 'text-violet-700', dot: 'bg-violet-400' },
  d2p:                  { label: 'D2P',                color: 'text-pink-700',   dot: 'bg-pink-400' },
  production_test:      { label: 'Production Test',    color: 'text-orange-700', dot: 'bg-orange-400' },
  completed:            { label: 'Completed',          color: 'text-emerald-700',dot: 'bg-emerald-400' },
}

const PRIORITY_COLOR: Record<Priority, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#3b82f6',
  low:      '#9ca3af',
}

interface RowProps {
  req: Requirement
  canCreate: boolean
  draggable: boolean
  onOpen: (r: Requirement) => void
  onEdit: (r: Requirement) => void
  onDelete: (r: Requirement) => void
  onAddSubtask: (r: Requirement) => void
}

function TagPills({ tags, max = 1 }: { tags?: Requirement['tags']; max?: number }) {
  if (!tags || tags.length === 0) return null
  const shown = tags.slice(0, max)
  const extra = tags.length - shown.length
  const overflowTitle = tags.slice(max).map((t) => t.name).join(', ')
  return (
    <div className="flex items-center gap-1 min-w-0">
      {shown.map((t) => (
        <span
          key={t.id}
          className="inline-flex items-center px-1.5 py-[1px] rounded-full text-[10px] font-medium bg-transparent text-gray-500 whitespace-nowrap max-w-[120px] truncate ring-[0.5px] ring-gray-300/80"
          title={t.name}
        >
          {t.name}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[10px] font-medium text-gray-400 px-1" title={overflowTitle}>+{extra} more</span>
      )}
    </div>
  )
}

function MetaDivider() {
  return <span className="mx-2 w-px h-4 bg-gray-200 shrink-0" aria-hidden />
}

function RequirementRow({ req, canCreate, draggable, onOpen, onEdit, onDelete, onAddSubtask }: RowProps) {
  const [expanded, setExpanded] = useState(false)
  const subtaskCount = useSubtaskCount(req.id)
  const hasTasks = subtaskCount === undefined ? true : subtaskCount > 0

  const sortable = useSortable({ id: req.id, disabled: !draggable })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : undefined,
        zIndex: isDragging ? 20 : undefined,
        position: 'relative',
      }}
      className="border-b border-gray-100 last:border-0 bg-white"
    >
      <div
        {...(draggable ? attributes : {})}
        {...(draggable ? listeners : {})}
        className="req-row group flex items-center gap-0 cursor-pointer"
        onClick={() => onOpen(req)}
      >
        {/* Priority color bar */}
        <div className="w-1 self-stretch shrink-0 rounded-l" style={{ backgroundColor: PRIORITY_COLOR[req.priority] }} />

        <div className="flex-1 flex items-center gap-2 px-2 py-2.5 min-w-0">
          {/* Expand toggle (only if it has subtasks) or Add subtask on hover */}
          {hasTasks ? (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
              aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
              className="shrink-0 p-1 -ml-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : canCreate ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAddSubtask(req) }}
              title="Create subtask"
              aria-label="Create subtask"
              className="shrink-0 p-1 -ml-1 rounded text-gray-300 hover:text-violet-600 hover:bg-violet-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <Plus size={13} />
            </button>
          ) : (
            <span className="shrink-0 w-[22px]" />
          )}

          {/* Title */}
          <span className="flex-1 min-w-0 text-[13px] font-medium text-gray-800 truncate">{req.title}</span>

          {/* Meta row */}
          <div className="flex items-center gap-2 shrink-0">
            {req.due_date && (
              <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
                <Calendar size={11} />
                {formatDate(req.due_date)}
              </div>
            )}

            <div className="hidden sm:flex items-center">
              {/* Assignee zone */}
              <div className="flex items-center justify-center w-7 shrink-0">
                <UserAvatar user={req.assigned_to} size="sm" variant="dark" />
              </div>

              <MetaDivider />

              {/* Priority zone */}
              <PriorityBadge priority={req.priority} mode="muted" />

              <MetaDivider />

              {/* Status zone */}
              <StatusBadge status={req.status} size="sm" />

              {req.tags && req.tags.length > 0 && (
                <>
                  <MetaDivider />
                  <TagPills tags={req.tags} max={1} />
                </>
              )}
            </div>

            {/* Mobile fallback */}
            <div className="sm:hidden">
              <StatusBadge status={req.status} size="sm" />
            </div>

            {canCreate && (
              <div
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onEdit(req)}
                  className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                  aria-label="Edit requirement"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDelete(req)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  aria-label="Delete requirement"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className="pl-9 pr-3 py-1.5 bg-gray-50/60 border-t border-gray-100 animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-400 px-2 py-1">
            <ListTree size={11} />
            Subtasks
          </div>
          <TaskSubrowList requirement={req} onTaskClick={() => onOpen(req)} />
        </div>
      )}
    </div>
  )
}

function StatusGroup({
  status, reqs, canCreate, hideWhenEmpty, onOpen, onEdit, onDelete, onAddNew, onAddSubtask, onReorder,
}: {
  status: Status
  reqs: Requirement[]
  canCreate: boolean
  hideWhenEmpty: boolean
  onOpen: (r: Requirement) => void
  onEdit: (r: Requirement) => void
  onDelete: (r: Requirement) => void
  onAddNew: (s: Status) => void
  onAddSubtask: (r: Requirement) => void
  onReorder: (status: Status, orderedIds: string[]) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const cfg = STATUS_HEADER[status]

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = reqs.findIndex((r) => r.id === active.id)
    const newIdx = reqs.findIndex((r) => r.id === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const ordered = arrayMove(reqs, oldIdx, newIdx).map((r) => r.id)
    onReorder(status, ordered)
  }

  if (hideWhenEmpty && reqs.length === 0) return null

  return (
    <div className="mb-3">
      {/* Group header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100/80 rounded-lg transition-colors group"
      >
        <span className="text-gray-400 transition-transform duration-150" style={{ transform: collapsed ? 'rotate(-90deg)' : 'none' }}>
          <ChevronDown size={14} />
        </span>
        <span className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
        <span className={cn('text-[12px] font-semibold uppercase tracking-wide', cfg.color)}>{cfg.label}</span>
        <span className="ml-1 text-[11px] font-medium text-gray-400 bg-gray-100 group-hover:bg-gray-200 px-1.5 py-0.5 rounded-full transition-colors">
          {reqs.length}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-1 bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden animate-fade-in-up">
          {reqs.length === 0 ? (
            <div className="px-4 py-4 text-center text-[12px] text-gray-400">
              No {cfg.label.toLowerCase()} requirements
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={reqs.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                {reqs.map((req) => (
                  <RequirementRow
                    key={req.id}
                    req={req}
                    canCreate={canCreate}
                    draggable={canCreate}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddSubtask={onAddSubtask}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {canCreate && (
            <button
              onClick={() => onAddNew(status)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] text-gray-400 hover:text-violet-600 hover:bg-violet-50/50 transition-colors border-t border-gray-100"
            >
              <Plus size={13} /> Add requirement
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function RequirementsPage() {
  const { user } = useAuthStore()
  const isDemoMode = useDemoStore((s) => s.isDemoMode)
  const [searchParams, setSearchParams] = useSearchParams()

  const [showCreate, setShowCreate] = useState(false)
  const [createStatus, setCreateStatus] = useState<Status | undefined>()
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)
  const [editReq, setEditReq] = useState<Requirement | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [subtaskFor, setSubtaskFor] = useState<Requirement | null>(null)

  const reorderReqs = useReorderRequirements()

  const canCreate = user?.role === 'admin' || user?.role === 'editor'

  const filters: RequirementFilters = {
    status: (searchParams.get('status') as Status) || undefined,
    priority: (searchParams.get('priority') as Priority) || undefined,
    tag: searchParams.get('tag') || undefined,
    assignee: searchParams.get('assignee') || undefined,
    search: searchParams.get('search') || undefined,
    sort: 'created_at',
    dir: 'desc',
    limit: 200,
  }

  const reqQuery  = useRequirementsQuery(filters)
  const tagsQuery = useTagsQuery()
  const usersQuery = useUsersQuery()
  const deleteReq = useDeleteRequirement()

  const { data, isLoading } = useQuery(reqQuery)
  const { data: tags }      = useQuery(tagsQuery)
  const { data: users }     = useQuery(usersQuery)

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const activeFilterCount = [filters.status, filters.priority, filters.tag, filters.assignee, filters.search].filter(Boolean).length

  const exportCSV = async () => {
    if (isDemoMode) {
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

  const allReqs = data?.data || []
  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = allReqs
      .filter((r) => r.status === s)
      .sort((a, b) => a.position - b.position)
    return acc
  }, {} as Record<Status, Requirement[]>)

  const handleReorder = (status: Status, orderedIds: string[]) => {
    const items = orderedIds.map((id, i) => ({ id, position: i, status }))
    reorderReqs(items).catch(() => toast.error('Failed to save order'))
  }

  const handleDelete = (req: Requirement) => {
    if (!confirm(`Delete "${req.title}"?`)) return
    deleteReq(req.id).catch(() => toast.error('Failed to delete'))
  }

  const handleAddNew = (status: Status) => {
    setCreateStatus(status)
    setShowCreate(true)
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search requirements..."
            value={filters.search ?? ''}
            onChange={(e) => setFilter('search', e.target.value)}
            className="px-3 py-1.5 text-[13px] bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all w-52 placeholder:text-gray-400"
          />

          {/* Assigned to me quick filter */}
          <button
            onClick={() => setFilter('assignee', filters.assignee === user?.id ? '' : (user?.id ?? ''))}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[13px] border rounded-md transition-colors whitespace-nowrap',
              filters.assignee === user?.id
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            My items
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[13px] border rounded-md transition-colors',
              showFilters || activeFilterCount > 0
                ? 'bg-violet-50 border-violet-200 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            <Filter size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-violet-600 text-white text-[10px] font-bold px-1 rounded-full leading-tight">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-gray-400 mr-1">{allReqs.length} items</span>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-white border border-gray-200 rounded-lg animate-fade-in-up flex-wrap">
          <SingleSelect
            value={filters.status || ''}
            onChange={(v) => setFilter('status', v)}
            options={[
              { value: 'todo',                  label: 'To Do',           dot: '#9ca3af' },
              { value: 'requirement_gathering', label: 'Req. Gathering',  dot: '#3b82f6' },
              { value: 'development',           label: 'Development',     dot: '#6366f1' },
              { value: 'sit',                   label: 'SIT',             dot: '#f59e0b' },
              { value: 'uat',                   label: 'UAT',             dot: '#8b5cf6' },
              { value: 'd2p',                   label: 'D2P',             dot: '#ec4899' },
              { value: 'production_test',       label: 'Production Test', dot: '#f97316' },
              { value: 'completed',             label: 'Completed',       dot: '#10b981' },
            ]}
            placeholder="All Statuses"
            className="px-2.5 py-1.5 text-[13px]"
          />
          <SingleSelect
            value={filters.priority || ''}
            onChange={(v) => setFilter('priority', v)}
            options={[
              { value: 'critical', label: 'Critical', dot: '#ef4444' },
              { value: 'high',     label: 'High',     dot: '#f97316' },
              { value: 'medium',   label: 'Medium',   dot: '#3b82f6' },
              { value: 'low',      label: 'Low',      dot: '#9ca3af' },
            ]}
            placeholder="All Priorities"
            className="px-2.5 py-1.5 text-[13px]"
          />
          <SingleSelect
            value={filters.tag || ''}
            onChange={(v) => setFilter('tag', v)}
            options={tags?.map((t) => ({ value: t.id, label: t.name, dot: t.color })) ?? []}
            placeholder="All Tags"
            className="px-2.5 py-1.5 text-[13px]"
          />
          <UserSelect
            value={filters.assignee || ''}
            onChange={(v) => setFilter('assignee', v)}
            users={users}
            className="px-2.5 py-1.5 text-[13px]"
          />
          {activeFilterCount > 0 && (
            <button
              onClick={() => setSearchParams({})}
              className="px-2.5 py-1.5 text-[13px] text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 skeleton rounded-lg" />
          ))}
        </div>
      ) : (
        <div>
          {STATUS_ORDER.map((status) => (
            <StatusGroup
              key={status}
              status={status}
              reqs={grouped[status]}
              canCreate={canCreate}
              hideWhenEmpty={activeFilterCount > 0}
              onOpen={setSelectedReq}
              onEdit={setEditReq}
              onDelete={handleDelete}
              onAddNew={handleAddNew}
              onAddSubtask={setSubtaskFor}
              onReorder={handleReorder}
            />
          ))}
          {allReqs.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <LayoutList size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-[14px] font-medium">No requirements found</p>
              <p className="text-[13px] mt-1">
                {activeFilterCount > 0 ? 'Try clearing your filters' : 'Create your first requirement to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <RequirementModal
          defaultStatus={createStatus}
          onClose={() => { setShowCreate(false); setCreateStatus(undefined) }}
        />
      )}
      {editReq && <RequirementModal requirement={editReq} onClose={() => setEditReq(null)} />}
      {selectedReq && <RequirementPanel requirement={selectedReq} onClose={() => setSelectedReq(null)} />}
      {subtaskFor && (
        <TaskModal
          requirementId={subtaskFor.id}
          onClose={() => setSubtaskFor(null)}
        />
      )}
    </div>
  )
}
