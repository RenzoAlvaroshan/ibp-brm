import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DndContext, DragEndEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Plus, MessageSquare, Calendar } from 'lucide-react'
import { useRequirementsQuery, useReorderRequirements } from '@/hooks/useApi'
import type { Requirement, Status } from '@/types'
import { formatDate } from '@/utils'
import UserAvatar from '@/components/requirements/UserAvatar'
import RequirementModal from '@/components/requirements/RequirementModal'
import RequirementPanel from '@/components/requirements/RequirementPanel'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/utils'

const COLUMNS: Status[] = ['draft', 'review', 'approved', 'rejected']

const COLUMN_CONFIG: Record<Status, { label: string; color: string; bg: string; headerBg: string; dotColor: string }> = {
  draft:    { label: 'Draft',     color: 'text-gray-600',   bg: 'bg-gray-50/80',     headerBg: 'bg-gray-100',   dotColor: '#9ca3af' },
  review:   { label: 'In Review', color: 'text-amber-700',  bg: 'bg-amber-50/40',    headerBg: 'bg-amber-100',  dotColor: '#f59e0b' },
  approved: { label: 'Approved',  color: 'text-emerald-700',bg: 'bg-emerald-50/40',  headerBg: 'bg-emerald-100',dotColor: '#10b981' },
  rejected: { label: 'Rejected',  color: 'text-red-600',    bg: 'bg-red-50/40',      headerBg: 'bg-red-100',    dotColor: '#ef4444' },
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#9ca3af',
}

function KanbanCard({ req, onClick, overlay = false }: { req: Requirement; onClick: () => void; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: req.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const priorityColor = PRIORITY_COLOR[req.priority] || '#9ca3af'

  return (
    <div
      ref={setNodeRef}
      style={overlay ? { borderLeft: `3px solid ${priorityColor}` } : { ...style, borderLeft: `3px solid ${priorityColor}` }}
      {...attributes}
      {...listeners}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 cursor-pointer select-none group',
        'hover:shadow-md hover:border-gray-300 transition-all duration-150',
        overlay ? 'shadow-xl rotate-1 opacity-95' : ''
      )}
    >
      <p className="text-[13px] font-medium text-gray-800 leading-snug line-clamp-2 mb-2.5">{req.title}</p>

      {req.tags && req.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {req.tags.slice(0, 3).map((t) => (
            <span
              key={t.id}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: t.color + '18', color: t.color }}
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar user={req.assigned_to} size="sm" />
          {req.due_date && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar size={10} />
              {formatDate(req.due_date)}
            </div>
          )}
        </div>
        {(req.comments?.length || 0) > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <MessageSquare size={10} />
            {req.comments?.length}
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanColumn({
  status, reqs, onCardClick, onAdd, canCreate,
}: {
  status: Status
  reqs: Requirement[]
  onCardClick: (r: Requirement) => void
  onAdd: (s: Status) => void
  canCreate: boolean
}) {
  const cfg = COLUMN_CONFIG[status]

  return (
    <div className={cn('flex flex-col rounded-xl border border-gray-200/80 min-w-[260px] flex-1 max-w-[300px] shadow-sm', cfg.bg)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200/60">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: cfg.dotColor }}
          />
          <span className={cn('text-[12px] font-semibold uppercase tracking-wide', cfg.color)}>
            {cfg.label}
          </span>
          <span className="text-[11px] font-semibold text-gray-400 bg-white/80 border border-gray-200 px-1.5 py-0.5 rounded-full">
            {reqs.length}
          </span>
        </div>
        {canCreate && (
          <button
            onClick={() => onAdd(status)}
            className="p-1 rounded hover:bg-white/70 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto kanban-column">
        <SortableContext items={reqs.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {reqs.map((r) => (
            <KanbanCard key={r.id} req={r} onClick={() => onCardClick(r)} />
          ))}
        </SortableContext>

        {reqs.length === 0 && (
          <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-200 rounded-lg text-[12px] text-gray-400">
            Drop here
          </div>
        )}
      </div>

      {canCreate && (
        <button
          onClick={() => onAdd(status)}
          className="flex items-center gap-1.5 px-3 py-2.5 text-[12px] text-gray-400 hover:text-violet-600 hover:bg-white/60 transition-colors border-t border-gray-200/60 rounded-b-xl"
        >
          <Plus size={13} /> Add requirement
        </button>
      )}
    </div>
  )
}

export default function KanbanPage() {
  const { user } = useAuthStore()
  const canCreate = user?.role === 'admin' || user?.role === 'editor'

  const [activeReq, setActiveReq] = useState<Requirement | null>(null)
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)
  const [addToStatus, setAddToStatus] = useState<Status | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const reqsQuery = useRequirementsQuery({ limit: 200, sort: 'position', dir: 'asc' })
  const { data } = useQuery(reqsQuery)
  const reorderFn = useReorderRequirements()

  const allReqs = data?.data || []

  const columns: Record<Status, Requirement[]> = {
    draft:    allReqs.filter((r) => r.status === 'draft').sort((a, b) => a.position - b.position),
    review:   allReqs.filter((r) => r.status === 'review').sort((a, b) => a.position - b.position),
    approved: allReqs.filter((r) => r.status === 'approved').sort((a, b) => a.position - b.position),
    rejected: allReqs.filter((r) => r.status === 'rejected').sort((a, b) => a.position - b.position),
  }

  const findColumn = useCallback((id: string): Status | null => {
    for (const status of COLUMNS) {
      if (columns[status].some((r) => r.id === id)) return status
    }
    return null
  }, [columns])

  const handleDragStart = (e: DragStartEvent) => {
    const req = allReqs.find((r) => r.id === e.active.id)
    setActiveReq(req || null)
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveReq(null)
    const { active, over } = e
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    const activeCol = findColumn(activeId)
    const overCol = COLUMNS.includes(overId as Status) ? overId as Status : findColumn(overId)

    if (!activeCol || !overCol || activeId === overId) return

    const newItems: { id: string; position: number; status: string }[] = []

    if (activeCol === overCol) {
      const col = [...columns[activeCol]]
      const fromIdx = col.findIndex((r) => r.id === activeId)
      const toIdx = col.findIndex((r) => r.id === overId)
      if (fromIdx === -1 || toIdx === -1) return
      col.splice(fromIdx, 1)
      col.splice(toIdx, 0, allReqs.find((r) => r.id === activeId)!)
      col.forEach((r, i) => newItems.push({ id: r.id, position: i, status: activeCol }))
    } else {
      const sourceCol = columns[activeCol].filter((r) => r.id !== activeId)
      sourceCol.forEach((r, i) => newItems.push({ id: r.id, position: i, status: activeCol }))
      const targetCol = [...columns[overCol]]
      const toIdx = targetCol.findIndex((r) => r.id === overId)
      const movedReq = allReqs.find((r) => r.id === activeId)!
      if (toIdx === -1) targetCol.push(movedReq)
      else targetCol.splice(toIdx, 0, movedReq)
      targetCol.forEach((r, i) => newItems.push({ id: r.id, position: i, status: overCol }))
      newItems.push({ id: activeId, position: toIdx === -1 ? targetCol.length - 1 : toIdx, status: overCol })
    }

    try {
      await reorderFn(newItems)
    } catch {
      toast.error('Failed to save order')
    }
  }

  return (
    <div className="h-full -m-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 h-full overflow-x-auto px-2 py-2">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              reqs={columns[status]}
              onCardClick={setSelectedReq}
              onAdd={setAddToStatus}
              canCreate={canCreate}
            />
          ))}
        </div>
        <DragOverlay>
          {activeReq && <KanbanCard req={activeReq} onClick={() => {}} overlay />}
        </DragOverlay>
      </DndContext>

      {addToStatus && (
        <RequirementModal defaultStatus={addToStatus} onClose={() => setAddToStatus(null)} />
      )}
      {selectedReq && (
        <RequirementPanel requirement={selectedReq} onClose={() => setSelectedReq(null)} />
      )}
    </div>
  )
}
